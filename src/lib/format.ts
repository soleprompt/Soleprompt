export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPurchaseAmount(amount: number) {
  return amount <= 0 ? "Free" : formatCurrency(amount);
}

/** Strikethrough "original" price for launch pricing display. */
export function getCompareAtPrice(price: number): number | null {
  if (price <= 0) return null;
  const doubled = price * 2;
  const whole = Math.ceil(doubled);
  return Math.max(whole - 0.01, price + 1);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
