"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid lg:grid-cols-[1.3fr_1fr] min-h-[86vh] lg:min-h-[92vh]">
        <motion.div
          className="absolute inset-0 lg:relative lg:order-1"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=1600"
            alt="Model wearing a VELARA wool overcoat in a quiet stone courtyard"
            fill
            priority
            className="object-cover object-[center_15%]"
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10 lg:hidden" />
        </motion.div>

        <div className="relative z-10 order-1 lg:order-2 lg:bg-ink text-cream flex flex-col justify-end p-8 md:p-10 lg:p-14 py-14 lg:py-20">
          <motion.p
            className="text-sm text-cream/60 mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Autumn / Winter collection
          </motion.p>
          <motion.h1
            className="font-display text-[13vw] leading-[0.95] md:text-6xl md:leading-[1.02] tracking-tightest"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.62 }}
          >
            Clothes that earn their years.
          </motion.h1>
          <motion.p
            className="mt-6 text-cream/70 max-w-md leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.78 }}
          >
            Wool overcoats, alpaca knitwear, and tailoring cut from mills we've
            worked with for a decade. Built to be worn, mended, and worn again.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.92 }}
          >
            <Link
              href="/shop"
              className="inline-block mt-9 bg-cream text-ink px-7 py-3.5 text-sm tracking-wide hover:bg-clay hover:text-cream transition-colors duration-300"
            >
              Shop the collection
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
