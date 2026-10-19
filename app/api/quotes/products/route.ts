import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/shopify/queries/searchProducts';

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim();
  if (query.length < 2 || query.length > 80) {
    return NextResponse.json({ products: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const products = await searchProducts(query, 12);
    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        title: product.title,
        handle: product.handle,
        image: product.featuredImage ? { url: product.featuredImage.url, altText: product.featuredImage.altText } : null,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          title: variant.title,
          availableForSale: variant.availableForSale,
          price: variant.price,
        })),
      })),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to search products.' }, { status: 503 });
  }
}
