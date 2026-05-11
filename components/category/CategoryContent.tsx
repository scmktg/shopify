import type { CategoryContent as CategoryContentData } from '@/lib/content/categoryContent';
import { CategoryFaqList } from './CategoryFaqList';

interface CategoryIntroProps {
  introHtml: CategoryContentData['introHtml'];
}

/**
 * Long-form intro rendered between the hero and the product grid.
 * Server-rendered HTML — search engines see the full body in the
 * initial response. Tailwind Typography handles paragraph + heading
 * styling so the writer can use H2/H3 freely without coupling to
 * specific Tailwind classes.
 */
export function CategoryIntro({ introHtml }: CategoryIntroProps) {
  if (!introHtml) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-2 pb-8">
      <div
        className="prose prose-sm sm:prose-base max-w-none prose-headings:tracking-tight prose-headings:text-black prose-p:text-black/80 prose-a:text-brand-blue"
        dangerouslySetInnerHTML={{ __html: introHtml }}
      />
    </section>
  );
}

interface CategoryBuyingGuideProps {
  buyingGuide: CategoryContentData['buyingGuide'];
  faq: CategoryContentData['faq'];
}

/**
 * Buying guide + FAQ block rendered below the product grid. Both
 * sections are optional and absent ones are skipped; the wrapper
 * renders only when at least one is populated.
 */
export function CategoryBuyingGuide({
  buyingGuide,
  faq,
}: CategoryBuyingGuideProps) {
  if (!buyingGuide && faq.length === 0) return null;
  return (
    <section className="mt-12 border-t border-black/10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {buyingGuide && (
          <>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
              {buyingGuide.title}
            </h2>
            <div
              className="prose prose-sm sm:prose-base max-w-none mt-4 prose-headings:tracking-tight prose-headings:text-black prose-p:text-black/80 prose-a:text-brand-blue"
              dangerouslySetInnerHTML={{ __html: buyingGuide.bodyHtml }}
            />
          </>
        )}
        {faq.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black">
              Frequently asked
            </h2>
            <CategoryFaqList items={faq} />
          </div>
        )}
      </div>
    </section>
  );
}
