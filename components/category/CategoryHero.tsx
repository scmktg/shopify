import type { Subcategory } from '@/content/categories';

interface CategoryHeroProps {
  title: string;
  intro: string | null;
  categorySlug: string;
  subcategories: ReadonlyArray<Subcategory>;
  activeSubSlug?: string | null;
}

/**
 * A compact, customer-first category heading. Descriptive catalogue copy
 * remains on the page in CategorySeoCopy, below the product listing.
 * Subcategory links are provided by the adjacent Type selector and the footer.
 */
export function CategoryHero({
  title,
  categorySlug,
}: CategoryHeroProps) {
  return (
    <header className="border-b border-gray-100 bg-slate-50/70">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-7 sm:px-6 md:pb-6 md:pt-10 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl">
          {title}
        </h1>

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
