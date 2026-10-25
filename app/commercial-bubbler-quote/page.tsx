import type { Metadata } from 'next';
import { QuoteDownloadBuilder } from '@/app/quotes/QuoteDownloadBuilder';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';

export const metadata: Metadata = {
  title: 'Commercial Bubbler Quote Builder | Enviro Aqua',
  description: 'Choose a commercial bubbler, quantity and delivery details, then download a formal PDF quotation.',
  robots: { index: false, follow: false },
};

const BUBBLER_HANDLES = [
  'commercial-stainless-steel-filtered-cold-water-bubbler-round-wm',
  'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des',
  'commercial-rust-free-filtered-cold-water-bubbler-wm',
] as const;

export default async function CommercialBubblerQuotePage() {
  const fetched = await Promise.all(BUBBLER_HANDLES.map((handle) => getProductByHandle(handle)));
  const bubblerProducts = fetched.filter((product) => product !== null).map((product) => ({
    id: product.id,
    handle: product.handle,
    title: product.title,
    image: product.images[0] ? { url: product.images[0].url, altText: product.images[0].altText } : null,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      availableForSale: variant.availableForSale,
      price: variant.price,
    })),
  }));
  return <QuoteDownloadBuilder bubblerOnly bubblerProducts={bubblerProducts} />;
}
