import type { Metadata } from 'next';
import { QuoteBuilder } from './QuoteBuilder';

export const metadata: Metadata = {
  title: 'Formal Quotations',
  description: 'Prepare a product quotation for school, business or organisation purchasing approval.',
  robots: { index: false, follow: false },
};

export default function QuotesPage() {
  return <QuoteBuilder />;
}
