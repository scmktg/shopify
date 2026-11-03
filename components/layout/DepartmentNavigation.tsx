'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { DEPARTMENTS, departmentForPath, type DepartmentId } from '@/content/departments';

const DEPARTMENT_ORDER: DepartmentId[] = ['water', 'bathroom'];

function DepartmentSwitchButton({ current, mobile = false, onSwitch }: {
  current: DepartmentId;
  mobile?: boolean;
  onSwitch: () => void;
}) {
  const target: DepartmentId = current === 'water' ? 'bathroom' : 'water';
  return (
    <button
      type="button"
      onClick={onSwitch}
      aria-label={`Switch shopping menu to ${DEPARTMENTS[target].label}`}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-200 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue',
        mobile && 'min-h-10',
      )}
    >
      <span>{target === 'bathroom' ? 'Bathroom Supplies' : 'Water Filters'}</span>
      <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

/**
 * Desktop and mobile render both departments to animate outgoing and incoming
 * categories simultaneously. Inactive links are inert and hidden from assistive
 * technology; canonical product/collection paths remain unchanged.
 */
export function DepartmentNavigation() {
  const pathname = usePathname() ?? '/';
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentId | null>(null);
  const current = selectedDepartment ?? departmentForPath(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDepartment(null);
    setMobileOpen(false);
    setExpanded(null);
  }, [pathname]);

  const switchDepartment = () => {
    setSelectedDepartment(current === 'water' ? 'bathroom' : 'water');
    setExpanded(null);
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEscape);
    };
  }, [mobileOpen]);

  return (
    <>
      <nav aria-label="Shopping navigation" className="hidden w-full items-center justify-center gap-3 lg:flex">
        <div className="relative h-12 w-[620px] max-w-full overflow-hidden hover:overflow-visible focus-within:overflow-visible">
          {DEPARTMENT_ORDER.map((department) => {
            const isActive = current === department;
            const isWater = department === 'water';
            return (
              <div
                key={department}
                aria-hidden={!isActive}
                inert={!isActive}
                className={clsx(
                  'absolute inset-0 flex items-center justify-center gap-1 whitespace-nowrap transition-[transform,opacity,visibility] duration-350 ease-in-out motion-reduce:transition-none',
                  isActive
                    ? 'visible translate-x-0 opacity-100'
                    : isWater
                      ? 'invisible -translate-x-full opacity-0'
                      : 'invisible translate-x-full opacity-0',
                )}
              >
                {DEPARTMENTS[department].links.map((item) => (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 px-2 py-3 text-sm font-medium text-black transition-colors hover:text-brand-blue focus-visible:underline"
                    >
                      {item.label}
                      {!!item.children?.length && <ChevronDown size={14} aria-hidden="true" />}
                    </Link>
                    {!!item.children?.length && (
                      <div className="invisible absolute left-0 top-full z-50 min-w-56 translate-y-1 border border-gray-200 bg-white py-2 opacity-0 shadow-lg transition-[opacity,transform,visibility] duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-black hover:bg-gray-50 hover:text-brand-blue"
                          >
                            {child.label}
                          </Link>
                        ))}
                        <Link href={item.href} className="mt-1 block border-t border-gray-100 px-4 py-2 text-sm font-semibold text-black hover:bg-gray-50">
                          Shop all {item.label}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <DepartmentSwitchButton current={current} onSwitch={switchDepartment} />
      </nav>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open shopping menu"
        aria-expanded={mobileOpen}
        aria-controls="department-mobile-menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded text-black lg:hidden"
      >
        <Menu size={24} />
      </button>
      <div
        id="department-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping menu"
        inert={!mobileOpen}
        className={clsx(
          'fixed inset-0 z-[60] overflow-y-auto bg-white text-black transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <Link href="/" onClick={() => setMobileOpen(false)} className="font-bold tracking-wide">ENVIRO AQUA</Link>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close shopping menu" className="flex h-10 w-10 items-center justify-center">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-5 px-5 py-6">
          <div className="flex justify-end">
            <DepartmentSwitchButton current={current} mobile onSwitch={switchDepartment} />
          </div>
          <div className="relative overflow-hidden">
            {DEPARTMENT_ORDER.map((department) => {
              const isActive = current === department;
              const isWater = department === 'water';
              return (
                <nav
                  key={department}
                  aria-label={DEPARTMENTS[department].label}
                  aria-hidden={!isActive}
                  inert={!isActive}
                  className={clsx(
                    'w-full transition-[transform,opacity,visibility] duration-350 ease-in-out motion-reduce:transition-none',
                    isActive ? 'relative visible translate-x-0 opacity-100' : 'absolute left-0 top-0',
                    !isActive && (isWater ? 'invisible -translate-x-full opacity-0' : 'invisible translate-x-full opacity-0'),
                  )}
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Shop {DEPARTMENTS[department].label}</p>
                  {DEPARTMENTS[department].links.map((item) => (
                    <div key={item.href} className="border-b border-gray-200">
                      <div className="flex min-h-14 items-center">
                        <Link href={item.href} onClick={() => setMobileOpen(false)} className="flex-1 py-4 text-base font-semibold">
                          {item.label}
                        </Link>
                        {!!item.children?.length && (
                          <button
                            type="button"
                            className="flex h-12 w-12 items-center justify-center"
                            aria-label={expanded === item.href ? 'Collapse ' + item.label : 'Expand ' + item.label}
                            aria-expanded={expanded === item.href}
                            onClick={() => setExpanded(expanded === item.href ? null : item.href)}
                          >
                            <ChevronRight size={20} className={clsx('transition-transform', expanded === item.href && 'rotate-90')} />
                          </button>
                        )}
                      </div>
                      {expanded === item.href && !!item.children?.length && (
                        <div className="space-y-1 bg-gray-50 px-4 pb-3">
                          {item.children.map((child) => (
                            <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-gray-700">
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              );
            })}
          </div>
          <div className="space-y-3 border-t border-gray-200 pt-5 text-sm">
            <Link href="/help/" onClick={() => setMobileOpen(false)} className="block py-2">Help & Guides</Link>
            <Link href="/about/" onClick={() => setMobileOpen(false)} className="block py-2">About Us</Link>
            <Link href="/shipping/" onClick={() => setMobileOpen(false)} className="block py-2">Shipping & Delivery</Link>
          </div>
        </div>
      </div>
    </>
  );
}
