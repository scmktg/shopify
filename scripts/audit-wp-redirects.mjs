#!/usr/bin/env node
// Audits redirect_map.csv against the WordPress -> new-site redirect rules
// already merged into next.config.js. For every CSV row, classifies coverage
// (covered_explicit / covered_fallback / no_redirect_needed / not_covered /
// broken_destination), verifies destinations resolve to real routes, and
// emits three artefacts:
//
//   - scripts/audit-wp-redirects.output.json (per-URL classification + summary)
//   - scripts/audit-report.md                 (human-readable summary)
//   - scripts/proposed-redirects.mjs          (gap-filling rules only)
//
// Idempotent: re-running on identical inputs produces identical outputs.

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Load inputs
// ---------------------------------------------------------------------------

function loadCsv() {
  const text = readFileSync(join(REPO_ROOT, 'redirect_map.csv'), 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const header = lines.shift();
  if (header !== 'clean_url,clicks,impressions,type,priority,suggested_redirect') {
    throw new Error(`Unexpected CSV header: ${header}`);
  }
  return lines.map((line, i) => {
    const cols = line.split(',');
    if (cols.length !== 6) {
      throw new Error(`Row ${i + 2} has ${cols.length} columns: ${line}`);
    }
    const [cleanUrl, clicks, impressions, type, priority, suggested] = cols;
    return {
      cleanUrl,
      path: stripHost(cleanUrl),
      clicks: Number(clicks),
      impressions: Number(impressions),
      type,
      priority,
      suggested,
    };
  });
}

function stripHost(url) {
  return url.replace(/^https?:\/\/[^/]+/, '') || '/';
}

async function loadRedirectRules() {
  // The Next config exports an async redirects() that returns the fully
  // expanded rule list (slash variants, category wildcards, blog catch-alls,
  // and the WordPress map). Calling it gives us exactly what Next sees.
  const config = require(join(REPO_ROOT, 'next.config.js'));
  const rules = await config.redirects();
  return rules.map((r, i) => ({
    index: i,
    source: r.source,
    destination: r.destination,
    permanent: r.permanent === true,
    matcher: compileMatcher(r.source),
  }));
}

function loadCategorySlugs() {
  // Parse content/categories.ts statically. The file shape is stable
  // (string literals only), so a regex is sufficient and avoids needing a
  // TS loader.
  const text = readFileSync(join(REPO_ROOT, 'content/categories.ts'), 'utf8');
  const categories = [];
  const catRe = /\{\s*slug:\s*'([^']+)',\s*label:\s*'[^']+',\s*subcategories:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
  for (const m of text.matchAll(catRe)) {
    const slug = m[1];
    const subs = [];
    const subRe = /\{\s*slug:\s*'([^']+)',\s*label:\s*'[^']+'\s*\}/g;
    for (const sm of m[2].matchAll(subRe)) {
      subs.push(sm[1]);
    }
    categories.push({ slug, subcategories: subs });
  }
  if (categories.length === 0) {
    throw new Error('No categories parsed from content/categories.ts');
  }
  return categories;
}

function loadProductHandles() {
  const data = JSON.parse(readFileSync(join(REPO_ROOT, 'data/products.json'), 'utf8'));
  return new Set(Object.keys(data).filter((k) => !k.startsWith('__')));
}

function loadAppRoutes() {
  // Walks app/ and collects every static path that resolves (i.e. every
  // page.tsx whose ancestors are all literal segments — no [param] or
  // (group) bracketed dirs become path segments on their own).
  const root = join(REPO_ROOT, 'app');
  const routes = new Set(['/']);
  const dynamicSlugDirs = new Set();

  function walk(dir, urlPath) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    entries.sort();
    const hasPage = entries.includes('page.tsx');
    if (hasPage) {
      routes.add(urlPath || '/');
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      let s;
      try {
        s = statSync(full);
      } catch {
        continue;
      }
      if (!s.isDirectory()) continue;
      if (entry.startsWith('(') && entry.endsWith(')')) {
        // Route group, transparent in URL.
        walk(full, urlPath);
      } else if (entry.startsWith('[') && entry.endsWith(']')) {
        // Dynamic segment — record but do not enumerate.
        dynamicSlugDirs.add(urlPath || '/');
      } else {
        walk(full, `${urlPath}/${entry}`);
      }
    }
  }

  walk(root, '');
  return { staticRoutes: routes, dynamicParents: dynamicSlugDirs };
}

function loadMiddlewareGonePrefixes() {
  // Parses middleware.ts statically. The middleware emits 410 Gone for
  // every URL whose pathname matches one of these prefixes (or an exact
  // entry), so the audit can distinguish "URL is unhandled" from "URL is
  // intentionally 410'd by middleware."
  const text = readFileSync(join(REPO_ROOT, 'middleware.ts'), 'utf8');
  const prefixes = [];
  const arr = text.match(/const\s+GONE_PREFIXES\s*=\s*\[([\s\S]*?)\];/);
  if (arr) {
    for (const m of arr[1].matchAll(/'([^']+)'/g)) prefixes.push(m[1]);
  }
  const exact = new Set();
  const exactArr = text.match(/const\s+GONE_EXACT\s*=\s*new Set\(\[([\s\S]*?)\]\);?/);
  if (exactArr) {
    for (const m of exactArr[1].matchAll(/'([^']+)'/g)) exact.add(m[1]);
  }
  return { prefixes, exact };
}

function isGoneByMiddleware(path, gone) {
  const stripped = path.replace(/\/+$/, '') || '/';
  if (gone.exact.has(stripped)) return true;
  for (const prefix of gone.prefixes) {
    const bare = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    if (stripped === bare || stripped.startsWith(`${bare}/`)) return true;
  }
  return false;
}

function loadDynamicSlugContent() {
  // Maps dynamic-route parents to the slugs they support, derived from
  // content/<bucket>/*.md files.
  const map = new Map();
  function collect(parent, dir) {
    const full = join(REPO_ROOT, dir);
    if (!existsSync(full)) return;
    const slugs = new Set();
    for (const entry of readdirSync(full)) {
      if (entry.endsWith('.md') && entry !== 'index.md') {
        slugs.add(entry.replace(/\.md$/, ''));
      }
    }
    map.set(parent, slugs);
  }
  collect('/help', 'content/help');
  collect('/locations', 'content/locations');
  collect('/water-problems', 'content/water-problems');
  collect('/use', 'content/use');
  return map;
}

// ---------------------------------------------------------------------------
// 2. Compile Next path patterns to JS regexes
// ---------------------------------------------------------------------------

function compileMatcher(source) {
  // Handles the two pattern shapes the existing config uses:
  //   :name      single non-slash segment
  //   :name*     zero or more path segments (including the leading slash)
  //   :name+     one or more path segments
  // Anything else is treated as a literal.
  let regex = '^';
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === ':') {
      let j = i + 1;
      while (j < source.length && /[a-zA-Z0-9_]/.test(source[j])) j++;
      const modifier = source[j];
      if (modifier === '*') {
        regex += '(?:/.*)?';
        i = j + 1;
        // Strip a leading slash from the literal segment we just appended,
        // because the pattern includes the slash.
        if (regex.endsWith('/(?:/.*)?')) {
          regex = regex.slice(0, -'/(?:/.*)?'.length) + '(?:/.*)?';
        }
      } else if (modifier === '+') {
        regex += '(?:/.+)';
        i = j + 1;
        if (regex.endsWith('/(?:/.+)')) {
          regex = regex.slice(0, -'/(?:/.+)'.length) + '(?:/.+)';
        }
      } else {
        regex += '[^/]+';
        i = j;
      }
    } else {
      regex += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i++;
    }
  }
  regex += '$';
  const re = new RegExp(regex);
  return (path) => re.test(path);
}

function findMatchingRule(rules, path) {
  // Next.js scans rules in declaration order and uses the first match.
  for (const r of rules) {
    if (r.matcher(path)) return r;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 3. Validate destinations against real routes
// ---------------------------------------------------------------------------

function buildRouteResolver(categories, productHandles, app, dynamicSlugs) {
  const catSet = new Set(categories.map((c) => c.slug));
  const subSet = new Set();
  for (const c of categories) {
    for (const s of c.subcategories) subSet.add(`${c.slug}/${s}`);
  }
  const staticRoutes = app.staticRoutes;

  return function resolves(dest) {
    if (!dest || !dest.startsWith('/')) return false;
    // Parameterised destinations (e.g. /foo/:handle/) can't be verified
    // statically — assume they resolve provided the literal prefix maps to
    // a real subcategory PLP.
    if (dest.includes(':')) {
      const literalPrefix = dest.split('/:')[0].replace(/\/+$/, '');
      if (literalPrefix === '' || literalPrefix === '/') return true;
      return resolves(literalPrefix);
    }
    const path = dest.replace(/\/+$/, '') || '/';
    if (path === '/') return true;
    if (staticRoutes.has(path)) return true;

    const parts = path.slice(1).split('/');
    // Category PLP
    if (parts.length === 1 && catSet.has(parts[0])) return true;
    // Subcategory PLP
    if (parts.length === 2 && subSet.has(`${parts[0]}/${parts[1]}`)) return true;
    // Product PDP
    if (parts.length === 3 && subSet.has(`${parts[0]}/${parts[1]}`)) {
      return productHandles.has(parts[2]);
    }
    // Dynamic content slugs (/help/<slug>, /locations/<slug>, etc.)
    if (parts.length === 2) {
      const parent = `/${parts[0]}`;
      const slugs = dynamicSlugs.get(parent);
      if (slugs && slugs.has(parts[1])) return true;
    }
    if (parts.length === 3) {
      // /use/<slug>/<subslug> is the only depth-3 dynamic content route.
      if (parts[0] === 'use') {
        const useSubDir = join(REPO_ROOT, 'content/use', parts[1]);
        if (existsSync(useSubDir)) {
          const file = join(useSubDir, `${parts[2]}.md`);
          if (existsSync(file)) return true;
        }
      }
    }
    return false;
  };
}

// ---------------------------------------------------------------------------
// 4. Classify CSV rows
// ---------------------------------------------------------------------------

function isFallbackRule(rule) {
  // Pattern rules ending in :slug* / :path* (or any wildcard) are
  // catch-alls. The product-category wildcards are also fallbacks since
  // they swallow paginated and faceted variants.
  return /:[a-zA-Z0-9_]+\*/.test(rule.source);
}

function classifyRow(row, rules, resolves, middleware) {
  // Try the path as-is, then with a trailing slash flipped (the config emits
  // both variants for explicit rules; if neither hits, it's not covered).
  const candidates = [row.path];
  if (row.path.endsWith('/')) candidates.push(row.path.slice(0, -1));
  else candidates.push(`${row.path}/`);

  let matched = null;
  let matchedVia = null;
  for (const p of candidates) {
    const m = findMatchingRule(rules, p);
    if (m) {
      matched = m;
      matchedVia = p;
      break;
    }
  }

  if (matched) {
    const destOk = resolves(matched.destination);
    const bucket = destOk
      ? (isFallbackRule(matched) ? 'covered_fallback' : 'covered_explicit')
      : 'broken_destination';
    return {
      bucket,
      matchedSource: matched.source,
      matchedDestination: matched.destination,
      matchedVia,
      destinationResolves: destOk,
    };
  }

  // No rule matched. Is the URL already a valid route on the new site?
  const stripped = row.path.replace(/\/+$/, '') || '/';
  if (resolves(stripped)) {
    return {
      bucket: 'no_redirect_needed',
      matchedSource: null,
      matchedDestination: stripped,
      matchedVia: null,
      destinationResolves: true,
    };
  }

  // Middleware fall-through: returns 410 Gone for the prefixes listed in
  // middleware.ts. The CSV URLs that land here are intentionally killed,
  // not unhandled.
  if (isGoneByMiddleware(row.path, middleware)) {
    return {
      bucket: 'gone_410_middleware',
      matchedSource: null,
      matchedDestination: null,
      matchedVia: null,
      destinationResolves: false,
    };
  }

  return {
    bucket: 'not_covered',
    matchedSource: null,
    matchedDestination: null,
    matchedVia: null,
    destinationResolves: false,
  };
}

// ---------------------------------------------------------------------------
// 5. Run the audit
// ---------------------------------------------------------------------------

async function main() {
  const csv = loadCsv();
  const rules = await loadRedirectRules();
  const categories = loadCategorySlugs();
  const productHandles = loadProductHandles();
  const app = loadAppRoutes();
  const dynamicSlugs = loadDynamicSlugContent();
  const middleware = loadMiddlewareGonePrefixes();
  const resolves = buildRouteResolver(categories, productHandles, app, dynamicSlugs);

  // Validate all rule destinations once, surface broken ones in the report.
  const brokenRuleDestinations = [];
  for (const r of rules) {
    if (r.destination.startsWith('/') && !resolves(r.destination)) {
      brokenRuleDestinations.push({ source: r.source, destination: r.destination });
    }
  }

  const classified = csv.map((row) => ({
    ...row,
    ...classifyRow(row, rules, resolves, middleware),
  }));

  const buckets = {};
  for (const r of classified) {
    if (!buckets[r.bucket]) buckets[r.bucket] = { count: 0, clicks: 0, impressions: 0 };
    buckets[r.bucket].count += 1;
    buckets[r.bucket].clicks += r.clicks;
    buckets[r.bucket].impressions += r.impressions;
  }

  const priorityCoverage = {};
  for (const r of classified) {
    const key = r.priority || 'unknown';
    if (!priorityCoverage[key]) {
      priorityCoverage[key] = { total: 0, covered: 0, clicksAtRisk: 0 };
    }
    priorityCoverage[key].total += 1;
    if (r.bucket === 'covered_explicit' || r.bucket === 'covered_fallback' || r.bucket === 'no_redirect_needed' || r.bucket === 'gone_410_middleware') {
      priorityCoverage[key].covered += 1;
    } else {
      priorityCoverage[key].clicksAtRisk += r.clicks;
    }
  }

  const summary = {
    csvRows: csv.length,
    redirectRulesEvaluated: rules.length,
    bucketCounts: buckets,
    priorityCoverage,
    brokenRuleDestinations,
  };

  // ---- output.json ----
  const outputJson = {
    summary,
    rows: classified.sort((a, b) => b.clicks - a.clicks || a.path.localeCompare(b.path)),
  };
  writeFileSync(
    join(REPO_ROOT, 'scripts/audit-wp-redirects.output.json'),
    JSON.stringify(outputJson, null, 2) + '\n',
  );

  // ---- audit-report.md ----
  writeFileSync(join(REPO_ROOT, 'scripts/audit-report.md'), renderReport(summary, classified));

  // ---- proposed-redirects.mjs ----
  writeFileSync(join(REPO_ROOT, 'scripts/proposed-redirects.mjs'), renderProposals(classified, rules, resolves));

  // ---- console summary ----
  console.log(`Source URLs analysed: ${csv.length}`);
  for (const [name, v] of Object.entries(buckets).sort()) {
    console.log(`  ${name.padEnd(22)} ${String(v.count).padStart(4)}  (${v.clicks} clicks)`);
  }
  console.log('\nBroken rule destinations:', brokenRuleDestinations.length);
  for (const b of brokenRuleDestinations) {
    console.log(`  ${b.source} -> ${b.destination}`);
  }
}

// ---------------------------------------------------------------------------
// 7. Renderers
// ---------------------------------------------------------------------------

function renderReport(summary, rows) {
  const lines = [];
  lines.push('# WordPress redirect audit');
  lines.push('');
  lines.push(`Source URLs analysed: ${summary.csvRows}`);
  lines.push(`Redirect rules evaluated: ${summary.redirectRulesEvaluated}`);
  lines.push('');
  lines.push('## Coverage by bucket');
  lines.push('');
  lines.push('| Bucket | URLs | Clicks | Impressions |');
  lines.push('|---|---:|---:|---:|');
  for (const [name, v] of Object.entries(summary.bucketCounts).sort()) {
    lines.push(`| ${name} | ${v.count} | ${v.clicks} | ${v.impressions} |`);
  }
  lines.push('');
  lines.push('## Coverage by priority');
  lines.push('');
  lines.push('| Priority | Total | Covered | Clicks at risk |');
  lines.push('|---|---:|---:|---:|');
  const order = ['critical', 'high', 'medium', 'low'];
  const sortedPrio = Object.entries(summary.priorityCoverage).sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
  );
  for (const [name, v] of sortedPrio) {
    lines.push(`| ${name} | ${v.total} | ${v.covered} | ${v.clicksAtRisk} |`);
  }
  lines.push('');
  lines.push('## Broken rule destinations');
  lines.push('');
  if (summary.brokenRuleDestinations.length === 0) {
    lines.push('_None — every existing rule lands on a real route._');
  } else {
    lines.push('Each rule below has a destination that does not resolve to a real route on the new site.');
    lines.push('');
    lines.push('| Source | Destination |');
    lines.push('|---|---|');
    for (const b of summary.brokenRuleDestinations) {
      lines.push(`| \`${b.source}\` | \`${b.destination}\` |`);
    }
  }
  lines.push('');
  lines.push('## Not-covered URLs (top 30 by clicks)');
  lines.push('');
  const notCovered = rows.filter((r) => r.bucket === 'not_covered').slice(0, 30);
  if (notCovered.length === 0) {
    lines.push('_All URLs are covered by an existing rule or already resolve._');
  } else {
    lines.push('| Path | Type | Priority | Clicks | Impressions | Suggested |');
    lines.push('|---|---|---|---:|---:|---|');
    for (const r of notCovered) {
      lines.push(`| \`${r.path}\` | ${r.type} | ${r.priority} | ${r.clicks} | ${r.impressions} | ${r.suggested} |`);
    }
  }
  lines.push('');
  lines.push('## Covered-by-fallback URLs (top 20 by clicks)');
  lines.push('');
  lines.push('These resolve via a wildcard rule (e.g. `/product/:slug*` -> `/water-filters`). Worth reviewing high-traffic ones for a more specific rule.');
  lines.push('');
  const fb = rows.filter((r) => r.bucket === 'covered_fallback').slice(0, 20);
  if (fb.length === 0) {
    lines.push('_None._');
  } else {
    lines.push('| Path | Clicks | Falls through to |');
    lines.push('|---|---:|---|');
    for (const r of fb) {
      lines.push(`| \`${r.path}\` | ${r.clicks} | \`${r.matchedSource}\` -> \`${r.matchedDestination}\` |`);
    }
  }
  lines.push('');
  return lines.join('\n') + '\n';
}

function renderProposals(rows, existingRules, resolves) {
  // Only rules that fill gaps in the existing config. Excludes anything
  // already covered (explicit or fallback) and anything that already
  // resolves without a redirect.
  const proposals = [];
  let sawColour = false;
  for (const r of rows) {
    if (r.bucket !== 'not_covered') continue;
    if (r.path.startsWith('/colour/')) {
      // Collapse all 7 /colour/<attr>/ variants into a single wildcard rule
      // (1 click total across the bucket per CSV, not worth per-URL precision).
      if (!sawColour) {
        proposals.push({ source: '/colour/:slug*', destination: '/water-filters', kind: 'low_priority' });
        sawColour = true;
      }
      continue;
    }
    if (r.path === '/author/steve/' || r.path === '/author/steve') {
      // 5 clicks at position 8.7. Checklist suggests author pages aren't
      // migrating; brief specifies 301 to /contact rather than 410.
      proposals.push({ source: '/author/steve', destination: '/contact', kind: 'low_priority' });
      continue;
    }
    if (/^\/\d{4}\/\d{2}\/?$/.test(r.path)) {
      proposals.push({ source: r.path.replace(/\/$/, ''), destination: null, kind: 'gone_410' });
      continue;
    }
    if (r.path.startsWith('/category/')) {
      proposals.push({ source: r.path.replace(/\/$/, ''), destination: null, kind: 'gone_410' });
      continue;
    }
    if (r.path.startsWith('/wp-content/')) {
      // Per checklist: WP asset hotlinks. Leave as 404, do not propose.
      continue;
    }
    if (r.path.startsWith('/brand/')) {
      proposals.push({ source: r.path.replace(/\/$/, ''), destination: null, kind: 'gone_410' });
      continue;
    }
    // Top-level pages with no matching app route.
    if (r.type === 'top-level page (landing/info)') {
      proposals.push({
        source: r.path.replace(/\/$/, ''),
        destination: null,
        kind: 'needs_manual_review',
        reason: `Top-level WP page; no /<slug> route on new site. Clicks=${r.clicks}, impressions=${r.impressions}.`,
        clicks: r.clicks,
        impressions: r.impressions,
      });
      continue;
    }
    proposals.push({
      source: r.path.replace(/\/$/, ''),
      destination: null,
      kind: 'needs_manual_review',
      reason: `Type=${r.type}, suggested=${r.suggested}.`,
      clicks: r.clicks,
      impressions: r.impressions,
    });
  }

  // Deduplicate (some rows differ only in trailing slash).
  const seen = new Set();
  const unique = [];
  for (const p of proposals) {
    const key = `${p.kind}\t${p.source}\t${p.destination ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }
  unique.sort((a, b) => a.kind.localeCompare(b.kind) || a.source.localeCompare(b.source));

  const out = [];
  out.push('// AUTO-GENERATED by scripts/audit-wp-redirects.mjs. Do NOT merge as-is.');
  out.push('// Every entry is a *proposal* identified by the audit as not currently');
  out.push('// covered by next.config.js or middleware.ts. Review each before merging —');
  out.push('// many are flagged needs_manual_review and have no destination set.');
  out.push('//');
  out.push('// Categories:');
  out.push('//   gone_410             — add prefix to middleware.ts GONE_PREFIXES');
  out.push('//                          (next.config.js redirects() only supports 3xx).');
  out.push('//   low_priority         — concrete proposal, low click value, safe to merge.');
  out.push('//   needs_manual_review  — destination not determined; team must decide.');
  out.push('//');
  out.push(`// Current state: ${unique.length} proposal(s).`);
  out.push('');
  out.push('export const PROPOSED_REDIRECTS = [');
  for (const p of unique) {
    if (p.kind === 'gone_410') {
      out.push(`  { source: ${JSON.stringify(p.source)}, gone: true, kind: 'gone_410' },`);
    } else if (p.kind === 'low_priority') {
      out.push(`  { source: ${JSON.stringify(p.source)}, destination: ${JSON.stringify(p.destination)}, permanent: true, kind: 'low_priority' },`);
    } else {
      const reason = p.reason ? ` // ${p.reason}` : '';
      out.push(`  { source: ${JSON.stringify(p.source)}, destination: null, kind: 'needs_manual_review', clicks: ${p.clicks ?? 0}, impressions: ${p.impressions ?? 0} },${reason}`);
    }
  }
  out.push('];');
  out.push('');
  return out.join('\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
