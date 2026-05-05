import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
import { CATEGORIES } from '@/content/categories';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const navItems = CATEGORIES.map((c) => ({
    label: c.label,
    href: `/${c.slug}/`,
  }));

  return (
    <header className="sticky top-0 z-40 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-lg tracking-wide">
          ENVIRO AQUA
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-stretch h-full"
        >
          <ul className="flex items-stretch h-full gap-2">
            {CATEGORIES.map((category) => (
              <li
                key={category.slug}
                className="relative flex items-stretch group"
              >
                <Link
                  href={`/${category.slug}/`}
                  className="inline-flex items-center px-3 text-sm font-medium hover:underline underline-offset-4"
                >
                  {category.label}
                </Link>
                {category.subcategories.length > 0 && (
                  <div
                    role="presentation"
                    className="absolute left-0 top-full w-64 bg-black border border-white/10 shadow-lg opacity-0 invisible translate-y-1 transition-[opacity,transform,visibility] duration-150 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0"
                  >
                    <ul className="py-2">
                      {category.subcategories.map((sub) => (
                        <li key={sub.slug}>
                          <Link
                            href={`/${category.slug}/${sub.slug}/`}
                            className="block px-4 py-2 text-sm hover:bg-white/10"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={`/${category.slug}/`}
                          className="block px-4 py-2 mt-1 text-sm font-semibold border-t border-white/10 hover:bg-white/10"
                        >
                          Shop all {category.label}
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
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
          <MobileMenu items={navItems} />
        </div>
      </div>
    </header>
  );
}
