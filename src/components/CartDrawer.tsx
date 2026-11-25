import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DELIVERY_METHODS } from '../data/catalog';
import { AuthUser, CartItem, DeliveryMethod, DeliveryMethodId } from '../types/shop';
import { formatPricePln } from '../utils/formatters';
import type { AuthMode } from './AuthModal';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  currentUser: AuthUser | null;
  isSubmittingOrder?: boolean;
  orderError?: string | null;
  onClose: () => void;
  onOpenAuth: (mode: AuthMode) => void;
  onUpdateQuantity: (productId: string, variant: string, newQuantity: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onClearCart: () => void;
  onConfirmSimulation: (customerName: string, deliveryMethod: DeliveryMethod) => void;
}

export function CartDrawer({
  isOpen,
  items,
  currentUser,
  isSubmittingOrder = false,
  orderError = null,
  onClose,
  onOpenAuth,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onConfirmSimulation,
}: CartDrawerProps) {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<DeliveryMethodId>('paczkomat');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (currentUser?.fullName) {
      setCustomerName(currentUser.fullName);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotalPln = items.reduce(
    (sum, item) => sum + item.product.pricePln * item.quantity,
    0
  );
  const deliveryMethod =
    DELIVERY_METHODS.find((method) => method.id === selectedDeliveryId) ?? DELIVERY_METHODS[0];
  const deliveryPln = items.length > 0 ? deliveryMethod.pricePln : 0;
  const totalPln = subtotalPln + deliveryPln;
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitSimulation = (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0 || isSubmittingOrder) return;
    const resolvedName = customerName.trim() || currentUser?.fullName || 'Klient testowy';
    onConfirmSimulation(resolvedName, deliveryMethod);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div
        className="fixed inset-0 bg-[#04120D]/70 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative w-full max-w-lg kitsch-card text-[#FFFBEB] h-full shadow-[0_0_40px_rgba(245,158,11,0.35)] flex flex-col border-l-2 border-[#FBBF24]">
        <div className="h-2 w-full festive-lights-strip border-b border-[#FBBF24]/60" aria-hidden="true" />
        <div className="px-6 py-5 festive-header-kitsch border-b-2 border-[#FBBF24]/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 id="cart-drawer-title" className="text-lg font-bold kitsch-gold-text">
              Świąteczny koszyk
            </h2>
            <span className="text-xs font-mono tabular-nums text-[#FDE047]">
              {totalCount} szt.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="px-2.5 py-1.5 text-xs font-medium text-[#FDE68A] hover:text-[#FDE047] transition-colors cursor-pointer"
              >
                Wyczyść
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij koszyk"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[#FDE047] hover:text-white hover:bg-[#5F1317]/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#DC2626] to-[#7F1D1D] border-2 border-[#FBBF24] shadow-[0_0_18px_rgba(245,158,11,0.4)] flex items-center justify-center text-[#FDE047] mb-4">
              <ShoppingBag className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold kitsch-gold-text">Twój koszyk jest pusty</p>
            <p className="mt-1.5 text-sm text-[#FEF3C7]/85 max-w-xs">
              Dodaj wybrane upominki z katalogu Polskich Świąt, aby przetestować zmianę ilości
              oraz złożenie zamówienia.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-5 py-2.5 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
            >
              Przejdź do katalogu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitSimulation} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-[#FBBF24]/30">
              {items.map((item) => {
                const lineTotal = item.product.pricePln * item.quantity;
                return (
                  <div
                    key={`${item.product.id}-${item.variant}`}
                    className="py-4 first:pt-0 last:pb-0 flex gap-4"
                  >
                    <div className="w-20 aspect-[4/3] rounded-lg overflow-hidden bg-[#082118] border border-[#FBBF24]/55 shrink-0">
                      <ResilientImage
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fallbackTitle={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#FFFBEB] truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-[#FDE68A]/80 mt-0.5">
                            Wariant: {item.variant} · {formatPricePln(item.product.pricePln)} / szt.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id, item.variant)}
                          aria-label={`Usuń ${item.product.name} z koszyka`}
                          className="p-1.5 text-[#FDE68A]/75 hover:text-[#FCA5A5] rounded-md transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center border border-[#FBBF24]/60 rounded-lg bg-[#1A080B]/80 h-8">
                          <button
                            type="button"
                            aria-label={`Zmniejsz ilość: ${item.product.name}`}
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.variant,
                                item.quantity - 1
                              )
                            }
                            className="w-8 h-full inline-flex items-center justify-center text-[#FEF3C7] hover:text-[#FDE047] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold font-mono tabular-nums text-[#FFFBEB]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Zwiększ ilość: ${item.product.name}`}
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.variant,
                                Math.min(item.product.stock, item.quantity + 1)
                              )
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-full inline-flex items-center justify-center text-[#FEF3C7] hover:text-[#FDE047] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <span className="text-sm font-bold font-mono tabular-nums text-[#FDE047]">
                          {formatPricePln(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-5 space-y-4">
                {currentUser ? (
                  <div className="p-3 rounded-lg bg-[#071F17]/80 border border-[#FBBF24]/50 text-xs text-[#FEF3C7]">
                    Zalogowano jako <strong className="text-[#FDE047]">{currentUser.fullName}</strong>{' '}
                    ({currentUser.email}). Zamówienie zostanie zapisane na Twoim koncie.
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-[#5F1317]/85 border border-[#FBBF24]/60 text-xs text-[#FEF3C7] space-y-2">
                    <p className="font-medium text-[#FFFBEB]">
                      Aby złożyć zamówienie, musisz być zalogowany.
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onOpenAuth('login')}
                        className="font-semibold text-[#FDE047] underline underline-offset-4 hover:text-white cursor-pointer"
                      >
                        Zaloguj się
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenAuth('register')}
                        className="font-semibold text-[#FFFBEB] underline underline-offset-4 hover:text-[#FDE047] cursor-pointer"
                      >
                        Utwórz nowe konto
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="simulation-customer-name"
                    className="block text-xs font-semibold text-[#FEF3C7] mb-1.5"
                  >
                    Odbiorca symulacji (opcjonalnie)
                  </label>
                  <input
                    id="simulation-customer-name"
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="np. Jan Kowalski"
                    className="w-full px-3 py-2 text-sm bg-[#1A080B]/80 border border-[#FBBF24]/55 rounded-lg text-[#FFFBEB] placeholder:text-[#FDE68A]/45 focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#FEF3C7] mb-2">
                    Metoda dostawy (symulacja)
                  </span>
                  <div className="space-y-2">
                    {DELIVERY_METHODS.map((method) => {
                      const isChecked = method.id === selectedDeliveryId;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-start justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#FBBF24] bg-[#5F1317]/65 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'border-[#FBBF24]/35 bg-[#1A080B]/65 hover:border-[#FBBF24]/70'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="radio"
                              name="deliveryMethod"
                              value={method.id}
                              checked={isChecked}
                              onChange={() => setSelectedDeliveryId(method.id)}
                              className="mt-1 accent-[#FBBF24]"
                            />
                            <div>
                              <span className="block text-xs font-semibold text-[#FFFBEB]">
                                {method.label}
                              </span>
                              <span className="block text-xs text-[#FDE68A]/75 mt-0.5">
                                {method.description}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-semibold font-mono tabular-nums text-[#FDE047] whitespace-nowrap">
                            {formatPricePln(method.pricePln)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t-2 border-[#FBBF24]/70 festive-header-kitsch space-y-3">
              {orderError && (
                <div
                  role="alert"
                  className="p-2.5 rounded-lg bg-[#450A0A] border border-[#EF4444]/60 text-xs font-medium text-[#FEE2E2]"
                >
                  {orderError}
                </div>
              )}

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-[#FDE68A]/85">
                  <span>Produkty ({totalCount})</span>
                  <span className="font-mono tabular-nums">{formatPricePln(subtotalPln)}</span>
                </div>
                <div className="flex items-center justify-between text-[#FDE68A]/85">
                  <span>Dostawa</span>
                  <span className="font-mono tabular-nums">{formatPricePln(deliveryPln)}</span>
                </div>
                <div className="pt-2 border-t border-[#FBBF24]/40 flex items-center justify-between text-base font-bold text-[#FFFBEB]">
                  <span>Suma</span>
                  <span className="font-mono tabular-nums text-[#FDE047]">
                    {formatPricePln(totalPln)}
                  </span>
                </div>
              </div>

              {currentUser ? (
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-3 px-4 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] shadow-[0_0_16px_rgba(245,158,11,0.4)] disabled:opacity-60 transition-all cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0A0E] focus-visible:ring-[#F59E0B]"
                >
                  {isSubmittingOrder
                    ? 'Składanie zamówienia...'
                    : 'Złóż zamówienie (symulacja)'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="w-full py-3 px-4 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0A0E] focus-visible:ring-[#F59E0B]"
                >
                  Zaloguj się, aby złożyć zamówienie
                </button>
              )}
              <p className="text-[11px] text-center text-[#FDE68A]/75">
                Tryb symulacji — złożenie zamówienia wymaga konta i nie obciąża żadnej karty.
              </p>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
