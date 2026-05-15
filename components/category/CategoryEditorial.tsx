import { renderMarkdown } from '@/lib/content/markdown';
import type { CategoryEditorialSection } from '@/content/category-intros';

interface CategoryEditorialProps {
  sections: ReadonlyArray<CategoryEditorialSection>;
}

/**
 * Below-grid buyer guidance for subcategory pages. Each section
 * renders as an <h2> followed by the markdown body. Heading
 * hierarchy on the page is intentional: <h1> from CategoryHero,
 * <h2> from this component, <h3> from the FAQ accordion below.
 * Markdown bodies are lint-checked against heading syntax in
 * `getCategoryEditorial()` so a stray `## Foo` can't disturb the
 * outline.
 */
export async function CategoryEditorial({ sections }: CategoryEditorialProps) {
  if (sections.length === 0) return null;
  const rendered = await Promise.all(
    sections.map(async (section) => ({
      heading: section.heading,
      html: await renderMarkdown(section.body),
    })),
  );
  return (
    <section className="border-t border-gray-200">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {rendered.map(({ heading, html }) => (
          <div key={heading} className="mt-8 first:mt-0">
            <h2 className="text-2xl font-semibold text-black">{heading}</h2>
            <div
              className="prose prose-base max-w-none mt-3"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
