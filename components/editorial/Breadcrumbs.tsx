import Link from 'next/link';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: ReadonlyArray<BreadcrumbItem>;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-black/70">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          if (isLast) {
            return (
              <li key={item.href} aria-current="page">
                {item.name}
              </li>
            );
          }
          return (
            <li key={item.href} className="flex items-center gap-2">
              <Link
                href={item.href}
                className="hover:underline underline-offset-4"
              >
                {item.name}
              </Link>
              <span aria-hidden="true">/</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
