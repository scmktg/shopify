'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { ProductCardData, ProductCardVariant } from '@/types/product';
import { getProductUrl } from '@/lib/utils/productUrl';

interface Props {
  product: ProductCardData | null;
}

type Finish = {
  label: string;
  image: NonNullable<ProductCardVariant['image']>;
  variantId: string;
  price: ProductCardVariant['price'];
};

const PREFERRED_FINISHES = [
  'matte black',
  'brushed gold',
  'brushed nickel',
  'polished chrome',
];

function finishName(variant: ProductCardVariant): string {
  const option = variant.selectedOptions.find(({ name }) =>
    /colou?r|finish|style/i.test(name),
  );
  return (option?.value || variant.title).trim();
}

function finishRank(name: string) {
  const rank = PREFERRED_FINISHES.findIndex((finish) =>
    name.toLowerCase().includes(finish),
  );
  return rank === -1 ? PREFERRED_FINISHES.length : rank;
}

/**
 * A small editorial animation, powered by the product's real Shopify variant
 * images. We don't hardcode asset URLs, so image replacements stay in sync.
 */
export function AnimatedThreeWayTapShowcase({ product }: Props) {
  const finishes = useMemo(() => {
    if (!product) return [];
    const seen = new Set<string>();
    return product.variants
      .filter((variant) => Boolean(variant.image?.url))
      .map((variant) => ({
        label: finishName(variant),
        image: variant.image!,
        variantId: variant.id,
        price: variant.price,
      }))
      .filter((finish) => {
        const key = finish.label.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => finishRank(a.label) - finishRank(b.label));
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const active = finishes[activeIndex % Math.max(finishes.length, 1)];
  const image = active?.image ?? product?.featuredImage;
  const price = active?.price ?? product?.price;

  useEffect(() => {
    if (paused || interacted || finishes.length < 2) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % finishes.length);
    }, 4300);
    return () => window.clearInterval(interval);
  }, [paused, interacted, finishes.length]);

  const formattedPrice = price
    ? new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: price.currencyCode,
      }).format(Number(price.amount))
    : null;

  return (
    <section
      aria-labelledby="three-way-tap-showcase-title"
      className="relative isolate overflow-hidden border-b border-white/10 bg-[#121416] text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(ellipse_at_28%_49%,rgba(255,255,255,.085),transparent_48%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[650px] lg:grid-cols-[1.12fr_.88fr] lg:gap-16 lg:px-8">
        <div className="relative order-2 mx-auto w-full max-w-[650px] lg:order-1">
          <div className="pointer-events-none absolute inset-x-[14%] top-[12%] aspect-square rounded-full border border-white/[.07]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-[24%] top-[22%] aspect-square rounded-full border border-white/[.07]" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[.045] blur-3xl" aria-hidden="true" />
          <div className="relative aspect-[1.12/1] w-full sm:aspect-[1.2/1]">
            {image ? (
              <div key={image.url} className="tap-showcase-enter absolute inset-0">
                <Image
                  src={image.url}
                  alt={image.altText || (active ? `3 way filtered kitchen mixer tap in ${active.label}` : product?.title || 'Three way filtered kitchen mixer tap')}
                  fill
                  sizes="(max-width: 1023px) 92vw, 54vw"
                  className="object-contain p-1 drop-shadow-[0_24px_24px_rgba(0,0,0,.28)] sm:p-5"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-white/60">
                Three way filtered kitchen mixer tap
              </div>
            )}
          </div>
          <div className="relative -mt-2 flex min-h-16 flex-wrap items-center justify-center gap-2 sm:gap-3">
            {finishes.length > 1 ? finishes.map((finish, index) => (
              <button
                key={finish.variantId}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setInteracted(true);
                }}
                aria-pressed={index === activeIndex}
                className={`min-h-11 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${index === activeIndex ? 'border-white bg-white text-[#121416]' : 'border-white/25 text-white/75 hover:border-white/70 hover:text-white'}`}
              >
                {finish.label}
              </button>
            )) : active ? (
              <span className="text-sm font-medium text-white/75">{active.label}</span>
            ) : null}
          </div>
          {finishes.length > 1 && (
            <p className="mt-2 text-center text-xs tracking-wide text-white/45">
              Select a finish to explore the range
            </p>
          )}
        </div>

        <div className="relative order-1 max-w-xl lg:order-2">
          <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.19em] text-white/55">
            <span className="h-px w-7 bg-white/45" aria-hidden="true" />
            The three way collection
          </div>
          <h2 id="three-way-tap-showcase-title" className="tracking-[-.05em]">
            <span className="block text-[clamp(2.2rem,4.4vw,4.75rem)] font-light leading-[1.06]">Hot. Cold.</span>
            <span className="tap-ice-blue-shine mt-1 block text-[clamp(2.5rem,5.2vw,5.5rem)] font-semibold leading-[1.08]">Filtered.</span>
          </h2>
          <p className="mt-6 text-[clamp(1.1rem,2vw,1.5rem)] font-medium leading-snug tracking-[-.025em] text-white">
            All from one sleek tap.
          </p>
          <p className="mt-4 max-w-md text-base leading-7 text-white/65">
            Hot, cold and filtered drinking water in one beautifully streamlined kitchen mixer. No separate drinking-water tap required.
          </p>
          {formattedPrice && (
            <p className="mt-7 text-2xl font-semibold tracking-tight">
              {formattedPrice}
              <span className="ml-2 text-sm font-medium text-white/50">inc GST</span>
            </p>
          )}
          {product ? (
            <Link
              href={getProductUrl(product.handle)}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-[.04em] text-[#121416] transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
            >
              Shop now <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <p className="mt-7 text-sm text-white/60">This product is temporarily unavailable.</p>
          )}
          <p className="mt-7 flex items-center gap-2 text-sm text-white/45">
            Four finishes. One effortless kitchen upgrade.
            <ChevronRight size={15} aria-hidden="true" />
          </p>
        </div>
      </div>
      <style jsx>{`
        @keyframes tap-showcase-reveal {
          from { opacity: 0; transform: translateY(22px) scale(.955); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .tap-showcase-enter {
          animation: tap-showcase-reveal 850ms cubic-bezier(.2,.7,.2,1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .tap-showcase-enter { animation: none; }
        }
      `}</style>
    </section>
  );
}
