'use client';

import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { departmentForPath } from '@/content/departments';

/** Desktop-only department switch; mobile switch stays at the bottom of the menu. */
export function FooterDepartmentSwitch() {
  const pathname = usePathname() ?? '/';
  const isBathroom = departmentForPath(pathname) === 'bathroom';
  return (
    <Link
      href={isBathroom ? '/' : '/bathroom/'}
      className="hidden items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:inline-flex"
    >
      <span>{isBathroom ? 'Explore Filtration Range' : 'Explore Bathroom Range'}</span>
      <ArrowLeftRight size={15} strokeWidth={1.8} aria-hidden="true" />
    </Link>
  );
}
