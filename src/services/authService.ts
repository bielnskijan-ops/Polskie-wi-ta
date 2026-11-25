import type { User as SupabaseUser } from '@supabase/supabase-js';
import { DELIVERY_METHODS } from '../data/catalog';
import { supabase } from '../lib/supabase';
import type {
  AuthUser,
  CartItem,
  DeliveryMethodId,
  SimulationOrder,
  SimulationOrderItem,
} from '../types/shop';

export interface AuthSessionResponse {
  token: string | null;
  user: AuthUser | null;
  requiresEmailConfirmation?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateOrderPayload {
  customerName: string;
  deliveryMethodId: DeliveryMethodId;
  items: CartItem[];
}

interface SupabaseOrderItemJoinedRow {
  product_id: string;
  variant: string;
  quantity: number;
  unit_price_pln: number | string;
  line_total_pln: number | string;
  products?: {
    sku: string;
    name: string;
  } | null;
}

interface SupabaseOrderRow {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  delivery_method: string;
  delivery_price_pln: number | string;
  subtotal_pln: number | string;
  total_pln: number | string;
  created_at: string;
  order_items?: SupabaseOrderItemJoinedRow[];
}

export function mapSupabaseUser(user: SupabaseUser): AuthUser {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawName =
    typeof metadata.full_name === 'string' && metadata.full_name.trim().length > 0
      ? metadata.full_name.trim()
      : user.email?.split('@')[0] || 'Użytkownik';

  return {
    id: user.id,
    fullName: rawName,
    email: user.email ?? '',
    createdAt: user.created_at,
  };
}

function mapSupabaseOrderRow(row: SupabaseOrderRow): SimulationOrder {
  const matchedMethod =
    DELIVERY_METHODS.find((m) => m.id === row.delivery_method || m.label === row.delivery_method) ??
    {
      id: 'paczkomat' as DeliveryMethodId,
      label: row.delivery_method,
      description: 'Dostawa zapisana w zamówieniu',
      pricePln: Number(row.delivery_price_pln),
    };

  const items: SimulationOrderItem[] = (row.order_items ?? []).map((item) => ({
    productId: item.product_id,
    sku: item.products?.sku ?? 'SKU',
    name: item.products?.name ?? 'Produkt',
    variant: item.variant,
    unitPricePln: Number(item.unit_price_pln),
    quantity: item.quantity,
    lineTotalPln: Number(item.line_total_pln),
  }));

  return {
    orderNumber: row.order_number,
    createdAt: row.created_at,
    userId: row.user_id,
    customerName: row.customer_name,
    deliveryMethod: matchedMethod,
    items,
    subtotalPln: Number(row.subtotal_pln),
    deliveryPln: Number(row.delivery_price_pln),
    totalPln: Number(row.total_pln),
  };
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    if (typeof data?.error === 'string' && data.error.trim().length > 0) {
      return data.error;
    }
  } catch {
    // Ignorujemy błąd parsowania treści błędu
  }
  return fallback;
}

/**
 * Rejestracja konta użytkownika przez Supabase Auth (lub lokalny endpoint podglądu).
 */
export async function registerAccount(payload: RegisterPayload): Promise<AuthSessionResponse> {
  if (supabase) {
    const emailRedirectTo =
      typeof window !== 'undefined' ? window.location.origin : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo,
        data: {
          full_name: payload.fullName,
        },
      },
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      const code = (error as { code?: string }).code ?? '';
      if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
        throw new Error(
          'Przekroczono limit wysyłki e-maili w Supabase (domyślnie 2 na godzinę). Wyłącz „Confirm email” w Authentication → Providers → Email w panelu Supabase lub spróbuj później.'
        );
      }
      if (code === 'user_already_exists' || msg.includes('already registered')) {
        throw new Error('Konto z tym adresem e-mail już istnieje. Zaloguj się w zakładce obok.');
      }
      if (code === 'signup_disabled' || msg.includes('signups not allowed')) {
        throw new Error('Rejestracja nowych kont jest wyłączona w ustawieniach Supabase Auth.');
      }
      if (msg.includes('sending confirmation email') || msg.includes('smtp')) {
        throw new Error(
          'Supabase nie mógł wysłać e-maila potwierdzającego. Wyłącz „Confirm email” w Authentication → Providers → Email w panelu Supabase.'
        );
      }
      throw new Error(error.message || 'Nie udało się utworzyć konta w Supabase Auth.');
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error(
        'Konto z tym adresem e-mail już istnieje (albo oczekuje na potwierdzenie). Spróbuj się zalogować.'
      );
    }

    if (!data.session && data.user) {
      return {
        token: null,
        user: null,
        requiresEmailConfirmation: true,
      };
    }

    return {
      token: data.session?.access_token ?? null,
      user: data.user ? mapSupabaseUser(data.user) : null,
      requiresEmailConfirmation: false,
    };
  }

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Nie udało się utworzyć konta.'));
  }

  return (await response.json()) as AuthSessionResponse;
}

/**
 * Logowanie użytkownika przez Supabase Auth (lub lokalny endpoint podglądu).
 */
export async function loginWithPassword(payload: LoginPayload): Promise<AuthSessionResponse> {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      const code = (error as { code?: string }).code ?? '';
      if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
        throw new Error(
          'Konto nie zostało jeszcze potwierdzone e-mailem. Kliknij link ze skrzynki albo wyłącz „Confirm email” w Authentication → Providers → Email w Supabase.'
        );
      }
      if (code === 'over_request_rate_limit' || msg.includes('rate limit')) {
        throw new Error('Zbyt wiele prób logowania. Odczekaj chwilę i spróbuj ponownie.');
      }
      throw new Error('Nieprawidłowy adres e-mail lub hasło.');
    }

    return {
      token: data.session?.access_token ?? null,
      user: data.user ? mapSupabaseUser(data.user) : null,
    };
  }

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Nie udało się zalogować.'));
  }

  return (await response.json()) as AuthSessionResponse;
}

/**
 * Wylogowanie użytkownika z Supabase Auth lub lokalnej sesji.
 */
export async function logoutSession(token: string | null): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
    return;
  }

  if (!token) return;
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Tworzy zamówienie oraz jego pozycje w jednej transakcji przez funkcję bazodanową `create_order`
 * (przekazując wyłącznie ID produktów i ilości) lub przez lokalny endpoint podglądu.
 */
export async function createAuthenticatedOrder(
  token: string,
  payload: CreateOrderPayload
): Promise<SimulationOrder> {
  if (supabase) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Sesja wygasła. Zaloguj się ponownie.');
    }

    const rpcItems = payload.items.map((item) => ({
      product_id: item.product.id,
      variant: item.variant,
      quantity: item.quantity,
    }));

    const { data: orderId, error: rpcError } = await supabase.rpc('create_order', {
      p_customer_name: payload.customerName,
      p_delivery_method: payload.deliveryMethodId,
      p_items: rpcItems,
    });

    if (rpcError || !orderId) {
      throw new Error(
        rpcError?.message || 'Nie udało się zapisać zamówienia w bazie danych.'
      );
    }

    const { data: fullOrder, error: fetchError } = await supabase
      .from('orders')
      .select(
        '*, order_items(product_id, variant, quantity, unit_price_pln, line_total_pln, products(sku, name))'
      )
      .eq('id', orderId)
      .single();

    if (fetchError || !fullOrder) {
      throw new Error('Zamówienie zapisano, ale nie udało się pobrać potwierdzenia.');
    }

    return mapSupabaseOrderRow(fullOrder as SupabaseOrderRow);
  }

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customerName: payload.customerName,
      deliveryMethodId: payload.deliveryMethodId,
      items: payload.items.map((item) => ({
        productId: item.product.id,
        variant: item.variant,
        quantity: item.quantity,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, 'Nie udało się zapisać symulacji zamówienia.')
    );
  }

  const data = (await response.json()) as { order: SimulationOrder };
  return data.order;
}

/**
 * Pobiera historię zamówień i ich pozycji wyłącznie dla zalogowanego właściciela (RLS).
 */
export async function fetchUserOrders(token: string): Promise<SimulationOrder[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(product_id, variant, quantity, unit_price_pln, line_total_pln, products(sku, name))')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Nie udało się pobrać historii zamówień z Supabase.');
    }

    return ((data ?? []) as SupabaseOrderRow[]).map(mapSupabaseOrderRow);
  }

  const response = await fetch('/api/orders', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      await parseErrorMessage(response, 'Nie udało się pobrać historii zamówień.')
    );
  }

  const data = (await response.json()) as { orders: SimulationOrder[] };
  return data.orders;
}
