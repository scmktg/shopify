'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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
const TRANSITION_MS = 720;

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
  const [geometry, setGeometry] = useState<Record<string, Geometry>>({});
  const [viewport, setViewport] = useState({ width: SCENE.width, height: SCENE.height });
  const [manualAt, setManualAt] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const imageReady = finishes.some((finish) => Boolean(geometry[finish.url]));
  const active = finishes.find((finish) => finish.name === selected) ?? finishes[0];
  const activeProduct = active?.product;

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
    if (finishes.length < 2 || reducedMotion || paused || !imageReady) return;
    const pauseRemaining = Math.max(0, MANUAL_PAUSE_MS - (Date.now() - manualAt));
    const timeout = window.setTimeout(() => {
      setSelected((current) => {
        const index = finishes.findIndex((finish) => finish.name === current);
        return finishes[(index + 1) % finishes.length].name;
      });
    }, Math.max(HOLD_MS, pauseRemaining));
    return () => window.clearTimeout(timeout);
  }, [selected, manualAt, paused, reducedMotion, finishes, imageReady]);

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
    <section aria-labelledby="three-way-tap-showcase-title" className="overflow-hidden border-b border-white/10 bg-[#141516] text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-9 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.18fr_.82fr] lg:gap-12 lg:px-8">
        <div className="order-2 min-w-0 lg:order-1">
          <div
            ref={sceneRef}
            className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#dedcd6] sm:aspect-[1671/941]"
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
                const measured = geometry[finish.url];
                if (!measured) return null;
                const bounds = layoutTap(measured);
                const isActive = finish.name === (active?.name ?? 'Polished Chrome');
                return (
                  <img
                    key={finish.url}
                    src={finish.url}
                    alt={isActive ? `${finish.name} filtered kitchen mixer tap installed on a kitchen bench` : ''}
                    aria-hidden={!isActive}
                    width={measured.naturalWidth}
                    height={measured.naturalHeight}
                    decoding="async"
                    className="pointer-events-none absolute z-20 select-none"
                    style={{
                      left: bounds.left, top: bounds.top,
                      width: bounds.width, height: bounds.height,
                      maxWidth: 'none',
                      opacity: isActive ? 1 : 0,
                      transition: reducedMotion ? 'none' : `opacity ${TRANSITION_MS}ms ease-in-out`,
                      willChange: 'opacity',
                    }}
                  />
                );
              })}
            </div>
            {!imageReady && (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-white/85 px-3 py-2 text-xs text-[#292929]">
                Loading kitchen finishes…
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2" role="group" aria-label="Choose tap finish">
            {finishes.map((finish) => (
              <button
                key={finish.name}
                type="button"
                aria-pressed={active?.name === finish.name}
                onClick={() => {
                  setSelected(finish.name);
                  setManualAt(Date.now());
                }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
                className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${active?.name === finish.name ? 'border-white bg-white text-[#141516]' : 'border-white/30 text-white/80 hover:border-white/75 hover:text-white'}`}
              >
                {finish.name}
              </button>
            ))}
          </div>
        </div>
        <div className="order-1 max-w-xl lg:order-2">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[.19em] text-white/50">
            Find your finish
          </p>
          <h2 id="three-way-tap-showcase-title" className="tracking-[-.05em]">
            <span className="block text-[clamp(2.2rem,4.3vw,4.75rem)] font-light leading-[1.06]">Hot. Cold.</span>
            <span className="tap-ice-blue-shine mt-1 block text-[clamp(2.5rem,5.2vw,5.5rem)] font-semibold leading-[1.08]">Filtered.</span>
          </h2>
          <p className="mt-6 text-[clamp(1.1rem,2vw,1.5rem)] font-medium tracking-[-.025em]">
            All from one sleek tap.
          </p>
          <p className="mt-4 max-w-md text-base leading-7 text-white/65">
            Explore four premium finishes in the same kitchen. Hot, cold and filtered drinking water in one streamlined mixer, with no separate drinking-water tap.
          </p>
          <p className="mt-6 text-sm font-medium text-white/80" aria-live="off">
            Currently viewing: <span className="text-white">{active?.name ?? 'Polished Chrome'}</span>
          </p>
          {formattedPrice && (
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {formattedPrice}<span className="ml-2 text-sm font-medium text-white/50">inc GST</span>
            </p>
          )}
          {activeProduct ? (
            <Link href={getProductUrl(activeProduct.handle)} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-[.04em] text-[#141516] transition-colors hover:bg-white/90 sm:w-auto">
              Shop now <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <p className="mt-7 text-sm text-white/60">This product is temporarily unavailable.</p>
          )}
        </div>
      </div>
    </section>
  );
}
