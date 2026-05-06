import 'server-only';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

/**
 * Server-only markdown renderer for `description` in
 * `data/products.json`.
 *
 * The brief restricts the markdown subset to paragraphs, bold,
 * italic, and unordered lists. We don't load `remark-gfm` (which
 * would add tables, autolinks, strikethrough), and we run a
 * post-pass that strips any tag outside the allowlist as defence
 * in depth. Even though the input is repo-controlled, an explicit
 * allowlist makes the contract obvious to the next reader.
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
