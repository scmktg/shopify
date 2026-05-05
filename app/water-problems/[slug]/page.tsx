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

const SECTION = 'water-problems';
const SECTION_LABEL = 'Water problems';
const SECTION_PATH = '/water-problems/';

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

export default async function WaterProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await loadMarkdownPage(`${SECTION}/${slug}`);
  if (!page) notFound();

  const products = page.tagFilter
    ? (
        await getProducts({
          query: `tag:'${page.tagFilter}'`,
          first: 24,
        })
      ).products
    : [];

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: SECTION_LABEL, href: SECTION_PATH },
    { name: page.title, href: `/${SECTION}/${slug}/` },
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
      <EditorialPage
        page={page}
        products={products}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
