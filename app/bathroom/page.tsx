import type { Metadata } from 'next';
import Link from 'next/link';
import { DEPARTMENTS } from '@/content/departments';

export const metadata: Metadata = {
  title: 'Bathroom Supplies, Toilets & Tapware Australia',
  description: 'Explore toilets, bathroom tapware, kitchen mixers and bathroom packages at Enviro Aqua. Browse the bathroom range online.',
  alternates: { canonical: '/bathroom/' },
};

const descriptions: Record<string, string> = {
  Toilets: 'Explore bathroom toilets and suites.',
  'Bathroom Tapware': 'Find taps and mixers for your basin and bathroom.',
  'Kitchen Tapware': 'Browse kitchen mixers and tapware.',
  'Bathroom Packages': 'Shop coordinated bathroom product packages.',
};

export default function BathroomLandingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link><span className="mx-2">/</span><span>Bathroom Supplies</span>
      </nav>
      <header className="max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-blue">Enviro Aqua bathrooms</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Bathroom Supplies</h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-600">Explore tapware, toilets and bathroom packages in one easy place. Choose a category to find products for your renovation or project.</p>
      </header>
      <section aria-label="Shop bathroom categories" className="mt-10 grid gap-4 sm:grid-cols-2">
        {DEPARTMENTS.bathroom.links.map((link) => (
          <Link key={link.href} href={link.href}
            className="group flex min-h-40 flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-6 transition-colors hover:border-brand-blue hover:bg-white">
            <div>
              <h2 className="text-xl font-semibold group-hover:text-brand-blue">{link.label}</h2>
              <p className="mt-2 text-sm text-gray-600">{descriptions[link.label]}</p>
            </div>
            <span className="mt-6 text-sm font-semibold text-brand-blue">Shop {link.label} →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
