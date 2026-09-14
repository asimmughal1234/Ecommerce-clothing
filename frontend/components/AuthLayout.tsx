import Link from "next/link";
import { Check } from "lucide-react";
import Logo from "./Logo";

const FEATURES = [
  "Faster checkout, saved for next time",
  "Track every order from cart to doorstep",
  "Early access to new drops",
];

export default function AuthLayout({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
      <div className="hidden lg:flex relative flex-col justify-between bg-ink text-cream p-14 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #F8F5EE 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Link href="/" className="relative text-cream">
          <Logo tone="cream" size={36} />
        </Link>

        <div className="relative">
          <p className="font-display text-4xl leading-tight tracking-tightest max-w-sm">
            Clothes that earn their years.
          </p>
          <ul className="mt-10 space-y-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-cream/80 text-sm">
                <span className="w-6 h-6 shrink-0 flex items-center justify-center bg-cream/10">
                  <Check size={14} strokeWidth={2} className="text-clay-light" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-cream/40">© {new Date().getFullYear()} Velara</p>
      </div>

      <div className="flex items-center justify-center px-5 py-16 md:py-24">
        <div className="w-full max-w-[400px]">
          <div className="w-12 h-12 flex items-center justify-center bg-ink text-cream mb-6">
            <Icon size={22} strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl tracking-tightest mb-2">{title}</h1>
          <p className="text-ink/60 text-sm mb-8">{subtitle}</p>

          {children}

          <div className="mt-6">{footer}</div>
        </div>
      </div>
    </div>
  );
}
