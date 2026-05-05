import Link from 'next/link';
import type { Subcategory } from '@/content/categories';

interface CategoryHeroProps {
  title: string;
  intro: string | null;
  categorySlug: string;
  subcategories: ReadonlyArray<Subcategory>;
  activeSubSlug?: string | null;
}

export function CategoryHero({
  title,
  intro,
  categorySlug,
  subcategories,
  activeSubSlug = null,
}: CategoryHeroProps) {
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-semibold text-black">
          {title}
        </h1>
        {intro && (
          <p className="mt-4 max-w-3xl text-base text-black/80">{intro}</p>
        )}

        {subcategories.length > 0 && (
          <nav aria-label="Subcategories" className="mt-6 -mb-2">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href={`/${categorySlug}/`}
                  aria-current={activeSubSlug === null ? 'page' : undefined}
                  className={
                    activeSubSlug === null
                      ? 'inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-black text-white'
                      : 'inline-flex items-center px-3 py-1.5 rounded-full text-sm border border-gray-300 text-black hover:border-gray-400'
                  }
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
                      className={
                        active
                          ? 'inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-black text-white'
                          : 'inline-flex items-center px-3 py-1.5 rounded-full text-sm border border-gray-300 text-black hover:border-gray-400'
                      }
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
