-- ============================================================================
-- Skład Rzeczy — Schemat bazy danych dla Supabase (PostgreSQL + RLS)
-- Tabele: public.admin_users, public.products, public.orders, public.order_items
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 0. Tabela administratorów oraz funkcja pomocnicza public.is_admin()
-- Zastrzega edycję katalogu produktów wyłącznie dla administracji.
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    );
$$;

-- ----------------------------------------------------------------------------
-- 1. Tabela produktów (public.products)
-- Odczyt publiczny dla aktywnego katalogu; zapis/edycja/usuwanie wyłącznie dla administracji
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name text not null,
  category text not null,
  price_pln numeric(10, 2) not null check (price_pln >= 0),
  short_description text not null,
  description text not null,
  image_url text not null,
  stock integer not null default 0 check (stock >= 0),
  variants jsonb not null default '[]'::jsonb,
  specs jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_is_active on public.products (is_active);

-- Automatyczna aktualizacja kolumny updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row
  execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Tabela zamówień (public.orders)
-- Powiązana z użytkownikiem Supabase Auth (auth.users)
-- Dostęp wyłącznie dla właściciela (auth.uid() = user_id)
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_name text not null,
  delivery_method text not null,
  delivery_price_pln numeric(10, 2) not null default 0 check (delivery_price_pln >= 0),
  subtotal_pln numeric(10, 2) not null default 0 check (subtotal_pln >= 0),
  total_pln numeric(10, 2) not null default 0 check (total_pln >= 0),
  status text not null default 'simulated'
    check (status in ('simulated', 'pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- ----------------------------------------------------------------------------
-- 3. Tabela pozycji zamówienia (public.order_items)
-- Powiązana z zamówieniem (orders) i produktem (products)
-- Zapisuje ilość oraz cenę jednostkową z chwili złożenia zamówienia (unit_price_pln)
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant text not null default 'Standard',
  quantity integer not null check (quantity > 0),
  unit_price_pln numeric(10, 2) not null check (unit_price_pln >= 0),
  line_total_pln numeric(10, 2) generated always as (quantity * unit_price_pln) stored,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- Zabezpieczenie integralności ceny jednostkowej z chwili zamówienia po stronie bazy
create or replace function public.snapshot_order_item_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price numeric(10, 2);
  v_active boolean;
begin
  select p.price_pln, p.is_active
    into v_price, v_active
    from public.products p
   where p.id = new.product_id;

  if not found or not v_active then
    raise exception 'Produkt o ID % nie jest dostępny w katalogu.', new.product_id;
  end if;

  new.unit_price_pln := v_price;
  return new;
end;
$$;

drop trigger if exists trg_order_items_snapshot_price on public.order_items;
create trigger trg_order_items_snapshot_price
  before insert on public.order_items
  for each row
  execute function public.snapshot_order_item_price();

create or replace function public.recalculate_order_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric(10, 2);
begin
  select coalesce(sum(oi.line_total_pln), 0)
    into v_subtotal
    from public.order_items oi
   where oi.order_id = new.order_id;

  update public.orders o
     set subtotal_pln = v_subtotal,
         total_pln = v_subtotal + o.delivery_price_pln
   where o.id = new.order_id;

  return new;
end;
$$;

drop trigger if exists trg_order_items_recalculate_totals on public.order_items;
create trigger trg_order_items_recalculate_totals
  after insert on public.order_items
  for each row
  execute function public.recalculate_order_totals();

-- ----------------------------------------------------------------------------
-- 4. Transakcyjna funkcja RPC tworzenia zamówienia (public.create_order)
-- Ustala właściciela z sesji (auth.uid()), sprawdza ilości, pobiera aktualne
-- ceny z katalogu i zapisuje nagłówek oraz pozycje w jednej transakcji.
-- ----------------------------------------------------------------------------
create or replace function public.create_order(
  p_customer_name text,
  p_delivery_method text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_customer_name text;
  v_delivery_price numeric(10, 2);
  v_subtotal numeric(10, 2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_variant text;
  v_quantity integer;
  v_total_qty_for_product integer;
  v_product record;
begin
  if v_user_id is null then
    raise exception 'Wymagane jest zalogowanie do konta, aby złożyć zamówienie.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Koszyk zamówienia nie może być pusty.';
  end if;

  if jsonb_array_length(p_items) > 50 then
    raise exception 'Przekroczono maksymalną liczbę pozycji w zamówieniu.';
  end if;

  v_delivery_price := case p_delivery_method
    when 'paczkomat' then 0.00
    when 'kurier' then 15.00
    when 'atelier' then 0.00
    else null
  end;

  if v_delivery_price is null then
    raise exception 'Wybrano nieprawidłową metodę dostawy.';
  end if;

  v_customer_name := nullif(trim(coalesce(p_customer_name, '')), '');
  if v_customer_name is null then
    v_customer_name := 'Klient';
  elsif char_length(v_customer_name) > 80 then
    v_customer_name := left(v_customer_name, 80);
  end if;

  v_order_number :=
    '#SYM-' || to_char(now(), 'YYYY') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    order_number,
    user_id,
    customer_name,
    delivery_method,
    delivery_price_pln,
    subtotal_pln,
    total_pln,
    status
  )
  values (
    v_order_number,
    v_user_id,
    v_customer_name,
    p_delivery_method,
    v_delivery_price,
    0,
    v_delivery_price,
    'simulated'
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    begin
      v_product_id := (v_item ->> 'product_id')::uuid;
    exception when others then
      raise exception 'Nieprawidłowy identyfikator produktu w koszyku.';
    end;

    if coalesce(v_item ->> 'quantity', '') !~ '^[0-9]+$' then
      raise exception 'Ilość produktu musi być dodatnią liczbą całkowitą.';
    end if;

    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity <= 0 then
      raise exception 'Ilość produktu musi być większa od zera.';
    end if;

    v_variant := coalesce(nullif(trim(v_item ->> 'variant'), ''), 'Standard');
    if char_length(v_variant) > 80 then
      v_variant := left(v_variant, 80);
    end if;

    select p.id, p.name, p.price_pln, p.stock, p.is_active
      into v_product
      from public.products p
     where p.id = v_product_id
       for share;

    if not found or not v_product.is_active then
      raise exception 'Wybrany produkt nie jest dostępny w katalogu.';
    end if;

    select coalesce(sum((el ->> 'quantity')::integer), 0)
      into v_total_qty_for_product
      from jsonb_array_elements(p_items) el
     where (el ->> 'product_id')::uuid = v_product_id;

    if v_total_qty_for_product > v_product.stock then
      raise exception 'Niewystarczająca ilość produktu "%" (dostępne: % szt.).', v_product.name, v_product.stock;
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      variant,
      quantity,
      unit_price_pln
    )
    values (
      v_order_id,
      v_product.id,
      v_variant,
      v_quantity,
      v_product.price_pln
    );

    v_subtotal := v_subtotal + (v_product.price_pln * v_quantity);
  end loop;

  update public.orders
     set subtotal_pln = v_subtotal,
         total_pln = v_subtotal + v_delivery_price
   where id = v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.create_order(text, text, jsonb) from public, anon;
grant execute on function public.create_order(text, text, jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS) i uprawnienia dla wszystkich tabel w API
-- ----------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- KATALOG (public.products):
-- Odczyt dostępny publicznie (anon + authenticated) dla aktywnych produktów
drop policy if exists "Publiczny odczyt aktywnych produktów" on public.products;
create policy "Publiczny odczyt aktywnych produktów"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

-- Edycja katalogu (INSERT, UPDATE, DELETE) zastrzeżona wyłącznie dla administracji
drop policy if exists "Administracja dodaje produkty" on public.products;
create policy "Administracja dodaje produkty"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Administracja aktualizuje produkty" on public.products;
create policy "Administracja aktualizuje produkty"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Administracja usuwa produkty" on public.products;
create policy "Administracja usuwa produkty"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- HISTORIA ZAMÓWIEŃ (public.orders) ORAZ POZYCJE (public.order_items):
-- Zablokowanie bezpośredniego zapisu (INSERT/UPDATE/DELETE) przez klienta —
-- jedyna droga utworzenia zamówienia prowadzi przez funkcję public.create_order.
revoke insert, update, delete on public.orders, public.order_items from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;

drop policy if exists "Użytkownik tworzy własne zamówienia" on public.orders;
drop policy if exists "Użytkownik dodaje pozycje do własnych zamówień" on public.order_items;

drop policy if exists "Użytkownik odczytuje własne zamówienia" on public.orders;
create policy "Użytkownik odczytuje własne zamówienia"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Użytkownik odczytuje pozycje własnych zamówień" on public.order_items;
create policy "Użytkownik odczytuje pozycje własnych zamówień"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );
