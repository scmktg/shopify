import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadMarkdownPage } from '@/lib/content/markdown';
import { StaticContentPage } from '@/components/editorial/StaticContentPage';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  faqPageSchema,
  type JsonLd,
} from '@/lib/seo/jsonld';

const PATH = '/returns/';

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadMarkdownPage('returns');
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: PATH },
  };
}

export default async function ReturnsPage() {
  const page = await loadMarkdownPage('returns');
  if (!page) notFound();
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Returns & warranty', href: PATH },
  ];
  const ld: JsonLd[] = [
    breadcrumbSchema(
      breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
    ),
  ];
  if (page.faq.length > 0) ld.push(faqPageSchema(page.faq));
  return (
    <>
      <JsonLdScript data={ld} />
      <StaticContentPage page={page} breadcrumbs={breadcrumbs} />
    </>
  );
}
