'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

export interface FilterPillOption {
  /** Pass `null` for the "All" / clear-filter pill. */
  value: string | null;
  label: string;
}

interface FilterPillsProps {
  options: ReadonlyArray<FilterPillOption>;
  paramName: string;
  label?: string;
}

export function FilterPills({
  options,
  paramName,
  label,
}: FilterPillsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName);

  return (
    <nav aria-label={label ?? 'Filters'} className="my-2">
      <ul role="list" className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = (option.value ?? null) === current;
          const next = new URLSearchParams(searchParams.toString());
          if (option.value) {
            next.set(paramName, option.value);
          } else {
            next.delete(paramName);
          }
          const qs = next.toString();
          const href = qs ? `${pathname}?${qs}` : pathname;
          return (
            <li key={option.label}>
              <Link
                href={href}
                scroll={false}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
