import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-cream/10 mt-24 bg-ink text-cream">
      <div className="mx-auto max-w-content px-5 md:px-10 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Logo tone="cream" size={32} className="mb-4 text-cream" />
          <p className="text-sm text-cream/70 max-w-[220px] leading-relaxed">
            Considered clothing made from materials built to outlast a single season.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/shop" className="link-underline">All products</Link></li>
            <li><Link href="/shop?category=outerwear" className="link-underline">Outerwear</Link></li>
            <li><Link href="/shop?category=denim" className="link-underline">Denim</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Help</p>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/account/orders" className="link-underline">Track an order</Link></li>
            <li><Link href="/shop" className="link-underline">Shipping &amp; returns</Link></li>
            <li><Link href="/shop" className="link-underline">Size guide</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Studio</p>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/" className="link-underline">Our materials</Link></li>
            <li><Link href="/" className="link-underline">Journal</Link></li>
            <li><Link href="/" className="link-underline">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-content px-5 md:px-10 py-5 text-xs text-cream/60 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Velara Clothing Co.</span>
          <span>Designed and built in-house.</span>
        </div>
      </div>
    </footer>
  );
}
