import Image from 'next/image';
import Link from 'next/link';
import { CartButton } from '@/components/cart/CartButton';
import { SearchBar } from '@/components/search/SearchBar';
import { DepartmentNavigation } from './DepartmentNavigation';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white text-black">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 xl:gap-4 lg:px-8">
        <Link
          href="/"
          aria-label="Enviro Aqua - home"
          className="relative z-10 inline-flex shrink-0 items-center"
        >
          <Image src="/logo.webp" alt="Enviro Aqua" width={160} height={40}
            priority fetchPriority="high"
            className="pointer-events-none h-9 w-auto select-none" />
        </Link>
        <div className="hidden min-w-0 flex-1 xl:block">
          <DepartmentNavigation />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 xl:ml-0">
          <SearchBar triggerClassName="inline-flex h-10 w-10 items-center justify-center rounded text-black transition-colors hover:text-brand-blue" />
          <CartButton className="relative inline-flex h-10 w-10 items-center justify-center rounded text-black transition-colors hover:text-brand-blue" />
          <div className="xl:hidden"><DepartmentNavigation /></div>
        </div>
      </div>
    </header>
  );
}
