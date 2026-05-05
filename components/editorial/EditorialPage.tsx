import Link from 'next/link';
import { ProductGrid } from '@/components/product/ProductGrid';
import type { MarkdownPage } from '@/lib/content/markdown';
import type { ProductCardData } from '@/types/product';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';
import { FaqAccordion } from './FaqAccordion';

interface EditorialPageProps {
  page: MarkdownPage;
  breadcrumbs: ReadonlyArray<BreadcrumbItem>;
  products?: ReadonlyArray<ProductCardData>;
}

export function EditorialPage({
  page,
  breadcrumbs,
  products,
}: EditorialPageProps) {
  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-black">
        {page.title}
      </h1>

      <div
        className="prose prose-base max-w-none mt-6"
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />

      {products && products.length > 0 && (
        <section className="mt-12 not-prose">
          <h2 className="text-2xl font-semibold text-black mb-6">
            {page.productGridTitle ?? 'Recommended products'}
          </h2>
          <ProductGrid products={products} />
        </section>
      )}

      {page.faq.length > 0 && (
        <section className="mt-12 not-prose">
          <h2 className="text-2xl font-semibold text-black mb-4">
            Frequently asked questions
          </h2>
          <FaqAccordion items={page.faq} />
        </section>
      )}

      {page.relatedLinks.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-6 not-prose">
          <h2 className="text-base font-semibold text-black uppercase tracking-wider">
            Related
          </h2>
          <ul className="mt-3 space-y-1">
            {page.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-brand-blue hover:underline underline-offset-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
