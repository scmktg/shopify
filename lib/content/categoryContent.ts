import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import type { FaqItem } from './markdown';

export interface CategoryBuyingGuide {
  title: string;
  /** Pre-rendered HTML from the markdown body in the frontmatter. */
  bodyHtml: string;
}

export interface CategoryContent {
  /** Pre-rendered HTML for the long-form intro (the markdown body). */
  introHtml: string;
  /** Optional buying guide section. Rendered below the product grid. */
  buyingGuide: CategoryBuyingGuide | null;
  /**
   * Optional FAQ list. Each entry is server-rendered as a
   * <details>/<summary> so Google sees question + answer in the
   * initial HTML even when the accordion is collapsed.
   */
  faq: ReadonlyArray<FaqItem>;
}

const CATEGORIES_ROOT = path.join(process.cwd(), 'content', 'categories');

async function renderMarkdown(source: string): Promise<string> {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(source);
  return String(processed);
}

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

async function parseBuyingGuide(
  value: unknown,
): Promise<CategoryBuyingGuide | null> {
  if (!value || typeof value !== 'object') return null;
  const rec = value as { title?: unknown; body?: unknown };
  const title = asString(rec.title);
  const body = asString(rec.body);
  if (!title || !body || !body.trim()) return null;
  return { title, bodyHtml: await renderMarkdown(body) };
}

/**
 * Resolves the markdown file for a category page. Subcategory pages
 * look up `<category>/<subcategory>.md`; the top-level category page
 * looks up `<category>.md`. Returns null when no file exists — the
 * route falls back to the bare H1 + grid layout.
 *
 * Frontmatter contract:
 *   title         (string, optional — defaults to category label)
 *   buyingGuide   ({ title, body }, optional)
 *   faq           (array of { q, a }, optional)
 * Body markdown is the intro (300–500 words). Buying-guide body is
 * also markdown and renders below the grid.
 */
export async function loadCategoryContent(
  category: string,
  subcategory?: string,
): Promise<CategoryContent | null> {
  const filePath = subcategory
    ? path.join(CATEGORIES_ROOT, category, `${subcategory}.md`)
    : path.join(CATEGORIES_ROOT, `${category}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  const introHtml = content.trim() ? await renderMarkdown(content) : '';
  const buyingGuide = await parseBuyingGuide(data.buyingGuide);
  const faq = asFaq(data.faq);

  if (!introHtml && !buyingGuide && faq.length === 0) {
    // File exists but is empty — treat as "no content" so the route
    // doesn't render an empty section.
    return null;
  }

  return { introHtml, buyingGuide, faq };
}
