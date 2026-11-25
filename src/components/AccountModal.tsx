import { LogOut, PackageCheck, X } from 'lucide-react';
import { useEffect } from 'react';
import type { AuthUser, SimulationOrder } from '../types/shop';
import { formatOrderTimestamp, formatPricePln } from '../utils/formatters';

interface AccountModalProps {
  isOpen: boolean;
  user: AuthUser | null;
  orders: SimulationOrder[];
  isLoadingOrders: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSelectOrderReceipt: (order: SimulationOrder) => void;
}

export function AccountModal({
  isOpen,
  user,
  orders,
  isLoadingOrders,
  onClose,
  onLogout,
  onSelectOrderReceipt,
}: AccountModalProps) {
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

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <div
        className="fixed inset-0 bg-[#04120D]/75 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl kitsch-card border-2 border-[#FBBF24] rounded-2xl shadow-[0_0_36px_rgba(245,158,11,0.35)] overflow-hidden max-h-[88vh] flex flex-col text-[#FFFBEB]">
        <div className="h-2 w-full festive-lights-strip border-b border-[#FBBF24]/60" aria-hidden="true" />
        <div className="px-6 py-5 festive-header-kitsch border-b-2 border-[#FBBF24]/70 flex items-center justify-between gap-4">
          <div>
            <h2 id="account-modal-title" className="text-lg font-bold kitsch-gold-text">
              Moje konto · Polskie Święta
            </h2>
            <p className="text-xs text-[#FDE68A]/85 mt-0.5">
              {user.fullName} · {user.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border border-[#FBBF24] hover:from-[#B91C1C] hover:to-[#7F1D1D] rounded-lg transition-all whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FDE047]" aria-hidden="true" />
              <span>Wyloguj się</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij panel konta"
              className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#FDE047] hover:text-white hover:bg-[#5F1317]/80 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1A080B]/70 border border-[#FBBF24]/50 rounded-xl p-4 text-sm">
            <div>
              <span className="block text-xs text-[#FDE68A]/80">Zalogowany użytkownik</span>
              <span className="font-semibold text-[#FFFBEB] mt-0.5 block">
                {user.fullName}
              </span>
            </div>
            <div>
              <span className="block text-xs text-[#FDE68A]/80">Identyfikator konta</span>
              <span className="font-mono text-xs text-[#FDE047] mt-1 block truncate">
                {user.id}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <h3 className="text-sm font-semibold text-[#FDE047]">
                Historia symulowanych zamówień ({orders.length})
              </h3>
            </div>

            {isLoadingOrders ? (
              <div className="py-8 text-center text-sm text-[#FDE68A]/80">
                Pobieranie zamówień...
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-[#FBBF24]/50 bg-[#1A080B]/65 rounded-xl p-8 text-center">
                <PackageCheck
                  className="w-7 h-7 text-[#FDE047] mx-auto mb-2.5 stroke-[1.5]"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-[#FEF3C7]">
                  Brak zapisanych symulacji
                </p>
                <p className="mt-1 text-xs text-[#FEF3C7]/80">
                  Dodaj produkty do koszyka i złóż zamówienie, aby pojawiło się na Twoim koncie.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#FBBF24]/30 border border-[#FBBF24]/55 rounded-xl overflow-hidden">
                {orders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="p-4 bg-[#1A080B]/65 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#FFFBEB]">
                        <span className="font-mono">{order.orderNumber}</span>
                        <span aria-hidden="true" className="text-[#FBBF24]">
                          ·
                        </span>
                        <span className="font-mono tabular-nums text-[#FDE047]">
                          {formatPricePln(order.totalPln)}
                        </span>
                      </div>
                      <p className="text-xs text-[#FDE68A]/80 mt-1">
                        {formatOrderTimestamp(order.createdAt)} · {order.items.length}{' '}
                        {order.items.length === 1 ? 'pozycja' : 'pozycje'} ·{' '}
                        {order.deliveryMethod.label}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectOrderReceipt(order);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border border-[#FBBF24] hover:from-[#B91C1C] hover:to-[#7F1D1D] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Zobacz potwierdzenie
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
