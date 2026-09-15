export type CardBrand = "Visa" | "Mastercard" | "Amex" | "Discover" | "UnionPay" | "JCB" | "Card";

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  if (/^62/.test(digits)) return "UnionPay";
  if (/^35/.test(digits)) return "JCB";
  return "Card";
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Amex is 4-6-5, every other brand groups in fours. */
export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, 19);
  if (detectBrand(digits) === "Amex") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(" ");
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function luhnValid(digits: string): boolean {
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function cvcLength(brand: CardBrand): number {
  return brand === "Amex" ? 4 : 3;
}

export function parseExpiry(value: string): { month: number; year: number } | null {
  const digits = onlyDigits(value);
  if (digits.length !== 4) return null;
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export function expiryInFuture(value: string): boolean {
  const parsed = parseExpiry(value);
  if (!parsed) return false;
  const now = new Date();
  const endOfMonth = new Date(parsed.year, parsed.month, 1);
  return endOfMonth > now;
}

/** Pakistani mobile numbers used by JazzCash wallets: 03XX XXXXXXX. */
export function formatMobile(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

export function validMobile(value: string): boolean {
  return /^03\d{9}$/.test(onlyDigits(value));
}
