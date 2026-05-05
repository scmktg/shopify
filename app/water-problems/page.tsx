import type { Metadata } from 'next';
import { listSectionPages } from '@/lib/content/markdown';
import { SectionHub } from '@/components/editorial/SectionHub';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

const PATH = '/water-problems/';

export const metadata: Metadata = {
  title: 'Water Problems & How to Fix Them',
  description:
    'Diagnose what is wrong with your water and find the right filter or treatment system. Chlorine, fluoride, sediment, bacteria, and more.',
  alternates: { canonical: PATH },
};

const INTRO =
  'Pick the problem you are trying to solve. Each page explains what causes it, the methods that actually work, and the products we stock for it. Be specific about your water — different problems need different products.';

export default async function WaterProblemsHub() {
  const items = await listSectionPages('water-problems');
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Water problems', href: PATH },
  ];
  return (
    <>
      <JsonLdScript
        data={breadcrumbSchema(
          breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
        )}
      />
      <SectionHub
        title="Water problems & how to fix them"
        intro={INTRO}
        sectionPath={PATH}
        items={items}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
