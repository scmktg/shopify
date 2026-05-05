import type { Metadata } from 'next';
import { listSectionPages } from '@/lib/content/markdown';
import { SectionHub } from '@/components/editorial/SectionHub';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

const PATH = '/use/';

export const metadata: Metadata = {
  title: 'Water Filters by Use Case',
  description:
    'Curated water filtration setups by use case — home drinking water, rural tank water, whole-home, commercial and cafe, rental-friendly.',
  alternates: { canonical: PATH },
};

const INTRO =
  'Pick the page that matches how you use water at home or work. Each one walks through the standard configurations for that use case, with a curated product grid and the FAQs we hear most often.';

export default async function UseHub() {
  const items = await listSectionPages('use');
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Use cases', href: PATH },
  ];
  return (
    <>
      <JsonLdScript
        data={breadcrumbSchema(
          breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
        )}
      />
      <SectionHub
        title="Water filters by use case"
        intro={INTRO}
        sectionPath={PATH}
        items={items}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
