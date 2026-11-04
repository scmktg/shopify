import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { BUSINESS_INFO, fullAddress } from '@/content/business-info';
import { CATEGORIES } from '@/content/categories';
import { ZipPaymentBadge } from '@/components/payments/ZipPaymentBadge';
import { CookiePreferencesButton } from '@/components/analytics/ConsentBanner';
import { FooterDepartmentSwitch } from './FooterDepartmentSwitch';
import { DepartmentLogo } from './DepartmentLogo';

interface FooterLink {
  label: string;
  href: string;
}

const SHOP_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'Water Filters', href: '/water-filters/' },
  { label: 'Bathroom Supplies', href: '/bathroom/' },
  { label: 'Whole House Install Package', href: '/whole-house-installation-package/' },
  { label: 'Cartridges', href: '/cartridges/' },
  { label: 'Fountains & Coolers', href: '/bubblers-and-coolers/' },
  { label: 'Tanks & Bunds', href: '/tanks-and-bunds/' },
  { label: 'Plumbing', href: '/plumbing/' },
  { label: 'WaterMark Products', href: '/watermark-certified/' },
];

const LEARN_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'Water problems', href: '/water-problems/' },
  { label: 'Use cases', href: '/use/' },
  { label: 'Help & guides', href: '/help/' },
  { label: 'About Zip', href: '/zip/' },
];

const ABOUT_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'About us', href: '/about/' },
  { label: 'Our pricing', href: '/about/our-pricing/' },
  { label: 'Customer reviews', href: '/reviews/' },
  { label: 'Shipping', href: '/shipping/' },
  { label: 'Returns', href: '/returns/' },
];

interface FooterColumnProps {
  title: string;
  links: ReadonlyArray<FooterLink>;
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-wider uppercase">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:underline underline-offset-4">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#000000] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <DepartmentLogo footer />
          <div className="flex items-center gap-6">
            <FooterDepartmentSwitch />
            <div className="flex items-center gap-3 text-xs text-white/70">
              <span>Pay with</span>
            <ZipPaymentBadge location="footer" className="ring-offset-black" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FooterColumn title="Shop" links={SHOP_LINKS} />
          <FooterColumn title="Learn" links={LEARN_LINKS} />
          <FooterColumn title="About" links={ABOUT_LINKS} />
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${BUSINESS_INFO.phone.tel}`}
                  className="hover:underline underline-offset-4"
                >
                  {BUSINESS_INFO.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="hover:underline underline-offset-4 break-all"
                >
                  {BUSINESS_INFO.email}
                </a>
              </li>
              <li className="text-white/80">{fullAddress()}</li>
              <li className="text-white/80">{BUSINESS_INFO.showroom.hours}</li>
              <li className="flex items-center gap-3 pt-2">
                <a
                  href={BUSINESS_INFO.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Enviro Aqua on Facebook"
                  className="hover:opacity-80"
                >
                  <Facebook size={20} aria-hidden="true" />
                </a>
                <a
                  href={BUSINESS_INFO.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Enviro Aqua on Instagram"
                  className="hover:opacity-80"
                >
                  <Instagram size={20} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>


        {/* Crawlable, server-rendered catalogue links: preserve established category
            paths while navigation is split between shopping departments. */}
        <nav aria-label="Browse all product categories" className="mt-12 border-t border-white/20 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Explore product categories</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((category) => (
              <div key={category.slug}>
                <Link href={`/${category.slug}/`} className="text-sm font-semibold hover:underline underline-offset-4">
                  {category.label}
                </Link>
                <ul className="mt-3 space-y-2 text-sm text-white/75">
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.slug}>
                      <Link href={`/${category.slug}/${subcategory.slug}/`} className="hover:text-white hover:underline underline-offset-4">
                        {subcategory.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-white/80">
          <div>
            © 2026 {BUSINESS_INFO.name} &nbsp;|&nbsp; ABN {BUSINESS_INFO.abn}{' '}
            &nbsp;|&nbsp; ACN {BUSINESS_INFO.acn}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy/" className="hover:underline underline-offset-4">
              Privacy
            </Link>
            <CookiePreferencesButton />
            <Link href="/terms/" className="hover:underline underline-offset-4">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
