'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import { searchProducts } from '@/lib/shopify/queries/searchProducts';
import { getProductUrl } from '@/lib/utils/productUrl';
import type { ProductCardData } from '@/types/product';

const DEBOUNCE_MS = 300;

interface SearchBarProps {
  triggerClassName?: string;
}

export function SearchBar({ triggerClassName }: SearchBarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReadonlyArray<ProductCardData>>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(() => {
      startTransition(() => {
        void (async () => {
          try {
            const next = await searchProducts(trimmed, 8);
            setResults(next);
          } catch {
            setResults([]);
          }
        })();
      });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query, isOpen]);

  function close() {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    close();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function navigate() {
    close();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          'inline-flex items-center justify-center h-10 w-10 rounded hover:opacity-80'
        }
      >
        <Search size={20} aria-hidden="true" />
      </button>

      <div
        aria-hidden="true"
        onClick={close}
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        inert={!isOpen}
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 bg-white text-black shadow-xl transition-transform duration-200 ease-out',
          isOpen ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <form
            onSubmit={submit}
            role="search"
            className="flex items-center gap-2 border-b border-gray-200 pb-3"
          >
            <Search
              size={20}
              aria-hidden="true"
              className="flex-shrink-0 text-black/60"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              autoComplete="off"
              className="flex-1 bg-transparent text-base text-black placeholder:text-black/50 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="text-black/60 hover:text-black"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              aria-label="Close search"
              onClick={close}
              className="text-sm font-medium text-black/70 hover:text-black ml-2"
            >
              Cancel
            </button>
          </form>

          <div className="mt-3 max-h-[60vh] overflow-y-auto">
            {query.trim().length < 2 ? (
              <p className="py-6 text-sm text-black/60">
                Type at least two characters to see suggestions.
              </p>
            ) : isPending && results.length === 0 ? (
              <p className="py-6 text-sm text-black/60">Searching…</p>
            ) : results.length === 0 ? (
              <p className="py-6 text-sm text-black/60">
                No results for &ldquo;{query.trim()}&rdquo;.
              </p>
            ) : (
              <ul role="list" className="py-2">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={getProductUrl(product.handle)}
                      onClick={navigate}
                      className="flex items-center gap-3 py-2 px-1 rounded hover:bg-gray-100"
                    >
                      <div className="relative flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded overflow-hidden">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText ?? product.title}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        ) : null}
                      </div>
                      <span className="flex-1 min-w-0 text-sm text-black line-clamp-2">
                        {product.title}
                      </span>
                    </Link>
                  </li>
                ))}
                <li className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = query.trim();
                      if (!trimmed) return;
                      close();
                      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
                    }}
                    className="block w-full text-left px-1 py-2 text-sm font-medium text-brand-blue hover:underline underline-offset-4"
                  >
                    See all results for &ldquo;{query.trim()}&rdquo; →
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
