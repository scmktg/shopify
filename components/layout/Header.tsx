import { CartButton } from '@/components/cart/CartButton';
import { SearchBar } from '@/components/search/SearchBar';
import { DepartmentNavigation } from './DepartmentNavigation';
import { DepartmentLogo } from './DepartmentLogo';

export function Header() {
  return (
    <header className="relative z-50 bg-white text-black">
      <div className="mx-auto flex h-[76px] w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8 xl:gap-6 2xl:px-10">
        <div className="relative z-10 shrink-0 xl:mr-1">
          <DepartmentLogo priority />
        </div>
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
