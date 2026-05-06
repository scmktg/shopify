/**
 * Server-side sanitiser and meta-description extractor for Shopify
 * product description HTML.
 *
 * Shopify products imported from the legacy WordPress site carry
 * three classes of debris that render badly:
 *
 *   1. Real HTML comments — `<!-- Product > Description tab -->`,
 *      `<!-- =================== -->` separators. These don't render
 *      in the browser as visible text, but they leak into meta
 *      descriptions and Open Graph tags (Bug 5).
 *
 *   2. Escaped HTML comments — `&lt;!-- ... --&gt;`. These DO render
 *      as visible text because the browser sees them as text content
 *      (Bug 1).
 *
 *   3. Literal `\n` two-character escape sequences sitting in the
 *      body where a real newline was expected. Visible as text
 *      (Bug 1).
 *
 * Plus three structural issues:
 *
 *   4. Duplicate H2 headings ("Specifications", "What's Included",
 *      etc.) where the heading is also rendered as a structured
 *      section elsewhere on the page (Bug 3).
 *
 *   5. Absolute links to https://enviroaqua.com.au/... that point
 *      back at the legacy WordPress site (Bug 6).
 *
 *   6. Zero-width whitespace from copy-paste between editors.
 *
 * The sanitiser strips all of this and rewrites links to known new
 * URLs. Unknown legacy paths log a build-time warning so we can map
 * them in later.
 */

const LEGACY_HOST_RE = /https?:\/\/(?:www\.)?enviroaqua\.com\.au/g;

const URL_MAPPINGS: Readonly<Record<string, string>> = {
  '/whole-house-water-filter-installation-central-coast/':
    '/whole-house-installation-package/',
  '/whole-house-water-filter-installation-central-coast':
    '/whole-house-installation-package/',
};

/**
 * Headings whose text content is also rendered elsewhere on the
 * product page (Specifications panel from metafields, etc.). When we
 * find one of these as an H2 inside the description body we drop it
 * to avoid the duplicate heading the user reported.
 */
const DUPLICATE_HEADING_RE =
  /^(specifications?|technical specifications?|what'?s? included|key features?|compliance(?: ?& ?certification)?|installation notes?)$/i;

export interface SanitiseOptions {
  /** When true, log warnings for unknown legacy URLs. Default false. */
  logUnknownLegacyUrls?: boolean;
}

export function sanitiseProductDescriptionHtml(
  html: string,
  options: SanitiseOptions = {},
): string {
  let out = html;

  // 1. Strip real HTML comments (greedy matching across newlines).
  out = out.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Strip escaped HTML comments that render as visible text.
  out = out.replace(/&lt;!--[\s\S]*?--&gt;/g, '');

  // 3. Drop the specific WordPress import marker fragments that
  //    sometimes leak through outside any comment wrapper.
  out = out.replace(/Product\s*(?:&gt;|>)\s*Description\s*tab/gi, '');
  out = out.replace(/={4,}/g, '');

  // 4. Strip literal "\n" two-character escape sequences.
  out = out.replace(/\\n/g, '');

  // 5. Strip zero-width whitespace.
  out = out.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");

  // 6. Drop H2 headings whose content matches a section we render
  //    structurally elsewhere on the page.
  out = out.replace(
    /<h2\b[^>]*>([\s\S]*?)<\/h2>\s*/gi,
    (match, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').trim();
      return DUPLICATE_HEADING_RE.test(text) ? '' : match;
    },
  );

  // 7. Rewrite absolute legacy links to relative new-site paths.
  out = out.replace(/href="([^"]+)"/g, (match, raw: string) => {
    if (!LEGACY_HOST_RE.test(raw)) {
      LEGACY_HOST_RE.lastIndex = 0;
      return match;
    }
    LEGACY_HOST_RE.lastIndex = 0;
    const path = raw.replace(LEGACY_HOST_RE, '') || '/';
    LEGACY_HOST_RE.lastIndex = 0;
    if (URL_MAPPINGS[path]) {
      return `href="${URL_MAPPINGS[path]}"`;
    }
    if (options.logUnknownLegacyUrls) {
      console.warn(
        `[productHtml] Unmapped legacy enviroaqua URL in description: ${raw}`,
      );
    }
    return `href="${path}"`;
  });

  return out.trim();
}

/**
 * Returns up to `max` characters of the first clean paragraph of the
 * sanitised HTML, with HTML tags stripped, whitespace collapsed, and
 * an ellipsis appended if truncated.
 *
 * Used by product-page metadata generation to derive a clean
 * meta description / og:description / twitter:description from the
 * descriptionHtml — never from the raw `description` field, which
 * carries the same WordPress debris in plain-text form.
 */
export function metaDescriptionFromHtml(
  sanitisedHtml: string,
  max = 155,
): string {
  const paragraph = sanitisedHtml.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  const candidate = paragraph?.[1] ?? sanitisedHtml;
  const text = candidate
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
