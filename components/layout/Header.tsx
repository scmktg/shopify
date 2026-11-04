import Image from 'next/image';
import Link from 'next/link';
import { CartButton } from '@/components/cart/CartButton';
import { SearchBar } from '@/components/search/SearchBar';
import { DepartmentNavigation } from './DepartmentNavigation';

export function Header() {
  return (
    <header className="relative z-50 bg-white text-black">
      <div className="mx-auto flex h-[76px] w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8 xl:gap-6 2xl:px-10">
        <Link
          href="/"
          aria-label="Enviro Aqua - home"
          className="relative z-10 inline-flex shrink-0 items-center xl:mr-3"
        >
          <span className="relative block h-[54px] w-[210px] sm:h-[60px] sm:w-[248px]">
            <Image src="/Enviro-Aqua-Logo.webp" alt="Enviro Aqua" fill unoptimized priority
              sizes="(min-width: 640px) 248px, 210px"
              className="pointer-events-none object-contain object-left select-none" />
          </span>
        </Link>
        <div className="hidden min-w-0 flex-1 xl:flex xl:justify-center">
          <DepartmentNavigation />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-3 xl:gap-3">
          <SearchBar triggerClassName="inline-flex h-10 w-10 items-center justify-center rounded text-black transition-colors hover:text-brand-blue" />
          <CartButton className="relative inline-flex h-10 w-10 items-center justify-center rounded text-black transition-colors hover:text-brand-blue" />
          <div className="xl:hidden"><DepartmentNavigation /></div>
        </div>
      </div>
    </header>
  );
}
