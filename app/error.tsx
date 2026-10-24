'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[error]', error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
      <p className="text-sm font-semibold tracking-wider uppercase text-brand-blue">
        Error
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-black">
        Something went wrong
      </h1>
      <p className="mt-4 text-base text-black/70">
        We hit an unexpected error rendering this page. You can retry, or head
        back to the homepage.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-black/50">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold px-6 py-3 rounded transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-white border border-black text-black font-semibold px-6 py-3 rounded hover:bg-gray-50 transition-colors"
        >
          Go to homepage
        </Link>
      </div>
    </section>
  );
}
