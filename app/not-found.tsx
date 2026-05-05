import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
      <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">
        404
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-black">
        Page not found
      </h1>
      <p className="mt-4 text-base text-black/70">
        The page you were looking for has moved, been renamed, or never existed.
        Try the homepage or jump straight to the catalogue.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
        >
          Go to homepage
        </Link>
        <Link
          href="/water-filters/"
          className="inline-flex items-center justify-center bg-white border border-black text-black font-semibold px-6 py-3 rounded hover:bg-gray-50 transition-colors"
        >
          Shop water filters
        </Link>
      </div>
    </section>
  );
}
