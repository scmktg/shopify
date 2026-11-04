import Link from 'next/link';
import type { Subcategory } from '@/content/categories';

interface CategoryHeroProps {
  title: string;
  intro: string | null;
  categorySlug: string;
  subcategories: ReadonlyArray<Subcategory>;
  activeSubSlug?: string | null;
}

/**
 * Shared category heading for all catalogue levels, including size pages.
 * One compact hierarchy, prominent H1 and readable supporting copy.
 */
export function CategoryHero({
  title,
  categorySlug,
}: CategoryHeroProps) {
  const categoryNames: Record<string, string> = {
    'water-filters': 'Water Filters',
    'cartridges': 'Filter Cartridges',
    'bubblers-and-coolers': 'Fountains & Coolers',
    'tanks-and-bunds': 'Tanks & Bunds',
    'plumbing': 'Plumbing',
  };
  const descriptions: Record<string, string> = {
    'water-filters': 'Find the right filtration solution for your home, business or project.',
    'cartridges': 'Explore replacement cartridges for clear, great-tasting water.',
    'bubblers-and-coolers': 'Reliable drinking water solutions for shared and commercial spaces.',
    'tanks-and-bunds': 'Practical storage and containment solutions for water treatment.',
    'plumbing': 'Discover reliable fixtures and fittings for everyday spaces.',
  };
  const categoryName = categoryNames[categorySlug] ?? 'Shop';
  const isCategoryHome = title.toLowerCase() === categoryName.toLowerCase()
    || (categorySlug === 'cartridges' && title.toLowerCase() === 'cartridges');

  return (
    <header className="border-b border-slate-200 bg-gradient-to-b from-[#f6f9fc] to-white">
      <div className="mx-auto max-w-7xl px-4 pb-9 pt-7 sm:px-6 sm:pb-11 sm:pt-9 lg:px-8 lg:pb-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
          <Link href="/" className="transition-colors hover:text-slate-950">Home</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          {isCategoryHome ? (
            <span aria-current="page" className="text-slate-700">{categoryName}</span>
          ) : (
            <>
              <Link href={`/${categorySlug}/`} className="transition-colors hover:text-slate-950">{categoryName}</Link>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span aria-current="page" className="text-slate-700">{title}</span>
            </>
          )}
        </nav>
        <div className="mt-7 max-w-3xl">
          <h1 className="text-[clamp(2rem,4.6vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.045em] text-slate-950">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            {descriptions[categorySlug] ?? 'Explore our range and find the right product for your needs.'}
          </p>
        </div>
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
