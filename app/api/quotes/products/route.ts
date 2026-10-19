import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify/queries/getProducts';

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim();
  if (query.length < 2 || query.length > 80) {
    return NextResponse.json({ products: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const result = await getProducts({ query, first: 12 });
    return NextResponse.json({
      products: result.products.map((product) => ({
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
