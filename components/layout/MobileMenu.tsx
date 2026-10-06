'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Menu,
  X,
  Phone,
  Mail,
  Facebook,
  Instagram,
  MapPin,
  Clock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import type { Category } from '@/content/categories';
import { BUSINESS_INFO, fullAddress } from '@/content/business-info';

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  categories: ReadonlyArray<Category>;
}

const LEARN_LINKS: ReadonlyArray<NavItem> = [
  { label: 'Water problems', href: '/water-problems/' },
  { label: 'Use cases', href: '/use/' },
  { label: 'Help & guides', href: '/help/' },
];

const ABOUT_LINKS: ReadonlyArray<NavItem> = [
  { label: 'About us', href: '/about/' },
  { label: 'Our pricing', href: '/about/our-pricing/' },
  { label: 'Shipping', href: '/shipping/' },
  { label: 'Returns', href: '/returns/' },
];

interface CollapsibleSectionProps {
  id: string;
  title: string;
  links: ReadonlyArray<NavItem>;
  isOpen: boolean;
  onToggle: () => void;
  onLinkClick: () => void;
}

function CollapsibleSection({
  id,
  title,
  links,
  isOpen,
  onToggle,
  onLinkClick,
}: CollapsibleSectionProps) {
  const panelId = `mobile-menu-${id}-panel`;
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex min-h-14 w-full items-center justify-between py-4 text-xl font-semibold text-white"
      >
        <span>{title}</span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={clsx(
            'text-white/60 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      <div
        id={panelId}
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ul className={clsx('overflow-hidden', isOpen ? 'visible' : 'invisible')}>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onLinkClick}
                className="block min-h-11 py-2.5 pl-1 text-base text-white/80 transition-colors hover:text-brand-blue"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li aria-hidden="true" className="h-3" />
        </ul>
      </div>
    </div>
  );
}

interface ShopSectionProps {
  categories: ReadonlyArray<Category>;
  isOpen: boolean;
  onToggle: () => void;
  openCategory: string | null;
  onCategoryToggle: (slug: string) => void;
  onLinkClick: () => void;
}

function ShopSection({
  categories,
  isOpen,
  onToggle,
  openCategory,
  onCategoryToggle,
  onLinkClick,
}: ShopSectionProps) {
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-shop-panel"
        className="flex min-h-14 w-full items-center justify-between py-4 text-xl font-semibold text-white"
      >
        <span>Shop</span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={clsx(
            'text-white/60 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        id="mobile-menu-shop-panel"
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className={clsx('overflow-hidden pb-3', isOpen ? 'visible' : 'invisible')}>
          <ul className="divide-y divide-white/10 rounded-lg bg-white/[0.04]">
            {categories.map((category) => {
              const categoryOpen = openCategory === category.slug;
              const submenuId = `mobile-category-${category.slug}`;
              return (
                <li key={category.slug}>
                  <div className="flex min-h-12 items-stretch">
                    <Link
                      href={`/${category.slug}/`}
                      onClick={onLinkClick}
                      className="flex flex-1 items-center py-3 pl-4 pr-2 text-base font-semibold text-white transition-colors hover:text-brand-blue"
                    >
                      {category.label}
                    </Link>
                    {category.subcategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onCategoryToggle(category.slug)}
                        aria-label={`${categoryOpen ? 'Collapse' : 'Expand'} ${category.label}`}
                        aria-expanded={categoryOpen}
                        aria-controls={submenuId}
                        className="flex w-12 shrink-0 items-center justify-center text-white/60 transition-colors hover:text-white"
                      >
                        <ChevronRight
                          size={20}
                          aria-hidden="true"
                          className={clsx(
                            'transition-transform duration-200',
                            categoryOpen && 'rotate-90',
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {category.subcategories.length > 0 && (
                    <div
                      id={submenuId}
                      className={clsx(
                        'grid bg-white/[0.04] transition-[grid-template-rows] duration-250 ease-out',
                        categoryOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <ul className={clsx('overflow-hidden', categoryOpen ? 'visible' : 'invisible')}>
                        {category.subcategories.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/${category.slug}/${sub.slug}/`}
                              onClick={onLinkClick}
                              className="flex min-h-11 items-center py-2.5 pl-8 pr-4 text-[15px] text-white/75 transition-colors hover:bg-white/[0.04] hover:text-brand-blue"
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/${category.slug}/`}
                            onClick={onLinkClick}
                            className="flex min-h-11 items-center border-t border-white/10 py-2.5 pl-8 pr-4 text-[15px] font-semibold text-white transition-colors hover:text-brand-blue"
                          >
                            Shop all {category.label}
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

type SectionId = 'shop' | 'learn' | 'about';

export function MobileMenu({ categories }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    shop: false,
    learn: false,
    about: false,
  });
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const close = () => {
    setIsOpen(false);
    setOpenCategory(null);
  };

  const toggleSection = (id: SectionId) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCategory = (slug: string) =>
    setOpenCategory((current) => (current === slug ? null : slug));

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
        onClick={() => setIsOpen(true)}
        className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded text-black transition-colors hover:text-brand-blue"
      >
        <Menu size={24} aria-hidden="true" />
      </button>

      <div
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!isOpen}
        className={clsx(
          'fixed inset-0 z-50 overflow-y-auto bg-black text-white transition-transform duration-300 ease-out md:hidden',
          isOpen ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-black px-4">
          <Link
            href="/"
            aria-label="Enviro Aqua - home"
            onClick={close}
            className="relative z-10 inline-flex shrink-0 cursor-pointer items-center"
          >
            <Image
              src="/logo.webp"
              alt="Enviro Aqua"
              width={160}
              height={40}
              className="pointer-events-none h-9 w-auto select-none"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="inline-flex h-10 w-10 items-center justify-center rounded text-white transition-colors hover:text-brand-blue"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 pb-12 pt-2">
          <nav aria-label="Mobile primary">
            <ShopSection
              categories={categories}
              isOpen={openSections.shop}
              onToggle={() => toggleSection('shop')}
              openCategory={openCategory}
              onCategoryToggle={toggleCategory}
              onLinkClick={close}
            />
            <CollapsibleSection
              id="learn"
              title="Learn"
              links={LEARN_LINKS}
              isOpen={openSections.learn}
              onToggle={() => toggleSection('learn')}
              onLinkClick={close}
            />
            <CollapsibleSection
              id="about"
              title="About"
              links={ABOUT_LINKS}
              isOpen={openSections.about}
              onToggle={() => toggleSection('about')}
              onLinkClick={close}
            />
          </nav>

          <div className="mt-8 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Get in touch</h2>
            <a
              href={`tel:${BUSINESS_INFO.phone.tel}`}
              onClick={close}
              className="flex h-12 items-center gap-3 rounded-md bg-brand-blue px-4 font-semibold text-white transition-colors hover:bg-brand-blue/90"
            >
              <Phone size={18} aria-hidden="true" />
              <span>{BUSINESS_INFO.phone.display}</span>
            </a>
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              onClick={close}
              className="flex h-12 items-center gap-3 rounded-md bg-white/10 px-4 font-medium text-white transition-colors hover:bg-white/20"
            >
              <Mail size={18} aria-hidden="true" />
              <span className="truncate">{BUSINESS_INFO.email}</span>
            </a>
          </div>

          <div className="mt-6 space-y-2 text-sm text-white/80">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Showroom</h2>
            <p className="flex items-start gap-2">
              <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-white/60" />
              <span>{fullAddress()}</span>
            </p>
            <p className="flex items-start gap-2">
              <Clock size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-white/60" />
              <span>{BUSINESS_INFO.showroom.hours}</span>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <a
              href={BUSINESS_INFO.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviro Aqua on Facebook"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <Facebook size={20} aria-hidden="true" />
            </a>
            <a
              href={BUSINESS_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviro Aqua on Instagram"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <Instagram size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
