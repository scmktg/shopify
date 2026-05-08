'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PROMO_ROTATING_ITEMS,
  PROMO_ROTATION_MS,
  PROMO_STATIC,
} from '@/lib/site-config';

/**
 * Top-of-page promotional banner.
 *
 * Two columns on `sm+`:
 *   - Left: a static brand promise line (`PROMO_STATIC_LINE`).
 *   - Right: a rotating carousel of `PROMO_ROTATING_ITEMS`,
 *     auto-advancing every `PROMO_ROTATION_MS`. Each item is a real
 *     <a> for keyboard nav and crawl visibility.
 *
 * On mobile (`<sm`) only the rotating side renders, centred, so the
 * strip stays a single line.
 *
 * Implementation notes:
 *   - All four rotating items are rendered absolutely-stacked. The
 *     active item is opacity-100, the others opacity-0 + pointer-
 *     events-none + tabIndex=-1, so only one item is clickable /
 *     focusable at a time. Switching index between two items
 *     crossfades over 500ms — smoother than a key-based remount and
 *     keeps the DOM stable for hydration / CLS.
 *   - aria-live="polite" + aria-hidden on inactive items lets
 *     screen readers announce the active message without re-reading
 *     all four.
 *   - Rotation pauses on hover and on focus (keyboard users get a
 *     chance to read and click before the next tick).
 *   - Banner copy and links live in `lib/site-config.ts`.
 *
 * Banner height is fixed (h-9 mobile / h-10 desktop) so mounting
 * doesn't introduce layout shift on the page below.
 */
export function PromoBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (PROMO_ROTATING_ITEMS.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % PROMO_ROTATING_ITEMS.length);
    }, PROMO_ROTATION_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div className="bg-black text-white text-[12px] sm:text-[13px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-9 sm:h-10 flex items-center justify-center sm:justify-between gap-4">
        <p className="hidden sm:block min-w-0 truncate">
          <span className="font-semibold text-white">
            {PROMO_STATIC.primary}
          </span>{' '}
          <span className="text-white/60">{PROMO_STATIC.secondary}</span>
        </p>

        <div
          className="relative flex-1 sm:flex-initial sm:w-auto sm:max-w-md h-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <ul
            aria-live="polite"
            aria-atomic="true"
            className="absolute inset-0 list-none m-0 p-0"
          >
            {PROMO_ROTATING_ITEMS.map((item, i) => {
              const active = i === index;
              return (
                <li
                  key={item.href}
                  aria-hidden={!active}
                  className={`absolute inset-0 flex items-center justify-center sm:justify-end transition-opacity duration-500 ${
                    active ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <Link
                    href={item.href}
                    tabIndex={active ? 0 : -1}
                    className="text-white/80 hover:text-white hover:underline underline-offset-4 truncate max-w-full transition-colors"
                  >
                    {item.text}{' '}
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
