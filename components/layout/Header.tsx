import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import { MobileMenu } from './MobileMenu';

const NAV_ITEMS = [
  { label: 'Water Filters', href: '/water-filters/' },
  { label: 'Cartridges', href: '/cartridges/' },
  { label: 'Bubblers', href: '/bubblers/' },
  { label: 'Pumps & Tanks', href: '/pumps-and-tanks/' },
  { label: 'Plumbing', href: '/plumbing/' },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-lg tracking-wide">
          ENVIRO AQUA
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            className="hidden md:inline-flex items-center justify-center h-10 w-10 rounded hover:opacity-80"
          >
            <Search size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Cart"
            className="hidden md:inline-flex items-center justify-center h-10 w-10 rounded hover:opacity-80"
          >
            <ShoppingCart size={20} aria-hidden="true" />
          </button>
          <MobileMenu items={NAV_ITEMS} />
        </div>
      </div>
    </header>
  );
}
