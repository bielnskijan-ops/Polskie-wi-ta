import { CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';
import { SimulationOrder } from '../types/shop';
import { formatOrderTimestamp, formatPricePln } from '../utils/formatters';

interface SimulationConfirmationModalProps {
  order: SimulationOrder | null;
  onClose: () => void;
  onStartNewSimulation: () => void;
}

export function SimulationConfirmationModal({
  order,
  onClose,
  onStartNewSimulation,
}: SimulationConfirmationModalProps) {
  useEffect(() => {
    if (!order) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulation-confirm-title"
    >
      <div
        className="fixed inset-0 bg-[#04120D]/75 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl kitsch-card border-2 border-[#FBBF24] rounded-2xl shadow-[0_0_38px_rgba(245,158,11,0.38)] overflow-hidden max-h-[90vh] flex flex-col text-[#FFFBEB]">
        <div className="h-2 w-full festive-lights-strip border-b border-[#FBBF24]/60" aria-hidden="true" />
        <div className="px-6 py-5 festive-header-kitsch border-b-2 border-[#FBBF24]/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="w-6 h-6 text-[#FDE047] shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(253,224,71,0.65)]"
              aria-hidden="true"
            />
            <div>
              <h2
                id="simulation-confirm-title"
                className="text-xl font-bold kitsch-gold-text"
              >
                Potwierdzenie zamówienia · Polskie Święta
              </h2>
              <p className="mt-1 text-xs text-[#FDE68A]/85">
                Zamówienie testowe {order.orderNumber} · {formatOrderTimestamp(order.createdAt)} ·
                Brak realnej płatności
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij potwierdzenie"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-[#FDE047] hover:text-white hover:bg-[#5F1317]/80 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1A080B]/70 border border-[#FBBF24]/50 rounded-xl p-4 text-sm">
            <div>
              <span className="block text-xs text-[#FDE68A]/80">Odbiorca symulacji</span>
              <span className="font-semibold text-[#FFFBEB] mt-0.5 block">
                {order.customerName}
              </span>
            </div>
            <div>
              <span className="block text-xs text-[#FDE68A]/80">Wybrana dostawa</span>
              <span className="font-semibold text-[#FFFBEB] mt-0.5 block">
                {order.deliveryMethod.label}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#FDE047] mb-3">
              Podsumowanie pozycji
            </h3>
            <div className="border border-[#FBBF24]/55 rounded-xl overflow-hidden bg-[#1A080B]/70">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-[#5F1317]/75 text-xs text-[#FDE047] border-b border-[#FBBF24]/45">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Produkt</th>
                    <th className="py-2.5 px-3 font-medium text-right">Ilość</th>
                    <th className="py-2.5 px-3 font-medium text-right">Cena</th>
                    <th className="py-2.5 px-4 font-medium text-right">Wartość</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FBBF24]/25">
                  {order.items.map((item) => (
                    <tr key={`${item.productId}-${item.variant}`}>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#FFFBEB] block">{item.name}</span>
                        <span className="text-xs text-[#FDE68A]/75">
                          {item.variant} · {item.sku}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#FEF3C7]">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#FEF3C7]">
                        {formatPricePln(item.unitPricePln)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#FDE047]">
                        {formatPricePln(item.lineTotalPln)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-[#FBBF24]/40 pt-4 space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-[#FDE68A]/85">
              <span>Wartość produktów</span>
              <span className="font-mono tabular-nums">{formatPricePln(order.subtotalPln)}</span>
            </div>
            <div className="flex items-center justify-between text-[#FDE68A]/85">
              <span>Koszt dostawy (symulacja)</span>
              <span className="font-mono tabular-nums">{formatPricePln(order.deliveryPln)}</span>
            </div>
            <div className="pt-2 border-t border-[#FBBF24]/40 flex items-center justify-between text-base font-bold text-[#FFFBEB]">
              <span>Suma całkowita symulacji</span>
              <span className="font-mono tabular-nums text-[#FDE047]">
                {formatPricePln(order.totalPln)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t-2 border-[#FBBF24]/70 festive-header-kitsch flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-[#FEF3C7] bg-[#1A080B]/80 border border-[#FBBF24]/55 rounded-lg hover:bg-[#5F1317] transition-colors cursor-pointer"
          >
            Zamknij podgląd
          </button>
          <button
            type="button"
            onClick={onStartNewSimulation}
            className="px-5 py-2.5 text-sm font-semibold text-[#FFFBEB] bg-gradient-to-b from-[#DC2626] to-[#991B1B] border-2 border-[#FBBF24] rounded-lg hover:from-[#B91C1C] hover:to-[#7F1D1D] shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
          >
            Nowa symulacja i powrót do sklepu
          </button>
        </div>
      </div>
    </div>
  );
}
