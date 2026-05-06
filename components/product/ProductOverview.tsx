import { renderProductMarkdown } from '@/lib/products/markdown';

interface ProductOverviewProps {
  description?: string;
}

/**
 * Renders the products.json `description` field as HTML through the
 * server-only markdown renderer. The component is server-side; the
 * parser never reaches a client bundle.
 *
 * Returns null when no description is set so the caller doesn't have
 * to guard the conditional render.
 */
export async function ProductOverview({ description }: ProductOverviewProps) {
  if (!description?.trim()) return null;
  const html = await renderProductMarkdown(description);
  if (!html) return null;
  // No wrapper heading — long-form descriptions carry their own
  // markdown h2/h3 structure (the seed content has "Why This System",
  // "Three-Stage Filtration", etc.). A wrapping "Overview" h2 would
  // compete with those and break the document outline.
  //
  // Use plain `prose` (not `prose-sm`) so the inner h2/h3 typography
  // matches the surrounding section headings (FullSpecs, Compliance,
  // etc.). prose-sm shrinks h2 to a size that reads as plain text
  // next to the other section headings.
  return (
    <section
      aria-label="Product overview"
      className="mt-12 border-t border-gray-200 pt-8"
    >
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
