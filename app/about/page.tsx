import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadMarkdownPage } from '@/lib/content/markdown';
import { StaticContentPage } from '@/components/editorial/StaticContentPage';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

const PATH = '/about/';

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadMarkdownPage('about/index');
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: PATH },
  };
}

export default async function AboutPage() {
  const page = await loadMarkdownPage('about/index');
  if (!page) notFound();
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'About', href: PATH },
  ];
  return (
    <>
      <JsonLdScript
        data={breadcrumbSchema(
          breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
        )}
      />
      <StaticContentPage page={page} breadcrumbs={breadcrumbs} />
    </>
  );
}
