import type { Metadata } from 'next';
import { listSectionPages } from '@/lib/content/markdown';
import { SectionHub } from '@/components/editorial/SectionHub';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'Help & Buying Guides',
  description:
    'How-to guides and buying advice for Australian water filtration. WaterMark certification, choosing a system, DIY install steps.',
  alternates: { canonical: '/help/' },
};

const INTRO =
  'Practical guides for choosing, installing, and maintaining water filtration systems in Australia. We add new guides regularly — if there is something specific you need to know, get in touch.';

export default async function HelpHub() {
  const items = await listSectionPages('help');
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Help & guides', href: '/help/' },
  ];
  return (
    <>
      <JsonLdScript
        data={breadcrumbSchema(
          breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
        )}
      />
      <SectionHub
        title="Help & buying guides"
        intro={INTRO}
        sectionPath="/help/"
        items={items}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
