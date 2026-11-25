import { Check, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Product, ProductCategory } from '../types/shop';
import { formatPricePln } from '../utils/formatters';
import { ResilientImage } from './ResilientImage';

type SortOrder = 'default' | 'price-asc' | 'price-desc';

const CATEGORIES: Array<ProductCategory | 'Wszystkie'> = [
  'Wszystkie',
  'Potrawy',
  'Słodycze i owoce',
  'Tradycje',
  'Wyposażenie',
  'Atrakcje',
];

interface CatalogSectionProps {
  products: Product[];
  isLoading: boolean;
  errorMessage: string | null;
  selectedCategory: ProductCategory | 'Wszystkie';
  onSelectCategory: (category: ProductCategory | 'Wszystkie') => void;
  onRetryFetch: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
}

export function CatalogSection({
  products,
  isLoading,
  errorMessage,
  selectedCategory,
  onSelectCategory,
  onRetryFetch,
  onSelectProduct,
  onQuickAddToCart,
}: CatalogSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const displayedProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter((item) => {
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.shortDescription.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });

    if (sortOrder === 'price-asc') {
      return [...filtered].sort((a, b) => a.pricePln - b.pricePln);
    }
    if (sortOrder === 'price-desc') {
      return [...filtered].sort((a, b) => b.pricePln - a.pricePln);
    }
    return filtered;
  }, [products, searchQuery, sortOrder]);

  const handleQuickAdd = (product: Product) => {
    onQuickAddToCart(product);
    setRecentlyAddedId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedId((current) => (current === product.id ? null : current));
    }, 1200);
  };

  return (
    <section
      id="katalog"
      className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14 border-t border-[#FBBF24]/40"
    >
      <div className="mb-8 overflow-hidden rounded-2xl kitsch-card border-2 border-[#FBBF24]/80 shadow-[0_0_24px_rgba(245,158,11,0.24)]">
        <div className="h-1.5 w-full festive-lights-strip border-b border-[#FBBF24]/50" aria-hidden="true" />
        <div className="p-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight kitsch-gold-text">
              Świąteczny katalog prezentów
            </h2>
            <p className="mt-1.5 text-sm text-[#FEF3C7]/90 tracking-[0.01em]">
              Siedem świątecznych pozycji w katalogu{' '}
              <strong className="text-[#FDE047] font-semibold">Polskie Święta</strong>{' '}
              pobieranych z bazy Supabase.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#FDE047]/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Szukaj w katalogu..."
                aria-label="Szukaj produktu w katalogu"
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm bg-[#1A080B]/80 border border-[#FBBF24]/60 rounded-lg text-[#FFFBEB] placeholder:text-[#FDE68A]/55 focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent"
              />
            </div>

            <label className="sr-only" htmlFor="catalog-sort">
              Sortowanie produktów
            </label>
            <select
              id="catalog-sort"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
              className="px-3 py-2 text-sm bg-[#1A080B]/80 border border-[#FBBF24]/60 rounded-lg text-[#FFFBEB] focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent cursor-pointer"
            >
              <option value="default">Kolejność domyślna</option>
              <option value="price-asc">Cena: od najniższej</option>
              <option value="price-desc">Cena: od najwyższej</option>
            </select>
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filtruj według kategorii"
        className="flex flex-wrap items-center gap-1.5 p-1.5 kitsch-card border-2 border-[#FBBF24]/65 rounded-xl w-fit max-w-full mb-10 shadow-[0_0_16px_rgba(245,158,11,0.18)]"
      >
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                isActive
                  ? 'bg-gradient-to-b from-[#DC2626] to-[#991B1B] text-[#FFFBEB] border border-[#FBBF24] shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'text-[#FDE68A]/90 hover:text-[#FDE047]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {errorMessage ? (
        <div className="kitsch-card border-2 border-[#FBBF24]/70 rounded-xl p-8 text-center shadow-lg">
          <p className="text-sm font-medium text-[#FCA5A5]">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetryFetch}
            className="mt-4 px-4 py-2 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] transition-all cursor-pointer"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="kitsch-card border-2 border-[#FBBF24]/50 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-1.5 w-full festive-lights-strip" />
              <div className="aspect-[4/3] bg-[#0B2B20]" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-24 bg-[#4A1216] rounded" />
                <div className="h-5 w-3/4 bg-[#4A1216] rounded" />
                <div className="h-4 w-full bg-[#4A1216] rounded" />
                <div className="pt-3 flex items-center justify-between">
                  <div className="h-5 w-20 bg-[#4A1216] rounded" />
                  <div className="h-9 w-28 bg-[#4A1216] rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="kitsch-card border-2 border-[#FBBF24]/70 rounded-xl p-10 text-center shadow-lg">
          <p className="text-base font-semibold text-[#FEF3C7]">
            Brak produktów spełniających kryteria
          </p>
          <p className="mt-1 text-sm text-[#FDE68A]/85">
            Wyczyść frazę wyszukiwania lub wybierz inną kategorię.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('Wszystkie');
            }}
            className="mt-5 px-4 py-2 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] transition-all cursor-pointer"
          >
            Pokaż wszystkie produkty
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProducts.map((product) => {
            const isAdded = recentlyAddedId === product.id;
            const isContainedCutout =
              product.slug === 'czekoladowy-mikolaj' ||
              product.slug === 'miska-do-salatki-jarzynowej';
            const imageFitClass = isContainedCutout
              ? 'w-full h-full object-contain bg-white p-2 transition-transform duration-300 group-hover:scale-[1.03]'
              : product.slug === 'garnek-bigosu'
                ? 'w-full h-full object-cover object-[center_35%] transition-transform duration-300 group-hover:scale-[1.03]'
                : product.slug === 'rozmowa-z-nietrzezwym-wujkiem'
                  ? 'w-full h-full object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-[1.03]'
                  : 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]';

            return (
              <article
                key={product.id}
                className="group kitsch-card border-2 border-[#FBBF24]/75 rounded-xl overflow-hidden flex flex-col shadow-[0_4px_22px_rgba(245,158,11,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,158,11,0.38)] hover:border-[#FDE047]"
              >
                <div
                  className="h-1.5 w-full festive-lights-strip border-b border-[#FBBF24]/50"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="block w-full aspect-[4/3] overflow-hidden bg-[#0B2B20] border-b border-[#FBBF24]/35 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F59E0B]"
                >
                  <ResilientImage
                    src={product.imageUrl}
                    alt={product.name}
                    fallbackTitle={product.name}
                    className={imageFitClass}
                  />
                </button>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#FDE68A]/85 tracking-[0.01em]">
                      <span>{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{product.sku}</span>
                    </div>

                    <h3 className="mt-1.5 text-lg font-semibold text-[#FFFBEB] leading-snug">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="text-left hover:text-[#FDE047] hover:underline underline-offset-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] rounded-sm"
                      >
                        {product.name}
                      </button>
                    </h3>

                    <p className="mt-1.5 text-sm text-[#FEF3C7]/85 line-clamp-2 leading-relaxed tracking-[0.01em]">
                      {product.shortDescription}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#FBBF24]/30 flex items-center justify-between gap-3">
                    <span className="text-base font-bold text-[#FDE047] font-mono tabular-nums whitespace-nowrap drop-shadow-xs">
                      {formatPricePln(product.pricePln)}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="px-3 py-2 text-xs font-medium text-[#FEF3C7] hover:text-white hover:bg-[#5F1317]/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                      >
                        Szczegóły
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                          isAdded
                            ? 'bg-gradient-to-b from-[#FDE047] to-[#D97706] text-[#1A080B] border border-[#FFFBEB]'
                            : 'bg-gradient-to-b from-[#DC2626] to-[#991B1B] text-[#FFFBEB] border border-[#FBBF24] hover:from-[#B91C1C] hover:to-[#7F1D1D] shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>Dodano</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 shrink-0 text-[#FDE047]" aria-hidden="true" />
                            <span>Do koszyka</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
