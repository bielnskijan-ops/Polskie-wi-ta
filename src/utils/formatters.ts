const plnFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPricePln(value: number): string {
  return plnFormatter.format(value);
}

export function formatOrderTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
