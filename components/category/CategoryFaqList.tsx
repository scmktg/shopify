import type { FaqItem } from '@/lib/content/markdown';

interface CategoryFaqListProps {
  items: ReadonlyArray<FaqItem>;
}

/**
 * Server-rendered FAQ list using native <details>/<summary>. The
 * question and answer text are in the initial HTML payload Googlebot
 * sees on first fetch — collapsing the panel is purely client UX via
 * the browser's built-in toggle. No client component, no JS bundle
 * impact.
 */
export function CategoryFaqList({ items }: CategoryFaqListProps) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-base font-medium text-black list-none">
            <span>{item.q}</span>
            <span
              aria-hidden="true"
              className="shrink-0 text-black/60 transition-transform group-open:rotate-180"
            >
              ⌄
            </span>
          </summary>
          <p className="pb-4 pr-8 text-sm text-black/75 leading-relaxed">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
