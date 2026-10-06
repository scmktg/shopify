import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadMarkdownPage, listMarkdownSlugs } from '@/lib/content/markdown';
import { EditorialPage } from '@/components/editorial/EditorialPage';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { BUSINESS_INFO } from '@/content/business-info';
import { absoluteUrl, getSiteUrl } from '@/lib/seo/siteUrl';
import { breadcrumbSchema, faqPageSchema, type JsonLd } from '@/lib/seo/jsonld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SECTION = 'locations';
const SECTION_LABEL = 'Locations';
const SECTION_PATH = '/locations';

export async function generateStaticParams() {
  const slugs = await listMarkdownSlugs(SECTION);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadMarkdownPage(`${SECTION}/${slug}`);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SECTION}/${slug}` },
  };
}

function locationSchema(slug: string, name: string): JsonLd {
  const path = `/${SECTION}/${slug}`;

  if (slug === 'central-coast-nsw') {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${absoluteUrl(path)}#local-business`,
      name: BUSINESS_INFO.name,
      description: name,
      telephone: BUSINESS_INFO.phone.tel,
      url: getSiteUrl(),
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS_INFO.address.street,
        addressLocality: BUSINESS_INFO.address.locality,
        addressRegion: BUSINESS_INFO.address.region,
        postalCode: BUSINESS_INFO.address.postalCode,
        addressCountry: BUSINESS_INFO.address.country,
      },
      areaServed: { '@type': 'AdministrativeArea', name: 'Central Coast NSW' },
    };
  }

  if (slug === 'sydney-nsw') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${absoluteUrl(path)}#service-area`,
      name: 'Enviro Aqua Sydney water filtration service area',
      description: name,
      provider: {
        '@type': 'Organization',
        name: BUSINESS_INFO.name,
        telephone: BUSINESS_INFO.phone.tel,
        url: getSiteUrl(),
      },
      areaServed: { '@type': 'City', name: 'Sydney NSW' },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': absoluteUrl(path),
    name,
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await loadMarkdownPage(`${SECTION}/${slug}`);
  if (!page) notFound();

  const products = (await getProducts({ first: 24, sortKey: 'BEST_SELLING' })).products;

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: SECTION_LABEL, href: SECTION_PATH },
    { name: page.title, href: `/${SECTION}/${slug}/` },
  ];

  const ld: JsonLd[] = [
    breadcrumbSchema(breadcrumbs.map((b) => ({ name: b.name, path: b.href }))),
    locationSchema(slug, page.title),
  ];
  if (page.faq.length > 0) ld.push(faqPageSchema(page.faq));

  return <>
    <JsonLdScript data={ld} />
    <EditorialPage page={page} products={products} breadcrumbs={breadcrumbs} />
  </>;
}
