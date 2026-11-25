import { CATALOG_PRODUCTS } from '../data/catalog';
import { supabase } from '../lib/supabase';
import { Product, ProductCategory, ProductSpec } from '../types/shop';

export interface FetchCatalogOptions {
  category?: ProductCategory | 'Wszystkie';
  searchQuery?: string;
}

/**
 * Struktura wiersza z tabeli `public.products` zdefiniowanej w `supabase/schema.sql`.
 */
export interface SupabaseProductRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price_pln: number | string;
  short_description: string;
  description: string;
  image_url: string;
  stock: number;
  variants: string[];
  specs: ProductSpec[];
  is_active: boolean;
}

export function mapSupabaseProductRow(row: SupabaseProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.category,
    pricePln: Number(row.price_pln),
    shortDescription: row.short_description,
    description: row.description,
    imageUrl: row.image_url,
    stock: row.stock,
    variants: Array.isArray(row.variants) ? row.variants : [],
    specs: Array.isArray(row.specs) ? row.specs : [],
  };
}

/**
 * Pobiera katalog produktów z Supabase (przez klucz publiczny anon i politykę RLS SELECT),
 * a gdy zmienne `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` nie są jeszcze ustawione,
 * korzysta z lokalnej listy sześciu produktów testowych.
 */
export async function fetchCatalog(options?: FetchCatalogOptions): Promise<Product[]> {
  if (supabase) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('price_pln', { ascending: true });

    if (options?.category && options.category !== 'Wszystkie') {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error('Nie udało się pobrać katalogu z Supabase.');
    }

    let items = ((data ?? []) as SupabaseProductRow[]).map(mapSupabaseProductRow);

    if (options?.searchQuery && options.searchQuery.trim() !== '') {
      const normalized = options.searchQuery.trim().toLowerCase();
      items = items.filter(
        (product) =>
          product.name.toLowerCase().includes(normalized) ||
          product.shortDescription.toLowerCase().includes(normalized) ||
          product.category.toLowerCase().includes(normalized) ||
          product.sku.toLowerCase().includes(normalized)
      );
    }

    return items;
  }

  await new Promise((resolve) => setTimeout(resolve, 120));

  let items = [...CATALOG_PRODUCTS];

  if (options?.category && options.category !== 'Wszystkie') {
    items = items.filter((product) => product.category === options.category);
  }

  if (options?.searchQuery && options.searchQuery.trim() !== '') {
    const normalized = options.searchQuery.trim().toLowerCase();
    items = items.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.shortDescription.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized) ||
        product.sku.toLowerCase().includes(normalized)
    );
  }

  return items;
}

/**
 * Pobiera pojedynczy produkt po identyfikatorze lub slugu.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error) {
      throw new Error('Nie udało się pobrać szczegółów produktu z Supabase.');
    }

    return data ? mapSupabaseProductRow(data as SupabaseProductRow) : null;
  }

  await new Promise((resolve) => setTimeout(resolve, 60));
  return CATALOG_PRODUCTS.find((product) => product.id === id || product.slug === id) ?? null;
}
