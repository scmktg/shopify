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

const PATH = '/track-order/';

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadMarkdownPage('track-order');
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: PATH },
  };
}

export default async function TrackOrderPage() {
  const page = await loadMarkdownPage('track-order');
  if (!page) notFound();
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Track your order', href: PATH },
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
