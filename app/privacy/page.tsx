import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadMarkdownPage } from '@/lib/content/markdown';
import { StaticContentPage } from '@/components/editorial/StaticContentPage';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

const PATH = '/privacy';

export async function generateMetadata(): Promise<Metadata> {
  const page = await loadMarkdownPage('privacy');
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: PATH },
  };
}

export default async function PrivacyPage() {
  const page = await loadMarkdownPage('privacy');
  if (!page) notFound();
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Privacy policy', href: PATH },
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
