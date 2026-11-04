'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { departmentForPath } from '@/content/departments';

interface DepartmentLogoProps {
  /** Use the original artwork at every viewport; only the typography is HTML/CSS. */
  priority?: boolean;
  onClick?: () => void;
}

export function DepartmentLogo({ priority = false, onClick }: DepartmentLogoProps) {
  const pathname = usePathname() ?? '/';
  const isBathroom = departmentForPath(pathname) === 'bathroom';

  return (
    <Link
      href={isBathroom ? '/bathroom/' : '/'}
      onClick={onClick}
      aria-label={isBathroom ? 'Enviro Aqua Bathroom Supplies – home' : 'Enviro Aqua Water Filters – home'}
      className="inline-flex max-w-full shrink-0 items-center gap-[5px] rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue sm:gap-1.5"
    >
      <span className="relative block h-[52px] w-[52px] shrink-0 sm:h-[58px] sm:w-[58px]">
        <Image
          src="/Enviro-Aqua-icon-logo.webp"
          alt=""
          aria-hidden="true"
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 640px) 58px, 52px"
          className="object-contain"
        />
      </span>
      <span className="flex min-w-0 flex-col justify-center gap-[3px]">
        <span className="whitespace-nowrap text-[19px] font-extrabold leading-none tracking-[-0.025em] sm:text-[22px] xl:text-[20px] 2xl:text-[23px]">
          <span className="text-[#13833b]">ENVIRO</span>
          <span className="ml-[5px] text-[#0788e8]">AQUA</span>
        </span>
        <span
          className={`flex h-[19px] items-center justify-center rounded-none px-2 text-[10px] font-extrabold uppercase leading-none tracking-[0.12em] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] sm:h-[21px] sm:text-[10px] ${isBathroom ? 'bg-white text-[#1f1f1f] ring-1 ring-inset ring-slate-200' : 'bg-[#0759cd] text-white'}`}
        >
          {isBathroom ? 'BATHROOM SUPPLIES' : 'WATER FILTERS'}
        </span>
      </span>
    </Link>
  );
}
