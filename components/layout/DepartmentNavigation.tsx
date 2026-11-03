'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { DEPARTMENTS, MEGA_MENU_GROUPS, departmentForPath, type DepartmentId } from '@/content/departments';

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
        'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-800 transition-colors duration-200 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue',
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
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDepartment(null);
    setMobileOpen(false);
    setExpanded(null);
    setDesktopMenu(null);
  }, [pathname]);

  const switchDepartment = () => {
    setSelectedDepartment(current === 'water' ? 'bathroom' : 'water');
    setExpanded(null);
    setDesktopMenu(null);
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
      <nav aria-label="Shopping navigation" className="relative hidden w-full min-w-0 items-center justify-center gap-2 xl:flex" onMouseLeave={() => setDesktopMenu(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDesktopMenu(null); }}>
        <div className="relative h-12 min-w-0 w-[620px] max-w-full overflow-hidden hover:overflow-visible focus-within:overflow-visible">
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
                  <div key={item.href} className="group relative" onMouseEnter={() => setDesktopMenu(item.children?.length ? item.href : null)} onFocus={() => setDesktopMenu(item.children?.length ? item.href : null)}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 px-2 py-3 text-sm font-medium text-black transition-colors hover:text-brand-blue focus-visible:underline"
                    >
                      {item.label}
                      {!!item.children?.length && <ChevronDown size={14} aria-hidden="true" />}
                    </Link>

                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <DepartmentSwitchButton current={current} onSwitch={switchDepartment} />
        {(() => {
          const item = DEPARTMENTS[current].links.find((candidate) => candidate.href === desktopMenu);
          if (!item?.children?.length) return null;
          const groups = MEGA_MENU_GROUPS[item.href];
          return (
            <div
              className={clsx(
                'absolute left-1/2 top-full z-[70] -translate-x-1/2 rounded-b-2xl border border-gray-200 bg-white text-black shadow-[0_20px_48px_rgba(0,0,0,0.12)]',
                groups ? 'w-[min(880px,calc(100vw-3rem))] p-7' : 'w-72 p-4',
              )}
              onMouseEnter={() => setDesktopMenu(item.href)}
            >
              {groups ? (
                <>
                  <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Explore Enviro Aqua</p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-tight">{item.label}</h2>
                    </div>
                    <Link href={item.href} onClick={() => setDesktopMenu(null)} className="rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100">
                      Shop all {item.label} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-7">
                    {groups.map((group) => (
                      <div key={group.heading} className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-950">{group.heading}</h3>
                        <p className="mt-1 min-h-9 text-xs leading-5 text-gray-500">{group.description}</p>
                        <div className="mt-3 space-y-1">
                          {group.links.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setDesktopMenu(null)}
                              className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-sky-50 hover:text-sky-800 focus-visible:bg-sky-50">
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</p>
                  {item.children.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setDesktopMenu(null)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-800">{link.label}</Link>
                  ))}
                  <Link href={item.href} onClick={() => setDesktopMenu(null)} className="mt-2 block border-t border-gray-100 px-3 pt-3 text-sm font-semibold text-sky-800">
                    Shop all {item.label} →
                  </Link>
                </>
              )}
            </div>
          );
        })()}
      </nav>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open shopping menu"
        aria-expanded={mobileOpen}
        aria-controls="department-mobile-menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded text-black xl:hidden"
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
          'fixed inset-0 z-[60] overflow-y-auto bg-white text-black transition-transform duration-200 xl:hidden',
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
                        <div className="space-y-3 rounded-lg bg-gray-50 px-4 py-3">
                          {MEGA_MENU_GROUPS[item.href] ? (
                            <>
                              {MEGA_MENU_GROUPS[item.href].map((group) => (
                                <div key={group.heading}>
                                  <p className="pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{group.heading}</p>
                                  {group.links.map((child) => (
                                    <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-gray-700">
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                            </>
                          ) : item.children.map((child) => (
                            <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-gray-700">
                              {child.label}
                            </Link>
                          ))}
                          <Link href={item.href} onClick={() => setMobileOpen(false)} className="block border-t border-gray-200 pt-3 text-sm font-semibold text-sky-800">
                            Shop all {item.label} →
                          </Link>
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
