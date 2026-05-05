'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  items: ReadonlyArray<NavItem>;
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
        onClick={() => setIsOpen(true)}
        className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded hover:opacity-80"
      >
        <Menu size={24} aria-hidden="true" />
      </button>

      <div
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!isOpen}
        className={clsx(
          'fixed inset-0 z-50 bg-black text-white md:hidden transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <span className="font-semibold text-lg tracking-wide">ENVIRO AQUA</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center h-10 w-10 rounded hover:opacity-80"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile primary" className="flex flex-col px-4 py-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center min-h-12 text-lg font-medium border-b border-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 px-4 pt-4">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex items-center gap-2 min-h-12 px-4 rounded hover:opacity-80"
          >
            <Search size={20} aria-hidden="true" />
            <span className="text-base">Search</span>
          </button>
          <button
            type="button"
            aria-label="Cart"
            className="inline-flex items-center gap-2 min-h-12 px-4 rounded hover:opacity-80"
          >
            <ShoppingCart size={20} aria-hidden="true" />
            <span className="text-base">Cart</span>
          </button>
        </div>
      </div>
    </>
  );
}
