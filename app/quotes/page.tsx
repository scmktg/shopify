import type { Metadata } from 'next';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { QuoteDownloadBuilder, type QuoteSeedLine } from './QuoteDownloadBuilder';

export const metadata: Metadata = {
 title: 'Generate a Quote | Enviro Aqua',
 description: 'Build a live product quotation and save it as a PDF without waiting for email.',
 robots: { index: false, follow: false },
};

interface QuotesPageProps {
 searchParams: Promise<{ product?: string; variant?: string; quantity?: string }>;
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
 const { product: handle, variant: variantId, quantity: rawQuantity } = await searchParams;
 let initialLine: QuoteSeedLine | null = null;
 const quantity = Number(rawQuantity);
 if (handle && /^[a-z0-9-]{2,160}$/.test(handle) &&
     variantId && /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId) &&
     Number.isInteger(quantity) && quantity >= 1 && quantity <= 99) {
  // Re-read Shopify rather than trusting product names, availability or prices in the URL.
  const product = await getProductByHandle(handle);
  const variant = product?.variants.find(v => v.id === variantId);
  const price = Number(variant?.price.amount);
  if (product && variant?.availableForSale && variant.price.currencyCode === 'AUD' &&
      Number.isFinite(price) && price >= 0) {
   initialLine = {
    id: variant.id, handle: product.handle, title: product.title,
    variant: variant.title, quantity, cents: Math.round(price * 100),
   };
  }
 }
 return <QuoteDownloadBuilder initialLine={initialLine} />;
}
