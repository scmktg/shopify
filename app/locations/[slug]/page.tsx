import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadMarkdownPage, listMarkdownSlugs } from '@/lib/content/markdown';
import { EditorialPage } from '@/components/editorial/EditorialPage';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  faqPageSchema,
  type JsonLd,
} from '@/lib/seo/jsonld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SECTION = 'locations';
const SECTION_LABEL = 'Locations';
const SECTION_PATH = '/locations/';

export async function generateStaticParams() {
  const slugs = await listMarkdownSlugs(SECTION);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadMarkdownPage(`${SECTION}/${slug}`);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SECTION}/${slug}/` },
  };
}

function localBusinessSchema(slug: string, name: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://enviroaqua.com.au/${SECTION}/${slug}/`,
    name: 'Enviro Aqua',
    description: name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Central Coast',
      addressRegion: 'NSW',
      addressCountry: 'AU',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Central Coast NSW and Australia-wide',
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await loadMarkdownPage(`${SECTION}/${slug}`);
  if (!page) notFound();

  // Location pages list popular catalogue products rather than a
  // tag-filtered subset — locals are buying anything we sell.
  const products = (
    await getProducts({ first: 24, sortKey: 'BEST_SELLING' })
  ).products;

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: SECTION_LABEL, href: SECTION_PATH },
    { name: page.title, href: `/${SECTION}/${slug}/` },
  ];

  const ld: JsonLd[] = [
    breadcrumbSchema(
      breadcrumbs.map((b) => ({ name: b.name, path: b.href })),
    ),
    localBusinessSchema(slug, page.title),
  ];
  if (page.faq.length > 0) ld.push(faqPageSchema(page.faq));

  return (
    <>
      <JsonLdScript data={ld} />
      <EditorialPage
        page={page}
        products={products}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
