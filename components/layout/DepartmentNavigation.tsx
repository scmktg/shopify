'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftRight, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { DEPARTMENTS, MEGA_MENU_GROUPS, departmentForPath, type DepartmentId } from '@/content/departments';

const DEPARTMENT_ORDER: DepartmentId[] = ['water', 'bathroom'];

function DepartmentSwitchButton({ current, mobile = false, onSwitch, disabled = false }: {
  current: DepartmentId;
  mobile?: boolean;
  onSwitch: () => void;
  disabled?: boolean;
}) {
  const target: DepartmentId = current === 'water' ? 'bathroom' : 'water';
  const href = target === 'bathroom' ? '/bathroom/' : '/';
  return (
    <Link
      href={href}
      prefetch
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
        onSwitch();
      }}
      aria-label={`Switch to ${DEPARTMENTS[target].label} range`}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={clsx(
        'group/switch inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-slate-500 transition-colors duration-200 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue',
        mobile ? 'min-h-11 py-2' : 'py-2',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <span>{target === 'bathroom' ? 'Explore Bathroom Range' : 'Explore Filtration Range'}</span>
      <ArrowLeftRight size={14} strokeWidth={1.8} className="shrink-0 text-slate-400 transition-colors duration-200 group-hover/switch:text-slate-700" aria-hidden="true" />
    </Link>
  );
}


/**
 * Desktop and mobile render both departments to animate outgoing and incoming
 * categories simultaneously. Inactive links are inert and hidden from assistive
 * technology; canonical product/collection paths remain unchanged.
 */
export function DepartmentNavigation() {
  const pathname = usePathname() ?? '/';
  // Derive the menu from the actual URL, never a stale optimistic toggle.
  const current = departmentForPath(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null);
  const [renderedMenu, setRenderedMenu] = useState<string | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mobilePanelTop, setMobilePanelTop] = useState(76);
  const closeTimer = useRef<number | null>(null);
  const switchTimers = useRef<number[]>([]);
  const [switchingTo, setSwitchingTo] = useState<DepartmentId | null>(null);
  const [switchLeaving, setSwitchLeaving] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(104);

  const cancelClose = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const closeMenu = () => { cancelClose(); setDesktopMenu(null); };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setDesktopMenu(null), 110);
  };
  const showMenu = (href: string | null) => {
    cancelClose();
    if (href) {
      const header = navRef.current?.closest('header');
      if (header) setHeaderBottom(header.getBoundingClientRect().bottom);
    }
    setDesktopMenu(href);
  };

  useEffect(() => {
    setMobileOpen(false);
    setExpanded(null);
    setDesktopMenu(null);
  }, [pathname]);

  const switchDepartment = () => {
    if (switchingTo) return;
    const target = current === 'water' ? 'bathroom' : 'water';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    switchTimers.current.forEach((id) => window.clearTimeout(id));
    switchTimers.current = [];
    setExpanded(null);
    setMobileOpen(false);
    closeMenu();

    // The real Next.js link navigates immediately. This is a brief,
    // non-blocking visual crossfade, not a loading screen.
    if (!reduceMotion) {
      setSwitchingTo(target);
      setSwitchLeaving(false);
      switchTimers.current.push(window.setTimeout(() => setSwitchLeaving(true), 80));
      switchTimers.current.push(window.setTimeout(() => setSwitchingTo(null), 430));
    }
  };

  useEffect(() => {
    return () => {
      switchTimers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    setPortalReady(true);
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!desktopMenu) return;
    const reposition = () => {
      const header = navRef.current?.closest('header');
      if (header) setHeaderBottom(header.getBoundingClientRect().bottom);
    };
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [desktopMenu]);

  // Keep the panel mounted briefly on exit so both it and the backdrop fade out.
  useEffect(() => {
    if (desktopMenu) {
      setRenderedMenu(desktopMenu);
      return;
    }
    const timeout = window.setTimeout(() => setRenderedMenu(null), 180);
    return () => window.clearTimeout(timeout);
  }, [desktopMenu]);

  useEffect(() => {
    if (!desktopMenu) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [desktopMenu]);

  useEffect(() => {
    if (!mobileOpen) return;
    const positionPanel = () => {
      const header = mobileButtonRef.current?.closest('header');
      if (header) setMobilePanelTop(header.getBoundingClientRect().bottom);
    };
    positionPanel();
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    return () => {
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
    };
  }, [mobileOpen]);

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
      <nav ref={navRef} aria-label="Shopping navigation" className="relative hidden w-full min-w-0 items-center justify-center gap-3 xl:flex" onMouseLeave={scheduleClose} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose(); }}>
        <div className="relative h-12 min-w-0 w-[620px] max-w-full flex-1 overflow-hidden hover:overflow-visible focus-within:overflow-visible">
          {DEPARTMENT_ORDER.map((department) => {
            const isActive = current === department;
            const isWater = department === 'water';
            return (
              <div
                key={department}
                aria-hidden={!isActive}
                inert={!isActive}
                className={clsx(
                  'absolute inset-0 flex items-center justify-center gap-3 whitespace-nowrap transition-[transform,opacity,visibility] duration-350 ease-in-out motion-reduce:transition-none',
                  isActive
                    ? 'visible translate-x-0 opacity-100'
                    : isWater
                      ? 'invisible -translate-x-full opacity-0'
                      : 'invisible translate-x-full opacity-0',
                )}
              >
                {DEPARTMENTS[department].links.map((item) => (
                  <div key={item.href} className="group relative" onMouseEnter={() => showMenu(item.children?.length ? item.href : null)} onFocus={() => showMenu(item.children?.length ? item.href : null)}>
                    <Link
                      href={item.href}
                      className={clsx(
                        'inline-flex items-center gap-1 whitespace-nowrap py-3 font-medium text-black transition-colors hover:text-brand-blue focus-visible:underline',
                        'px-2 text-sm',
                      )}
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
        {portalReady && renderedMenu && createPortal(
          <>
            <button
              type="button"
              aria-label="Close shopping categories"
              onClick={closeMenu}
              onMouseEnter={scheduleClose}
              style={{ top: Math.max(0, headerBottom) }}
              className={clsx(
                'fixed inset-x-0 bottom-0 z-[80] cursor-default bg-slate-950/25 backdrop-blur-[2px] transition-opacity duration-200 ease-out motion-reduce:transition-none',
                desktopMenu ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            />
            {(() => {
              const item = DEPARTMENTS[current].links.find((candidate) => candidate.href === renderedMenu);
              if (!item?.children?.length) return null;
              const groups = MEGA_MENU_GROUPS[item.href] ?? [{ heading: item.label, links: item.children }];
              return (
                <div
                  style={{ top: Math.max(0, headerBottom) }}
                  className={clsx(
                    'fixed left-1/2 z-[90] w-[min(880px,calc(100vw-3rem))] -translate-x-1/2 rounded-b-2xl border-x border-b border-gray-100 bg-white p-7 text-black shadow-[0_24px_60px_rgba(15,23,42,0.16)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
                    desktopMenu ? 'translate-y-0 opacity-100' : '-translate-y-1 pointer-events-none opacity-0',
                  )}
                  onMouseEnter={() => { cancelClose(); setDesktopMenu(item.href); }}
                  onMouseLeave={scheduleClose}
                >
                  <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-5">
                    <h2 className="text-xl font-semibold tracking-tight">{item.label}</h2>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100"
                    >
                      Shop All <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-7">
                    {groups.map((group) => (
                      <div key={group.heading} className="min-w-0">
                        <h3 className="mb-3 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-950">{group.heading}</h3>
                        <div className="space-y-1">
                          {group.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={closeMenu}
                              className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-sky-50 hover:text-sky-800 focus-visible:bg-sky-50"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>,
          document.body,
        )}
      </nav>

      {portalReady && switchingTo && createPortal(
        <div
          aria-hidden="true"
          className={clsx(
            'pointer-events-none fixed inset-0 z-[150] bg-white/85 transition-opacity duration-300 ease-out',
            switchLeaving ? 'opacity-0' : 'opacity-100',
          )}
        />,
        document.body,
      )}

      <button
        ref={mobileButtonRef}
        type="button"
        onClick={() => {
          const header = mobileButtonRef.current?.closest('header');
          if (header) setMobilePanelTop(header.getBoundingClientRect().bottom);
          setMobileOpen((open) => !open);
        }}
        aria-label={mobileOpen ? 'Close shopping menu' : 'Open shopping menu'}
        aria-expanded={mobileOpen}
        aria-controls="department-mobile-menu"
        className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded text-black transition-colors hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue xl:hidden"
      >
        {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>
      <div
        id="department-mobile-menu"
        role="region"
        aria-label="Shopping menu"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        style={{ top: mobilePanelTop }}
        className={clsx(
          'fixed inset-x-0 bottom-0 z-[60] overflow-y-auto overscroll-contain border-t border-gray-100 bg-white text-black shadow-[0_18px_38px_rgba(15,23,42,0.08)] transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none xl:hidden',
          mobileOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible pointer-events-none -translate-y-3 opacity-0',
        )}
      >
        <div className="mx-auto w-full max-w-xl space-y-7 px-6 pb-12 pt-7 sm:px-8">
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
                        {!!item.children?.length ? (
                          <button
                            type="button"
                            className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-blue"
                            aria-expanded={expanded === item.href}
                            aria-controls={`mobile-department-category-${department}-${item.href.replace(/[^a-z0-9]/gi, '-')}`}
                            onClick={() => setExpanded(expanded === item.href ? null : item.href)}
                          >
                            <span>{item.label}</span>
                            <ChevronRight size={20} aria-hidden="true" className={clsx('shrink-0 transition-transform duration-200', expanded === item.href && 'rotate-90')} />
                          </button>
                        ) : (
                          <Link href={item.href} onClick={() => setMobileOpen(false)} className="flex min-h-14 w-full items-center py-4 text-base font-semibold">
                            {item.label}
                          </Link>
                        )}
                      </div>
                      {expanded === item.href && !!item.children?.length && (
                        <div
                          id={`mobile-department-category-${department}-${item.href.replace(/[^a-z0-9]/gi, '-')}`}
                          className="space-y-3 rounded-lg bg-gray-50 px-4 py-3"
                        >
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex min-h-11 items-center justify-between border-b border-gray-200 pb-3 text-sm font-semibold text-sky-800"
                          >
                            Shop all {item.label}
                            <ChevronRight size={16} aria-hidden="true" />
                          </Link>
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
          <div className="border-t border-gray-200 pt-5">
            <DepartmentSwitchButton current={current} mobile onSwitch={switchDepartment} disabled={Boolean(switchingTo)} />
          </div>
        </div>
      </div>
    </>
  );
}
