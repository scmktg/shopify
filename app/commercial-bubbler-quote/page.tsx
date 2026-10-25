import type { Metadata } from 'next';
import { QuoteDownloadBuilder } from '@/app/quotes/QuoteDownloadBuilder';

export const metadata: Metadata = {
  title: 'Commercial Bubbler Quote Builder | Enviro Aqua',
  description: 'Build a quote for commercial drinking water bubblers, choose quantities and delivery, then download a PDF for your purchase order approval.',
  robots: { index: false, follow: false },
};

export default function CommercialBubblerQuotePage() {
  return <QuoteDownloadBuilder bubblerOnly />;
}
