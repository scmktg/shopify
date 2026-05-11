'use client';

import { useEffect, useState } from 'react';
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
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { BUSINESS_INFO, fullAddress } from '@/content/business-info';

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  items: ReadonlyArray<NavItem>;
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

interface MenuSectionProps {
  title: string;
  links: ReadonlyArray<NavItem>;
  onLinkClick: () => void;
}

function MenuSection({ title, links, onLinkClick }: MenuSectionProps) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
        {title}
      </h2>
      <ul className="mt-3 divide-y divide-white/10">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onLinkClick}
              className="group flex items-center justify-between py-3 text-lg font-medium text-white hover:text-brand-blue transition-colors"
            >
              <span>{link.label}</span>
              <ChevronRight
                size={18}
                aria-hidden="true"
                className="text-white/30 transition-all group-hover:text-brand-blue group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

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
        className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded text-black hover:text-brand-blue transition-colors"
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
          'fixed inset-0 z-50 bg-black text-white md:hidden overflow-y-auto transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-black border-b border-white/10">
          <Link
            href="/"
            aria-label="Enviro Aqua — home"
            onClick={close}
            className="inline-flex items-center"
          >
            <img
              src="/logo.webp"
              alt="Enviro Aqua"
              width={160}
              height={40}
              className="h-9 w-auto"
            />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="inline-flex items-center justify-center h-10 w-10 rounded text-white hover:text-brand-blue transition-colors"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8 pb-12">
          <nav aria-label="Mobile shop">
            <MenuSection title="Shop" links={items} onLinkClick={close} />
          </nav>

          <nav aria-label="Mobile learn">
            <MenuSection title="Learn" links={LEARN_LINKS} onLinkClick={close} />
          </nav>

          <nav aria-label="Mobile about">
            <MenuSection title="About" links={ABOUT_LINKS} onLinkClick={close} />
          </nav>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
              Get in touch
            </h2>
            <a
              href={`tel:${BUSINESS_INFO.phone.tel}`}
              onClick={close}
              className="flex items-center gap-3 h-12 px-4 rounded-md bg-brand-blue text-white font-semibold hover:bg-brand-blue/90 transition-colors"
            >
              <Phone size={18} aria-hidden="true" />
              <span>{BUSINESS_INFO.phone.display}</span>
            </a>
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              onClick={close}
              className="flex items-center gap-3 h-12 px-4 rounded-md bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
            >
              <Mail size={18} aria-hidden="true" />
              <span className="truncate">{BUSINESS_INFO.email}</span>
            </a>
          </div>

          <div className="space-y-2 text-sm text-white/80">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
              Showroom
            </h2>
            <p className="flex items-start gap-2">
              <MapPin
                size={16}
                aria-hidden="true"
                className="mt-0.5 text-white/60 shrink-0"
              />
              <span>{fullAddress()}</span>
            </p>
            <p className="flex items-start gap-2">
              <Clock
                size={16}
                aria-hidden="true"
                className="mt-0.5 text-white/60 shrink-0"
              />
              <span>{BUSINESS_INFO.showroom.hours}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={BUSINESS_INFO.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviro Aqua on Facebook"
              className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Facebook size={20} aria-hidden="true" />
            </a>
            <a
              href={BUSINESS_INFO.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviro Aqua on Instagram"
              className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Instagram size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
