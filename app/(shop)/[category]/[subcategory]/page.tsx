import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findSubcategory } from '@/content/categories';
import { getCategoryIntro } from '@/content/category-intros';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CategoryView } from '@/components/category/CategoryView';
import {
  CategoryBuyingGuide,
  CategoryIntro,
} from '@/components/category/CategoryContent';
import { loadCategoryContent } from '@/lib/content/categoryContent';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  collectionSchema,
} from '@/lib/seo/jsonld';

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

  const pathname = `/${category}/${subcategory}/`;
  const title = `${node.subcategory.label} ${node.category.label}`;
  const intro = getCategoryIntro(`${category}/${subcategory}`);
  const longForm = await loadCategoryContent(category, subcategory);

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(title, pathname, intro),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: node.category.label, path: `/${category}/` },
            { name: node.subcategory.label, path: pathname },
          ]),
        ]}
      />
      <CategoryHero
        title={title}
        intro={intro}
        categorySlug={node.category.slug}
        subcategories={node.category.subcategories}
        activeSubSlug={node.subcategory.slug}
      />
      {longForm?.introHtml && <CategoryIntro introHtml={longForm.introHtml} />}
      <CategoryView
        initialProducts={page.products}
        initialPageInfo={page.pageInfo}
        query={query}
        pageSize={PAGE_SIZE}
        enableSizeFilter={category === 'cartridges'}
      />
      {longForm && (
        <CategoryBuyingGuide
          buyingGuide={longForm.buyingGuide}
          faq={longForm.faq}
        />
      )}
    </>
  );
}
