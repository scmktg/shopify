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

const CATEGORY_SUBTITLES: Readonly<Record<string, string>> = {
  'water-filters': 'Better water, made simple.',
  cartridges: 'Find the right replacement for your system.',
  'bubblers-and-coolers': 'Reliable hydration for every space.',
  'tanks-and-bunds': 'Practical storage for every application.',
  plumbing: 'Explore tapware, fittings and bathroom essentials.',
};

/**
 * A compact, customer-first category heading. Descriptive catalogue copy
 * remains on the page in CategorySeoCopy, below the product listing.
 * All subcategory links are normal server-rendered anchors for crawlability.
 */
export function CategoryHero({
  title,
  categorySlug,
  subcategories,
  activeSubSlug = null,
}: CategoryHeroProps) {
  return (
    <header className="border-b border-gray-100 bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-7 sm:px-6 md:pb-6 md:pt-10 lg:px-8">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Enviro Aqua / Shop
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500 sm:text-base">
          {CATEGORY_SUBTITLES[categorySlug] ?? 'Explore our collection.'}
        </p>
        {subcategories.length > 0 && (
          <nav aria-label="Browse subcategories" className="mt-7">
            <ul role="list" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
              <li className="shrink-0">
                <Link
                  href={`/${categorySlug}/`}
                  aria-current={activeSubSlug === null ? 'page' : undefined}
                  className={clsx(
                    'inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                    activeSubSlug === null
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-950',
                  )}
                >
                  All products
                </Link>
              </li>
              {subcategories.map((sub) => {
                const active = sub.slug === activeSubSlug;
                return (
                  <li key={sub.slug} className="shrink-0">
                    <Link
                      href={`/${categorySlug}/${sub.slug}/`}
                      aria-current={active ? 'page' : undefined}
                      className={clsx(
                        'inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-950',
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

/** Retains descriptive SEO content in the initial HTML, below the catalogue. */
export function CategorySeoCopy({ title, intro }: { title: string; intro: string | null }) {
  if (!intro) return null;
  return (
    <section aria-label={`About ${title}`} className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">About {title}</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">{intro}</p>
      </div>
    </section>
  );
}
