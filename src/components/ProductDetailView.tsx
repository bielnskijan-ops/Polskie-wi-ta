import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Product } from '../types/shop';
import { formatPricePln } from '../utils/formatters';
import { ResilientImage } from './ResilientImage';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  onBackToCatalog: () => void;
  onAddToCart: (product: Product, variant: string, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductDetailView({
  product,
  relatedProducts,
  onBackToCatalog,
  onAddToCart,
  onSelectProduct,
}: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>(product.variants[0] ?? 'Standard');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  useEffect(() => {
    setSelectedVariant(product.variants[0] ?? 'Standard');
    setQuantity(1);
    setAddedFeedback(false);
  }, [product]);

  const handleAdd = () => {
    onAddToCart(product, selectedVariant, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1400);
  };

  const detailImageClass =
    product.slug === 'czekoladowy-mikolaj' ||
    product.slug === 'miska-do-salatki-jarzynowej'
      ? 'w-full h-full object-contain bg-white p-3'
      : product.slug === 'garnek-bigosu'
        ? 'w-full h-full object-cover object-[center_35%]'
        : product.slug === 'rozmowa-z-nietrzezwym-wujkiem'
          ? 'w-full h-full object-cover object-[center_20%]'
          : 'w-full h-full object-cover';

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
      <div className="mb-8">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-[#FDE047] kitsch-card border border-[#FBBF24]/65 rounded-lg hover:border-[#FDE047] hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Wróć do katalogu Polskich Świąt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-7 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl bg-[#0B2B20] border-2 border-[#FBBF24] shadow-[0_0_28px_rgba(245,158,11,0.3)]">
            <div className="h-2 w-full festive-lights-strip border-b border-[#FBBF24]/60" aria-hidden="true" />
            <div className="aspect-[4/3]">
              <ResilientImage
                src={product.imageUrl}
                alt={product.name}
                fallbackTitle={product.name}
                className={detailImageClass}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 kitsch-card border-2 border-[#FBBF24]/80 rounded-2xl overflow-hidden shadow-[0_0_28px_rgba(245,158,11,0.25)]">
          <div className="h-2 w-full festive-lights-strip border-b border-[#FBBF24]/60" aria-hidden="true" />
          <div className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#FDE68A]/85 tracking-[0.01em]">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{product.sku}</span>
              <span aria-hidden="true">·</span>
              <span>Dostępne: {product.stock} szt.</span>
            </div>

            <h1 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight kitsch-gold-text leading-tight text-balance">
              {product.name}
            </h1>

            <div className="mt-4 pb-6 border-b border-[#FBBF24]/35 flex items-baseline justify-between gap-4">
              <span className="text-2xl font-bold text-[#FDE047] font-mono tabular-nums drop-shadow-xs">
                {formatPricePln(product.pricePln)}
              </span>
              <span className="text-xs text-[#FDE68A]/85">Cena świąteczna brutto</span>
            </div>

            <p className="mt-6 text-sm lg:text-base text-[#FEF3C7]/90 leading-relaxed tracking-[0.01em]">
              {product.description}
            </p>

            {product.variants.length > 0 && (
              <div className="mt-6">
                <span className="block text-xs font-semibold text-[#FEF3C7] mb-2.5">
                  Wariant
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant === variant;
                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#DC2626] to-[#991B1B] text-[#FFFBEB] border-[#FBBF24] shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                            : 'bg-[#1A080B]/70 text-[#FDE68A] border-[#FBBF24]/45 hover:border-[#FDE047]'
                        }`}
                      >
                        {variant}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="inline-flex items-center justify-between border border-[#FBBF24]/60 rounded-lg bg-[#1A080B]/80 h-11 px-1">
                <button
                  type="button"
                  aria-label="Zmniejsz ilość"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 inline-flex items-center justify-center text-[#FEF3C7] hover:text-[#FDE047] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed rounded-md"
                >
                  <Minus className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="w-10 text-center text-sm font-semibold font-mono tabular-nums text-[#FFFBEB]">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Zwiększ ilość"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-9 h-9 inline-flex items-center justify-center text-[#FEF3C7] hover:text-[#FDE047] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed rounded-md"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 h-11 inline-flex items-center justify-center gap-2 px-5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2B20] focus-visible:ring-[#F59E0B] ${
                  addedFeedback
                    ? 'bg-gradient-to-b from-[#FDE047] to-[#D97706] text-[#1A080B] border-2 border-[#FFFBEB]'
                    : 'bg-gradient-to-b from-[#DC2626] to-[#991B1B] text-[#FFFBEB] hover:from-[#B91C1C] hover:to-[#7F1D1D] border-2 border-[#FBBF24] shadow-[0_0_16px_rgba(245,158,11,0.4)]'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Dodano do koszyka</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 shrink-0 text-[#FDE047]" aria-hidden="true" />
                    <span>
                      Dodaj do koszyka · {formatPricePln(product.pricePln * quantity)}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#FBBF24]/35">
              <h2 className="text-sm font-semibold text-[#FDE047] mb-3">
                Specyfikacja produktu
              </h2>
              <dl className="divide-y divide-[#FBBF24]/25">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="py-2.5 flex items-baseline justify-between gap-4 text-sm"
                  >
                    <dt className="text-[#FDE68A]/80 shrink-0">{spec.label}</dt>
                    <dd className="text-[#FFFBEB] font-medium text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-[#FBBF24]/40">
          <h2 className="text-2xl font-bold kitsch-gold-text mb-6">
            Pozostałe świąteczne propozycje
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectProduct(item)}
                className="group text-left kitsch-card border-2 border-[#FBBF24]/65 rounded-xl overflow-hidden flex items-center gap-4 p-3 hover:border-[#FDE047] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              >
                <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden bg-[#0B2B20] border border-[#FBBF24]/45 shrink-0">
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.name}
                    fallbackTitle={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#FDE68A]/80">{item.category}</p>
                  <p className="text-sm font-semibold text-[#FFFBEB] truncate mt-0.5">
                    {item.name}
                  </p>
                  <p className="text-sm font-mono tabular-nums font-bold text-[#FDE047] mt-1">
                    {formatPricePln(item.pricePln)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
