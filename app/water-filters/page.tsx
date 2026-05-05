import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Water Filters',
  description:
    'Under-sink, whole-house, reverse osmosis, UV, bench-top and inline water filters. Coming soon.',
};

export default function WaterFiltersPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold text-black">
        Water Filters
      </h1>
      <p className="mt-4 text-base text-black">
        Coming soon. Under-sink, whole-house, reverse osmosis, UV, bench-top and inline systems.
      </p>
    </section>
  );
}
