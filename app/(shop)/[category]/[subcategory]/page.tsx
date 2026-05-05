import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findSubcategory } from '@/content/categories';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CategoryView } from '@/components/category/CategoryView';

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  const node = findSubcategory(category, subcategory);
  if (!node) return {};
  return {
    title: `${node.subcategory.label} | ${node.category.label}`,
    description: `${node.subcategory.label.toLowerCase()} in our ${node.category.label.toLowerCase()} range. Wholesale prices, free shipping over $200.`,
    alternates: {
      canonical: `/${category}/${subcategory}/`,
    },
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const node = findSubcategory(category, subcategory);
  if (!node) notFound();

  const query = `tag:'primary-cat:${category}' AND tag:'sub-cat:${subcategory}'`;
  const page = await getProducts({ query, first: PAGE_SIZE });

  return (
    <>
      <CategoryHero
        title={`${node.subcategory.label} ${node.category.label}`}
        intro={null}
        categorySlug={node.category.slug}
        subcategories={node.category.subcategories}
        activeSubSlug={node.subcategory.slug}
      />
      <CategoryView
        initialProducts={page.products}
        initialPageInfo={page.pageInfo}
        query={query}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
