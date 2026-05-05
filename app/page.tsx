import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="text-4xl sm:text-5xl font-semibold text-black">
        Enviro Aqua
      </h1>
      <p className="mt-4 text-lg text-black">
        Australia&apos;s water filtration specialist. Wholesale prices for everyone — no accounts, no quotes.
      </p>
      <div className="mt-8">
        <Link
          href="/water-filters/"
          className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
        >
          Shop water filters
        </Link>
      </div>
    </section>
  );
}
