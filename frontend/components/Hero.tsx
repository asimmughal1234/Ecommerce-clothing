"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1800",
    eyebrow: "Autumn / Winter collection",
    heading: "Clothes that earn their years.",
    description:
      "Wool overcoats, alpaca knitwear, and tailoring cut from mills we've worked with for a decade.",
    href: "/shop",
    cta: "Shop the collection",
    alt: "Model wearing a VELARA wool overcoat in a stone courtyard",
  },
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1800",
    eyebrow: "Outerwear",
    heading: "Built to outlast the weather.",
    description:
      "Overcoats and shearling cut from dense, long-staple wool — warm without the bulk.",
    href: "/shop?category=outerwear",
    cta: "View outerwear",
    alt: "Rail of VELARA outerwear in a studio",
  },
  {
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1800",
    eyebrow: "Knitwear",
    heading: "Warmth without the weight.",
    description:
      "Alpaca and merino knits that hold their shape season after season, mended not replaced.",
    href: "/shop?category=knitwear",
    cta: "View knitwear",
    alt: "Model wearing VELARA knitwear",
  },
];

const AUTOPLAY_MS = 5000;

export default function Hero() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);

  useEffect(() => {
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section
      className="relative h-[78vh] min-h-[460px] lg:h-[82vh] overflow-hidden bg-ink"
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-editorial ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover object-[center_20%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />

          <div className="relative h-full mx-auto max-w-content px-5 md:px-10 flex flex-col justify-center">
            <div className="max-w-xl text-cream">
              <p
                className={`text-xs md:text-sm uppercase tracking-[0.2em] text-cream/70 transition-all duration-700 delay-150 ${
                  i === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
              >
                {slide.eyebrow}
              </p>
              <h1
                className={`font-display text-[11vw] leading-[0.98] md:text-6xl lg:text-7xl md:leading-[1.02] tracking-tightest mt-4 transition-all duration-700 delay-[250ms] ${
                  i === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {slide.heading}
              </h1>
              <p
                className={`mt-5 text-cream/75 leading-relaxed max-w-md transition-all duration-700 delay-[350ms] ${
                  i === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {slide.description}
              </p>
              <div
                className={`transition-all duration-700 delay-[450ms] ${
                  i === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <Link
                  href={slide.href}
                  className="group inline-flex items-center gap-2 mt-8 bg-cream text-ink px-7 py-3.5 text-sm tracking-wide hover:bg-clay hover:text-cream transition-colors duration-300"
                >
                  {slide.cta}
                  <ArrowRight
                    size={16}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.image}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-[3px] transition-all duration-300 ${
              i === index ? "w-9 bg-cream" : "w-4 bg-cream/40 hover:bg-cream/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
