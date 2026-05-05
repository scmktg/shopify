import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

const SHOP_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'Water Filters', href: '/water-filters/' },
  { label: 'Cartridges', href: '/cartridges/' },
  { label: 'Bubblers', href: '/bubblers/' },
  { label: 'Pumps & Tanks', href: '/pumps-and-tanks/' },
  { label: 'Plumbing', href: '/plumbing/' },
];

const LEARN_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'Water problems', href: '/water-problems/' },
  { label: 'Use cases', href: '/use/' },
  { label: 'Help & guides', href: '/help/' },
];

const ABOUT_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'About us', href: '/about/' },
  { label: 'Our pricing', href: '/about/our-pricing/' },
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
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FooterColumn title="Shop" links={SHOP_LINKS} />
          <FooterColumn title="Learn" links={LEARN_LINKS} />
          <FooterColumn title="About" links={ABOUT_LINKS} />
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/contact/" className="hover:underline underline-offset-4">
                  Call us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@enviroaqua.com.au"
                  className="hover:underline underline-offset-4"
                >
                  info@enviroaqua.com.au
                </a>
              </li>
              <li className="text-white/80">Mon–Fri 9am–5pm AEST</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-white/80">
          <div>© 2026 Enviro Aqua &nbsp;|&nbsp; ABN: TBC</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy/" className="hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/terms/" className="hover:underline underline-offset-4">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
