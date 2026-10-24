import type { Metadata } from 'next';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { loadMarkdownPage } from '@/lib/content/markdown';
import { EditorialPage } from '@/components/editorial/EditorialPage';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  faqPageSchema,
  type JsonLd,
} from '@/lib/seo/jsonld';

interface PageProps {
  params: Promise<{ slug: string; subslug: string }>;
}

const SECTION = 'use';
const SECTION_LABEL = 'Use cases';
const SECTION_PATH = '/use';

export async function generateStaticParams() {
  const params: Array<{ slug: string; subslug: string }> = [];
  const useDir = path.join(process.cwd(), 'content', SECTION);
  const entries = await fs.readdir(useDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const subDir = path.join(useDir, entry.name);
    const subFiles = await fs.readdir(subDir);
    for (const file of subFiles) {
      if (file.endsWith('.md') && file !== 'index.md') {
        params.push({
          slug: entry.name,
          subslug: file.replace(/\.md$/, ''),
        });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, subslug } = await params;
  const page = await loadMarkdownPage(`${SECTION}/${slug}/${subslug}`);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SECTION}/${slug}/${subslug}` },
  };
}

async function loadParentTitle(slug: string): Promise<string | null> {
  const parent = await loadMarkdownPage(`${SECTION}/${slug}`);
  return parent?.title ?? null;
}

export default async function UseSubPage({ params }: PageProps) {
  const { slug, subslug } = await params;
  const page = await loadMarkdownPage(`${SECTION}/${slug}/${subslug}`);
  if (!page) notFound();

  const products = page.tagFilter
    ? (
        await getProducts({
          query: `tag:'${page.tagFilter}'`,
          first: 24,
        })
      ).products
    : [];

  const parentTitle = (await loadParentTitle(slug)) ?? slug;

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: SECTION_LABEL, href: SECTION_PATH },
    { name: parentTitle, href: `/${SECTION}/${slug}/` },
    { name: page.title, href: `/${SECTION}/${slug}/${subslug}/` },
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
