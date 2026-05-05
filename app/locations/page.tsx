import type { Metadata } from 'next';
import { listSectionPages } from '@/lib/content/markdown';
import { SectionHub } from '@/components/editorial/SectionHub';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema } from '@/lib/seo/jsonld';

const PATH = '/locations/';

export const metadata: Metadata = {
  title: 'Service Areas & Local Pickup',
  description:
    'Local water filter supplier serving Central Coast NSW and dispatching Australia-wide. Find the page for your area.',
  alternates: { canonical: PATH },
};

const INTRO =
  'We dispatch from Central Coast NSW to addresses across Australia. Each location page below covers local water context, the systems we recommend for the area, and any local-pickup options.';

export default async function LocationsHub() {
  const items = await listSectionPages('locations');
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Locations', href: PATH },
  ];
  return (
    <>
      <JsonLdScript
        data={breadcrumbSchema(
          breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
        )}
      />
      <SectionHub
        title="Service areas"
        intro={INTRO}
        sectionPath={PATH}
        items={items}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
