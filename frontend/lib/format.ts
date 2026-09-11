export function formatPrice(amount: number | string): string {
  const n = Math.round(Number(amount));
  return `Rs ${n.toLocaleString("en-US")}`;
}
