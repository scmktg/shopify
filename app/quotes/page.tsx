import type { Metadata } from 'next';
import { QuoteDownloadBuilder } from './QuoteDownloadBuilder';

export const metadata: Metadata = {
 title: 'Generate a Quote | Enviro Aqua',
 description: 'Build a live product quotation and save it as a PDF without waiting for email.',
 robots: { index: false, follow: false },
};

export default function QuotesPage(){return <QuoteDownloadBuilder/>;}
