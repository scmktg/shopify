import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

/**
 * Shared markdown → HTML pipeline. Used by `loadMarkdownPage()` for
 * editorial pages under `/content` and by `<CategoryEditorial>` for
 * the below-grid sections on subcategory pages. Keeping the plugin
 * chain in one place so both surfaces accept the same markdown
 * syntax (GFM tables, autolinks, lists) and stay in lockstep.
 */
export async function renderMarkdown(body: string): Promise<string> {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(body);
  return String(processed);
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface MarkdownPage {
  /** Filename without extension. */
  slug: string;
  title: string;
  description: string;
  /** Optional Shopify search-syntax tag (e.g. 'use:home-drinking-water'). */
  tagFilter: string | null;
  /** Optional override for the product-grid heading. */
  productGridTitle: string | null;
  faq: ReadonlyArray<FaqItem>;
  relatedLinks: ReadonlyArray<RelatedLink>;
  /** Rendered HTML for the markdown body (everything after the frontmatter). */
  bodyHtml: string;
}

const CONTENT_ROOT = path.join(process.cwd(), 'content');

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asFaq(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  const out: FaqItem[] = [];
  for (const item of value) {
    if (
      typeof item === 'object' &&
      item !== null &&
      typeof (item as { q?: unknown }).q === 'string' &&
      typeof (item as { a?: unknown }).a === 'string'
    ) {
      const { q, a } = item as { q: string; a: string };
      out.push({ q, a });
    }
  }
  return out;
}

function asRelatedLinks(value: unknown): RelatedLink[] {
  if (!Array.isArray(value)) return [];
  const out: RelatedLink[] = [];
  for (const item of value) {
    if (
      typeof item === 'object' &&
      item !== null &&
      typeof (item as { label?: unknown }).label === 'string' &&
      typeof (item as { href?: unknown }).href === 'string'
    ) {
      const { label, href } = item as { label: string; href: string };
      out.push({ label, href });
    }
  }
  return out;
}

/**
 * Loads `<CONTENT_ROOT>/<relativePath>.md`, parses YAML frontmatter, and
 * renders the markdown body to HTML. Returns null when the file does not
 * exist (the route is expected to call notFound()).
 */
export async function loadMarkdownPage(
  relativePath: string,
): Promise<MarkdownPage | null> {
  const filePath = path.join(CONTENT_ROOT, `${relativePath}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  const bodyHtml = await renderMarkdown(content);

  const slug = path.basename(relativePath);
  return {
    slug,
    title: asString(data.title) ?? slug,
    description: asString(data.description) ?? '',
    tagFilter: asString(data.tagFilter),
    productGridTitle: asString(data.productGridTitle),
    faq: asFaq(data.faq),
    relatedLinks: asRelatedLinks(data.relatedLinks),
    bodyHtml,
  };
}

/**
 * Returns sorted slugs for every `*.md` file directly under
 * `<CONTENT_ROOT>/<section>/`, excluding `index.md`.
 */
export async function listMarkdownSlugs(section: string): Promise<string[]> {
  const dir = path.join(CONTENT_ROOT, section);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith('.md') && f !== 'index.md')
      .map((f) => f.replace(/\.md$/, ''))
      .sort();
  } catch {
    return [];
  }
}

export interface MarkdownPageSummary {
  slug: string;
  title: string;
  description: string;
}

/**
 * Lightweight listing for hub pages — reads frontmatter only,
 * skips body rendering. Returns one entry per `*.md` file in the
 * section directory (excluding index.md).
 */
export async function listSectionPages(
  section: string,
): Promise<ReadonlyArray<MarkdownPageSummary>> {
  const slugs = await listMarkdownSlugs(section);
  const summaries: MarkdownPageSummary[] = [];
  for (const slug of slugs) {
    const filePath = path.join(CONTENT_ROOT, section, `${slug}.md`);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const { data } = matter(raw);
      summaries.push({
        slug,
        title: asString(data.title) ?? slug,
        description: asString(data.description) ?? '',
      });
    } catch {
      // Skip unreadable files.
    }
  }
  return summaries;
}
