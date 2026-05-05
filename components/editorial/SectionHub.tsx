import Link from 'next/link';
import type { MarkdownPageSummary } from '@/lib/content/markdown';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

interface SectionHubProps {
  title: string;
  intro: string;
  sectionPath: string;
  items: ReadonlyArray<MarkdownPageSummary>;
  breadcrumbs: ReadonlyArray<BreadcrumbItem>;
}

export function SectionHub({
  title,
  intro,
  sectionPath,
  items,
  breadcrumbs,
}: SectionHubProps) {
  const trimmedSection = sectionPath.endsWith('/')
    ? sectionPath
    : `${sectionPath}/`;

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-black">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base text-black/80">{intro}</p>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-black/70">
          No pages have been added to this section yet.
        </p>
      ) : (
        <ul role="list" className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`${trimmedSection}${item.slug}/`}
                className="block h-full p-5 border border-gray-200 hover:border-gray-400 rounded transition-colors"
              >
                <h2 className="text-lg font-semibold text-black">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="mt-2 text-sm text-black/70">
                    {item.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
