import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findCategory } from '@/content/categories';
import { getCategoryIntro } from '@/content/category-intros';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CategoryView } from '@/components/category/CategoryView';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  collectionSchema,
} from '@/lib/seo/jsonld';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const node = findCategory(category);
  if (!node) return {};
  return {
    title: `${node.label} | Wholesale Prices`,
    description: `Shop ${node.label.toLowerCase()} at wholesale prices. Tiered shipping Australia-wide from $9.95, free freight on whole-house systems. WaterMark certified options available.`,
    alternates: {
      canonical: `/${node.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const node = findCategory(category);
  if (!node) notFound();

  const query = `tag:'primary-cat:${category}'`;
  const page = await getProducts({ query, first: PAGE_SIZE });

  const intro = getCategoryIntro(category);

  const pathname = `/${node.slug}`;

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(node.label, pathname, intro),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: node.label, path: pathname },
          ]),
        ]}
      />
      <CategoryHero
        title={node.label}
        intro={intro}
        categorySlug={node.slug}
        subcategories={node.subcategories}
      />
      <CategoryView
        initialProducts={page.products}
        initialPageInfo={page.pageInfo}
        query={query}
        pageSize={PAGE_SIZE}
        enableSizeFilter={category === 'cartridges'}
      />
    </>
  );
}
