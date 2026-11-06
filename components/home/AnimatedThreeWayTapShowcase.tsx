'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { ProductCardData } from '@/types/product';
import { getProductUrl } from '@/lib/utils/productUrl';

interface Props {
  products: ReadonlyArray<ProductCardData | null>;
}

type Finish = {
  label: string;
  image: NonNullable<ProductCardData['featuredImage']>;
  handle: string;
  price: ProductCardData['price'];
};

const PREFERRED_FINISHES = [
  'matte black',
  'brushed gold',
  'brushed nickel',
  'polished chrome',
];

function finishName(product: ProductCardData): string {
  const title = product.title;
  if (/matte black/i.test(title)) return 'Matte Black';
  if (/brushed gold/i.test(title)) return 'Brushed Gold';
  if (/stainless steel|brushed nickel/i.test(title)) return 'Brushed Nickel';
  if (/polished chrome/i.test(title)) return 'Polished Chrome';
  return title.replace(/^3 way filtered kitchen mixer tap in /i, '');
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
export function AnimatedThreeWayTapShowcase({ products }: Props) {
  const finishes = useMemo(() => {
    const seen = new Set<string>();
    return products
      .filter((product): product is ProductCardData => Boolean(product?.featuredImage?.url))
      .map((product) => ({
        label: finishName(product),
        image: product.featuredImage!,
        handle: product.handle,
        price: product.price,
      }))
      .filter((finish) => {
        const key = finish.label.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => finishRank(a.label) - finishRank(b.label));
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const active = finishes[activeIndex % Math.max(finishes.length, 1)];
  const image = active?.image;
  const price = active?.price;

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
      <div className="relative mx-auto grid max-w-7xl items-center gap-9 px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[610px] lg:grid-cols-[1.18fr_.82fr] lg:gap-12 lg:px-8">
        <div className="relative order-2 w-full min-w-0 lg:order-1">
          <div
            className="tap-kitchen-scene relative isolate mx-auto w-full max-w-[700px] overflow-hidden rounded-[14px] border border-white/10 bg-[#eae7e0] shadow-[0_24px_70px_rgba(0,0,0,.24)]"
            role="img"
            aria-label={`Kitchen benchtop simulation showing a ${active?.label ?? 'three way'} filtered kitchen mixer tap installed above a sink`}
          >
            {/* A real DOM/CSS kitchen environment, not a static lifestyle photograph. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[69%] [background:linear-gradient(120deg,#e5e0d6_0%,#f4f1e9_45%,#d7d1c6_100%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[44%] h-[25%] border-t border-[#d4cec3] [background:repeating-linear-gradient(0deg,transparent_0px,transparent_39px,rgba(144,135,121,.14)_40px,transparent_41px),repeating-linear-gradient(90deg,transparent_0px,transparent_94px,rgba(144,135,121,.12)_95px,transparent_96px),linear-gradient(110deg,#e7e3db,#f2f0e9)]" />
            {/* Left-side understated kitchen shelf and accessories. */}
            <div aria-hidden="true" className="pointer-events-none absolute left-[6%] top-[19%] h-[1.2%] w-[31%] rounded-sm bg-[#baa98e] shadow-[0_5px_7px_rgba(70,54,37,.15)]" />
            <div aria-hidden="true" className="pointer-events-none absolute left-[11%] top-[11%] h-[8%] w-[5%] rounded-t-full bg-[#b0a895] shadow-sm" />
            <div aria-hidden="true" className="pointer-events-none absolute left-[20%] top-[9%] h-[10%] w-[6%] rounded-t-md bg-[#fdfbf6] shadow-sm" />
            <div aria-hidden="true" className="pointer-events-none absolute left-[31%] top-[12%] h-[7%] w-[3%] rounded-t-full bg-[#819181]" />
            <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-[8%] h-[26%] w-[18%] rounded-t-full border-[7px] border-[#d6cfbf] bg-[#bfc9bf]/45 shadow-[inset_0_0_20px_rgba(255,255,255,.6)]" />
            {/* Stone worktop with rounded front edge and faint marble veining. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[68%] h-[17%] [background:linear-gradient(172deg,transparent_0%,rgba(151,148,136,.11)_34%,transparent_35%),linear-gradient(14deg,transparent_0%,rgba(145,143,132,.12)_54%,transparent_55%),linear-gradient(180deg,#fbfaf7_0%,#e8e5df_78%,#c8c4bd_100%)] shadow-[0_-6px_14px_rgba(0,0,0,.09)]" />
            {/* Sink sits within the counter surface, slightly offset under the faucet spout. */}
            <div aria-hidden="true" className="pointer-events-none absolute left-[16%] top-[71%] h-[12%] w-[50%] rounded-[34%_34%_26%_26%/26%_26%_35%_35%] border-[5px] border-[#b5b7b5] [background:radial-gradient(ellipse_at_50%_90%,#5d6768_0%,#929b9a_52%,#c8cdcb_76%,#eff0ed_100%)] shadow-[inset_0_9px_20px_rgba(24,33,33,.37),0_1px_2px_rgba(255,255,255,.9)]" />
            <div aria-hidden="true" className="pointer-events-none absolute left-[39.5%] top-[78%] h-[1.3%] w-[3%] rounded-full bg-[#3d4848]/65" />
            {/* Product assets float through a fixed, countertop-anchored installation point. */}
            <div className="pointer-events-none absolute bottom-[26%] left-[32%] z-10 h-[65%] w-[54%]">
              {image ? (
                <div key={image.url} className="tap-showcase-enter absolute inset-0">
                  <Image
                    src={image.url}
                    alt={image.altText || (active ? `3 way filtered kitchen mixer tap in ${active.label}` : 'Three way filtered kitchen mixer tap')}
                    fill
                    sizes="(max-width: 639px) 52vw, (max-width: 1023px) 46vw, 30vw"
                    className="object-contain object-bottom drop-shadow-[5px_9px_6px_rgba(22,24,25,.26)]"
                  />
                </div>
              ) : (
                <span className="sr-only">Tap image unavailable</span>
              )}
            </div>
            {/* Countertop fascia and cabinetry provide a readable installation context. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[84%] h-[3%] [background:linear-gradient(180deg,#d6d1c9,#b9b4ad)] shadow-[0_4px_8px_rgba(0,0,0,.14)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[87%] bottom-0 flex [background:linear-gradient(90deg,#b5a98f,#dbd2bd_32%,#d8cebb_70%,#b4aa96)]">
              <div className="h-full w-[32%] border-r-[3px] border-[#aaa18f]/70" />
              <div className="h-full w-[36%] border-r-[3px] border-[#aaa18f]/70" />
              <div className="h-full flex-1" />
            </div>
            <div className="pointer-events-none absolute bottom-[6%] left-[28%] h-[1.2%] w-[2%] rounded-full bg-[#968a75]" aria-hidden="true" />
            <div className="pointer-events-none absolute bottom-[6%] left-[63%] h-[1.2%] w-[2%] rounded-full bg-[#968a75]" aria-hidden="true" />
            <div className="absolute bottom-3 left-3 z-20 rounded-md border border-white/70 bg-white/85 px-3 py-2 text-[11px] font-semibold tracking-wide text-[#292929] shadow-sm backdrop-blur-sm sm:bottom-5 sm:left-5 sm:text-xs">
              {active?.label ?? 'Kitchen mixer'} finish
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3" aria-label="Choose kitchen tap finish">
            {finishes.length > 1 ? finishes.map((finish, index) => (
              <button
                key={finish.handle}
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
          <p className="mt-3 text-center text-xs leading-relaxed tracking-wide text-white/50">
            Explore the finishes in a kitchen setting. Scene is illustrative.
          </p>
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
          {active ? (
            <Link
              href={getProductUrl(active.handle)}
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
        .tap-kitchen-scene { aspect-ratio: 1.28 / 1; }\n        @media (min-width: 640px) { .tap-kitchen-scene { aspect-ratio: 1.4 / 1; } }\n        @keyframes tap-showcase-reveal {
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
