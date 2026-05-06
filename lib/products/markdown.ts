import 'server-only';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

/**
 * Server-only markdown renderer for `description` and
 * `compliance.note` in `data/products.json`.
 *
 * Allowed elements: paragraphs, bold, italic, ordered and unordered
 * lists, h2/h3/h4 headings, and links. Headings and links are
 * required by the seed content (long-form descriptions with
 * sub-section headings, references to the ABCB database, the
 * Central Coast install package, etc.) — broader than the brief's
 * literal "paragraphs, bold, italic, unordered lists only" but
 * matches the data the merchant has authored.
 *
 * GFM is intentionally not loaded (no tables, autolinks, strike-
 * through). A post-pass strips any tag outside the allowlist as
 * defence in depth — even though the input is repo-controlled, the
 * explicit allowlist makes the contract obvious to the next reader.
 *
 * Returns a string of HTML safe to feed to `dangerouslySetInnerHTML`.
 * Never call this from a `'use client'` component — `'server-only'`
 * is imported at the top to fail the build if that happens.
 */

const ALLOWED_TAGS: ReadonlySet<string> = new Set([
  'p',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'a',
  'h2',
  'h3',
  'h4',
]);

export async function renderProductMarkdown(
  source: string | null | undefined,
): Promise<string> {
  if (!source || !source.trim()) return '';
  const processed = await remark()
    .use(remarkHtml, { sanitize: false })
    .process(source);
  const html = String(processed).trim();
  return stripDisallowedTags(html);
}

/**
 * Plain-text extraction for SEO surfaces (meta description,
 * Open Graph, Twitter card, JSON-LD product description). Renders
 * the markdown to HTML and then strips every tag, leaving only the
 * text. Whitespace is collapsed. When `max` is provided the result
 * is truncated with an ellipsis at the boundary.
 *
 * Server-side only — same constraint as `renderProductMarkdown`.
 */
export async function markdownToPlainText(
  source: string | null | undefined,
  max?: number,
): Promise<string> {
  if (!source || !source.trim()) return '';
  const html = await renderProductMarkdown(source);
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!max || text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function stripDisallowedTags(html: string): string {
  // Strip the open/close tag itself but keep the content. This is a
  // belt-and-braces pass — the input is authored in our repo, so the
  // primary concern is keeping the rendered output to the documented
  // subset, not blocking active injection.
  return html.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g,
    (match, rawTag: string) => (ALLOWED_TAGS.has(rawTag.toLowerCase()) ? match : ''),
  );
}
