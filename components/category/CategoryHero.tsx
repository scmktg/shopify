import Link from 'next/link';
import clsx from 'clsx';
import type { Subcategory } from '@/content/categories';

interface CategoryHeroProps {
  title: string;
  intro: string | null;
  categorySlug: string;
  subcategories: ReadonlyArray<Subcategory>;
  activeSubSlug?: string | null;
}

/**
 * Compact category header. Tight vertical padding, single-line
 * intro at smaller sizes, and a compact pill row for subcategory
 * navigation. The category page below this header carries its own
 * filter strip (size + sort + count), so the hero deliberately
 * keeps its real-estate use small to leave more room for the grid.
 */
export function CategoryHero({
  title,
  intro,
  categorySlug,
  subcategories,
  activeSubSlug = null,
}: CategoryHeroProps) {
  const pillBase =
    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors';
  const pillActive = 'bg-black text-white border border-black';
  const pillIdle =
    'bg-white border border-gray-300 text-black hover:border-black';

  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
          {title}
        </h1>
        {intro && (
          <p className="mt-2 max-w-3xl text-sm md:text-base text-black/70 leading-snug">
            {intro}
          </p>
        )}

        {subcategories.length > 0 && (
          <nav aria-label="Subcategories" className="mt-4">
            <ul role="list" className="flex flex-wrap gap-1.5">
              <li>
                <Link
                  href={`/${categorySlug}/`}
                  aria-current={activeSubSlug === null ? 'page' : undefined}
                  className={clsx(
                    pillBase,
                    activeSubSlug === null ? pillActive : pillIdle,
                  )}
                >
                  All
                </Link>
              </li>
              {subcategories.map((sub) => {
                const active = sub.slug === activeSubSlug;
                return (
                  <li key={sub.slug}>
                    <Link
                      href={`/${categorySlug}/${sub.slug}/`}
                      aria-current={active ? 'page' : undefined}
                      className={clsx(
                        pillBase,
                        active ? pillActive : pillIdle,
                      )}
                    >
                      {sub.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
