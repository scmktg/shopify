import Link from 'next/link';
import type { MarkdownPage } from '@/lib/content/markdown';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';
import { FaqAccordion } from './FaqAccordion';

interface StaticContentPageProps {
  page: MarkdownPage;
  breadcrumbs: ReadonlyArray<BreadcrumbItem>;
  children?: React.ReactNode;
}

/**
 * Layout for non-catalogue static pages — about, our-pricing,
 * shipping, returns, privacy, terms. Same shape as EditorialPage
 * but without the product grid.
 *
 * `children` slot lets pages append page-specific UI below the
 * markdown body (e.g. the contact form on /contact/).
 */
export function StaticContentPage({
  page,
  breadcrumbs,
  children,
}: StaticContentPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-black">
        {page.title}
      </h1>

      <div
        className="prose prose-base max-w-none mt-6"
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />

      {children}

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
