'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import type { ProductCardData } from '@/types/product';
import { getProductUrl } from '@/lib/utils/productUrl';

interface Props {
  products: ReadonlyArray<ProductCardData | null>;
}

type FinishName = 'Polished Chrome' | 'Matte Black' | 'Brushed Nickel' | 'Brushed Gold';
type Finish = {
  name: FinishName;
  product: ProductCardData;
  url: string;
};
type Geometry = {
  naturalWidth: number;
  naturalHeight: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  baseX: number;
  baseY: number;
  measured: boolean;
};

const BACKGROUND = 'https://cdn.shopify.com/s/files/1/0984/4693/4337/files/Tap-Free_Stone_Kitchen_Sink_Scene.png?v=1793958965';
const SCENE = { width: 1671, height: 941, anchorX: 1671 * 0.608, anchorY: 941 * 0.8353 };
// The reference chrome image occupied an approximately 486 × 693 visible area.
// These values are targets for the measured *opaque silhouette*, NOT the PNG box.
const VISIBLE_REFERENCE = { width: 486, height: 693 };
const FINISH_ORDER: FinishName[] = ['Polished Chrome', 'Matte Black', 'Brushed Nickel', 'Brushed Gold'];
const HOLD_MS = 3000;
const MANUAL_PAUSE_MS = 8000;
const TRANSITION_MS = 680;
const FADE_OUT_MS = 170;
const SWATCHES: Record<FinishName, string> = {
  'Polished Chrome': 'linear-gradient(125deg, #717a83 0%, #f9fbfc 28%, #8c979f 48%, #f9fafb 70%, #59636d 100%)',
  'Matte Black': 'linear-gradient(135deg, #55585c 0%, #202226 55%, #111316 100%)',
  'Brushed Nickel': 'repeating-linear-gradient(100deg, #cdd0cc 0px, #9fa5a4 2px, #d4d7d4 4px, #9da5a5 6px)',
  'Brushed Gold': 'linear-gradient(135deg, #f3dba3 0%, #bb9856 36%, #d8b979 65%, #9f7b40 100%)',
};

function identifyFinish(title: string): FinishName | null {
  if (/polished chrome/i.test(title)) return 'Polished Chrome';
  if (/matte black/i.test(title)) return 'Matte Black';
  if (/brushed nickel|stainless steel/i.test(title)) return 'Brushed Nickel';
  if (/brushed gold/i.test(title)) return 'Brushed Gold';
  return null;
}

/**
 * Read actual visible-alpha bounds, not the arbitrary transparent image margins.
 * Sampling is limited to ~850px on the longest axis, keeping work inexpensive.
 * The foot position uses opaque pixels in the bottom 3% of the silhouette.
 * Coordinates are converted back to each image's full natural resolution.
 */
function inspectImage(img: HTMLImageElement): Geometry {
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const downscale = Math.min(1, 850 / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * downscale));
  const height = Math.max(1, Math.round(naturalHeight * downscale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D unavailable');
  ctx.drawImage(img, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const alphaThreshold = 36;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  // Scan all alpha pixels once to get the actual silhouette.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] < alphaThreshold) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < 0) throw new Error('Tap image has no visible alpha');
  // Estimate the physical foot from the bottom 3% of the visible outline.
  // Use a middle-of-mass rather than the centre of the PNG.
  const footStart = maxY - Math.max(2, Math.round((maxY - minY) * 0.03));
  let sumX = 0, count = 0;
  for (let y = footStart; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (pixels[(y * width + x) * 4 + 3] < 110) continue;
      sumX += x;
      count++;
    }
  }
  const inverseX = naturalWidth / width;
  const inverseY = naturalHeight / height;
  return {
    naturalWidth, naturalHeight,
    left: minX * inverseX, top: minY * inverseY,
    right: (maxX + 1) * inverseX, bottom: (maxY + 1) * inverseY,
    baseX: (count ? sumX / count : (minX + maxX) / 2) * inverseX,
    baseY: (maxY + 1) * inverseY,
    measured: true,
  };
}

function fallbackGeometry(img: HTMLImageElement): Geometry {
  // If Shopify's CDN blocks cross-origin canvas inspection, keep the image
  // intact and show a conservative preview, rather than failing the showcase.
  // A fully precise placement in this fallback state cannot be guaranteed.
  return {
    naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
    left: 0, top: 0, right: img.naturalWidth, bottom: img.naturalHeight,
    baseX: img.naturalWidth * 0.74, baseY: img.naturalHeight,
    measured: false,
  };
}

function layoutTap(g: Geometry) {
  const visibleWidth = g.right - g.left;
  const visibleHeight = g.bottom - g.top;
  // Scale the visible shape, preserving natural aspect ratio. A 486px width
  // cap prevents unusual assets from extending outside the original silhouette.
  const factor = Math.min(
    VISIBLE_REFERENCE.height / visibleHeight,
    VISIBLE_REFERENCE.width / visibleWidth,
  );
  return {
    width: g.naturalWidth * factor,
    height: g.naturalHeight * factor,
    left: SCENE.anchorX - g.baseX * factor,
    top: SCENE.anchorY - g.baseY * factor,
  };
}

export function AnimatedThreeWayTapShowcase({ products }: Props) {
  const finishes = useMemo(() => FINISH_ORDER.flatMap((name) => {
    const product = products.find((candidate) => candidate && identifyFinish(candidate.title) === name);
    return product?.featuredImage?.url
      ? [{ name, product, url: product.featuredImage.url } as Finish]
      : [];
  }), [products]);
  const [selected, setSelected] = useState<FinishName>('Polished Chrome');
  const [displayed, setDisplayed] = useState<FinishName>('Polished Chrome');
  const [swapPhase, setSwapPhase] = useState<'stable' | 'exiting' | 'entering'>('stable');
  const [geometry, setGeometry] = useState<Record<string, Geometry>>({});
  const [viewport, setViewport] = useState({ width: SCENE.width, height: SCENE.height });
  const [manualAt, setManualAt] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [enteredView, setEnteredView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const imageReady = finishes.some((finish) => Boolean(geometry[finish.url]));
  const active = finishes.find((finish) => finish.name === selected) ?? finishes[0];
  const activeProduct = active?.product;

  function changeFinish(next: FinishName) {
    if (next === selected) return;
    setSelected(next);
  }

  // Two distinct phases: the existing tap disappears first, then the next
  // arrives from beyond the right-hand side. Never show two taps at once.
  // Selecting another finish mid-transition cancels the pending timers.
  useEffect(() => {
    if (selected === displayed) return;
    if (reducedMotion) {
      setDisplayed(selected);
      setSwapPhase('stable');
      return;
    }
    setSwapPhase('exiting');
    const exitTimer = window.setTimeout(() => {
      setDisplayed(selected);
      setSwapPhase('entering');
    }, FADE_OUT_MS);
    const enterTimer = window.setTimeout(() => {
      setSwapPhase('stable');
    }, FADE_OUT_MS + TRANSITION_MS);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(enterTimer);
    };
    // displayed is intentionally excluded: its update is part of this
    // transition, not a signal to restart the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, reducedMotion]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setViewport({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Trigger the TAP entrance once the kitchen scrolls into view.
  // The kitchen background and its crop are always stationary.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        !('IntersectionObserver' in window)) {
      setEnteredView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEnteredView(true);
        observer.disconnect();
      }
    }, { threshold: 0.16, rootMargin: '0px 0px -5% 0px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!finishes.length) return;
    let cancelled = false;
    const pending: HTMLImageElement[] = [];
    const timeouts: number[] = [];
    // Priority: chrome first; other finishes start loading after initial scene.
    finishes.forEach((finish, index) => {
      const img = new window.Image();
      pending.push(img);
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => {
        if (cancelled) return;
        let measured: Geometry;
        try {
          measured = inspectImage(img);
        } catch (error) {
          console.warn('[tap-scene] Cannot inspect transparent bounds; using unverified fallback', finish.name, error);
          measured = fallbackGeometry(img);
        }
        setGeometry((previous) => ({ ...previous, [finish.url]: measured }));
      };
      img.onerror = () => {
        if (cancelled) return;
        // Some CDN configurations do not permit cross-origin pixel reading.
        // Retry as a normal displayable image and use the explicit fallback.
        const backup = new window.Image();
        pending.push(backup);
        backup.onload = () => {
          if (!cancelled) setGeometry((previous) => ({
            ...previous, [finish.url]: fallbackGeometry(backup),
          }));
          console.warn('[tap-scene] Alpha inspection blocked by CORS; alignment requires manual review', finish.name);
        };
        backup.onerror = () => console.warn('[tap-scene] Could not load Shopify tap image', finish.name);
        backup.src = finish.url;
      };
      // Chrome is loaded immediately; others follow after the critical image.
      if (index === 0) img.src = finish.url;
      else {
        const timeout = window.setTimeout(() => {
          if (!cancelled) img.src = finish.url;
        }, 800 + 250 * index);
        timeouts.push(timeout);
      }
    });
    return () => {
      cancelled = true;
      timeouts.forEach(window.clearTimeout);
      pending.forEach((img) => { img.onload = null; img.onerror = null; });
    };
  }, [finishes]);

  useEffect(() => {
    if (finishes.length < 2 || reducedMotion || paused || !imageReady || !enteredView || swapPhase !== 'stable') return;
    const pauseRemaining = Math.max(0, MANUAL_PAUSE_MS - (Date.now() - manualAt));
    const timeout = window.setTimeout(() => {
      const index = finishes.findIndex((finish) => finish.name === selected);
      const next = finishes[(index + 1) % finishes.length];
      if (next && geometry[next.url]) changeFinish(next.name);
    }, Math.max(HOLD_MS, pauseRemaining));
    return () => window.clearTimeout(timeout);
  }, [selected, manualAt, paused, reducedMotion, finishes, imageReady, enteredView, swapPhase, geometry]);

  const scale = Math.max(viewport.width / SCENE.width, viewport.height / SCENE.height);
  // On narrow viewports, keep the installation point visible and leave enough
  // room to see the spout extending to the left over the sink.
  const cropFocusX = viewport.width / viewport.height < 1.1 ? 0.59 : 0.5;
  const centeredOffsetX = (viewport.width - SCENE.width * scale) / 2;
  const focusedOffsetX = viewport.width * cropFocusX - SCENE.anchorX * scale;
  const offsetX = viewport.width / viewport.height < 1.1
    ? Math.max(viewport.width - SCENE.width * scale, Math.min(0, focusedOffsetX))
    : centeredOffsetX;
  const offsetY = (viewport.height - SCENE.height * scale) / 2;
  const formattedPrice = activeProduct
    ? new Intl.NumberFormat('en-AU', {
      style: 'currency', currency: activeProduct.price.currencyCode,
    }).format(Number(activeProduct.price.amount))
    : null;

  return (
    <>
    <link rel="preload" as="image" href={BACKGROUND} />
    {finishes[0] && <link rel="preload" as="image" href={finishes[0].url} />}
    <section ref={sectionRef} aria-labelledby="three-way-tap-showcase-title" className="overflow-hidden border-b border-white/10 bg-[#141516] text-white">
      <div className="mx-auto grid max-w-7xl items-stretch gap-9 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:px-8">
        <div className="order-2 flex min-w-0 flex-col justify-center lg:order-1">
          <div
            ref={sceneRef}
            className="relative isolate aspect-[4/3] w-full overflow-hidden bg-transparent sm:aspect-[1671/941]"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse 77% 79% at 51% 50%, #000 47%, rgba(0,0,0,.96) 64%, rgba(0,0,0,.7) 78%, transparent 100%)',
              maskImage: 'radial-gradient(ellipse 77% 79% at 51% 50%, #000 47%, rgba(0,0,0,.96) 64%, rgba(0,0,0,.7) 78%, transparent 100%)',
            }}
            aria-label={`Kitchen sink with a ${active?.name ?? 'three way'} filtered kitchen mixer installed`}
          >
            {/* A single 1671 × 941 scene matrix is scaled and cropped as a unit. */}
            <div
              className="absolute left-0 top-0"
              style={{
                width: SCENE.width, height: SCENE.height,
                transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <img
                src={BACKGROUND}
                alt=""
                width={SCENE.width}
                height={SCENE.height}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-fill"
              />
              {/* The entire tap group slides in from the RIGHT, clipped by the
                  scene edge and its charcoal feather. The kitchen never moves.
                  All finishes share this transform, preserving installation alignment. */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  transform: enteredView && imageReady
                    ? 'translate3d(0,0,0)'
                    : 'translate3d(1750px,0,0)',
                  transition: reducedMotion ? 'none' : 'transform 1200ms cubic-bezier(.22,1,.36,1)',
                }}
              >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-10 rounded-full bg-black/20 blur-[7px]"
                style={{
                  left: SCENE.anchorX - 31,
                  top: SCENE.anchorY - 5,
                  width: 62, height: 13,
                }}
              />
              {finishes.map((finish) => {
                if (finish.name !== displayed) return null;
                const measured = geometry[finish.url];
                if (!measured) return null;
                const bounds = layoutTap(measured);
                return (
                  <img
                    key={finish.url}
                    src={finish.url}
                    alt={`${finish.name} filtered kitchen mixer tap installed on a kitchen bench`}
                    width={measured.naturalWidth}
                    height={measured.naturalHeight}
                    decoding="async"
                    className="pointer-events-none absolute z-20 select-none"
                    style={{
                      left: bounds.left, top: bounds.top,
                      width: bounds.width, height: bounds.height,
                      maxWidth: 'none',
                      opacity: swapPhase === 'exiting' ? 0 : 1,
                      transition: reducedMotion ? 'none' : `opacity ${FADE_OUT_MS}ms ease-in`,
                      animation: reducedMotion || swapPhase !== 'entering'
                        ? 'none'
                        : `tap-finish-arrive ${TRANSITION_MS}ms cubic-bezier(.22,.75,.2,1) both`,
                    }}
                  />
                );
              })}
              </div>
            </div>
            {!imageReady && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-white/85 px-3 py-2 text-xs text-[#292929]">
                Loading kitchen finishes…
              </div>
            )}
          </div>
          <div className="mx-auto mt-6 w-full max-w-[560px]">
            <div
              className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[.045] p-2 backdrop-blur-sm sm:grid-cols-4"
              role="group"
              aria-label="Choose tap finish"
            >
              {finishes.map((finish) => {
                const chosen = active?.name === finish.name;
                return (
                  <button
                    key={finish.name}
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => {
                      changeFinish(finish.name);
                      setManualAt(Date.now());
                    }}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                    className={`group relative flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-[background,border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${chosen ? 'border-white/65 bg-white/[.14] shadow-[inset_0_1px_0_rgba(255,255,255,.1)]' : 'border-transparent bg-transparent hover:border-white/20 hover:bg-white/[.07]'}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`relative block h-7 w-7 rounded-full border border-white/25 shadow-[inset_0_1px_2px_rgba(255,255,255,.28),0_2px_8px_rgba(0,0,0,.3)] transition-transform duration-300 group-hover:scale-110 ${chosen ? 'ring-2 ring-white/90 ring-offset-[3px] ring-offset-[#262729]' : ''}`}
                      style={{ background: SWATCHES[finish.name] }}
                    >
                      {chosen && (
                        <Check
                          size={13}
                          aria-hidden="true"
                          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm ${finish.name === 'Matte Black' ? 'text-white' : 'text-[#242424]'}`}
                          strokeWidth={3}
                        />
                      )}
                    </span>
                    <span className={`text-[11px] font-medium leading-tight sm:text-xs ${chosen ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                      {finish.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="order-1 flex min-w-0 w-full flex-col justify-center lg:order-2">
          <h2 id="three-way-tap-showcase-title" className="tracking-[-.05em]">
            <span className="block text-[clamp(2.2rem,4.3vw,4.75rem)] font-light leading-[1.06]">Hot. Cold.</span>
            <span className="tap-ice-blue-shine mt-1 block text-[clamp(2.5rem,5.2vw,5.5rem)] font-semibold leading-[1.08]">Filtered.</span>
          </h2>
          <p className="mt-7 max-w-[16ch] text-[clamp(1.8rem,3.1vw,3.25rem)] font-medium leading-[1.12] tracking-[-.045em] text-white">
            All from one <span className="font-semibold text-[#d9ecf6]">sleek tap.</span>
          </p>
          <p className="mt-4 max-w-md text-base leading-7 text-white/65">
            Hot, cold and filtered drinking water in one streamlined mixer, with no separate drinking-water tap.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            {formattedPrice && (
              <p className="whitespace-nowrap text-2xl font-semibold tracking-tight">
                {formattedPrice}<span className="ml-2 text-sm font-medium text-white/50">inc GST</span>
              </p>
            )}
            {activeProduct ? (
              <Link
                href={getProductUrl(activeProduct.handle)}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[.045em] text-[#141516] transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Shop now <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              <p className="text-sm text-white/60">This product is temporarily unavailable.</p>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes tap-finish-arrive {
          from { opacity: 1; transform: translate3d(1750px, 0, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tap-finish-motion { animation: none !important; }
        }
      `}</style>
    </section>
    </>
  );
}
