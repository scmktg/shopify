import { renderProductMarkdown } from '@/lib/products/markdown';

interface ProductOverviewProps {
  /** Long-form markdown body. Preferred when present. */
  description?: string;
  /**
   * One-line tagline. Used as the body when `description` is absent
   * — bootstrapped products.json entries (~165 of the catalogue
   * post-backfill) only carry `shortDescription`, and a one-line
   * description still reads better than no body at all.
   */
  shortDescription?: string;
}

/**
 * Renders the products.json description as HTML through the
 * server-only markdown renderer. Prefers `description` (long-form
 * markdown). Falls back to `shortDescription` rendered as a single
 * paragraph when the long form isn't populated. Returns null when
 * neither is present so the caller doesn't have to guard the
 * conditional render.
 *
 * The parser is server-side only; it never reaches a client bundle.
 */
export async function ProductOverview({
  description,
  shortDescription,
}: ProductOverviewProps) {
  const source = description?.trim() ? description : shortDescription?.trim();
  if (!source) return null;

  let html = '';
  try {
    html = await renderProductMarkdown(source);
  } catch (error) {
    // Defensive: a single bad markdown input shouldn't take down the
    // whole product page. Log and skip the section in production;
    // surface in dev so the bad content is obvious during authoring.
    console.error('[ProductOverview] markdown render failed', error);
    if (process.env.NODE_ENV !== 'production') throw error;
    return null;
  }
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
      className="mt-12 border-t border-gray-100 pt-8"
    >
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
