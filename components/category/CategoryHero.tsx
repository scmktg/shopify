import type { Subcategory } from '@/content/categories';

interface CategoryHeroProps {
  title: string;
  intro: string | null;
  categorySlug: string;
  subcategories: ReadonlyArray<Subcategory>;
  activeSubSlug?: string | null;
}

/**
 * Compact shared category heading. Catalogue controls are visually aligned
 * to its right on wide screens; all category copy stays in the HTML below.
 */
export function CategoryHero({ title, categorySlug }: CategoryHeroProps) {
  const descriptions: Record<string, string> = {
    'water-filters': 'Filtration solutions for your home, business and projects.',
    'cartridges': 'Find the right replacement cartridges for your system.',
    'bubblers-and-coolers': 'Drinking water solutions for commercial and shared spaces.',
    'tanks-and-bunds': 'Practical tanks, bunds and water-treatment storage.',
    'plumbing': 'Fixtures and fittings for every space.',
  };

  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-center px-4 pb-4 pt-7 sm:px-6 lg:px-8 xl:h-[112px] xl:py-4 xl:pr-[455px]">
        <h1 className="text-[clamp(1.85rem,3vw,2.25rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-slate-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-5 text-slate-500">
          {descriptions[categorySlug] ?? 'Explore our range and find the right product.'}
        </p>
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
