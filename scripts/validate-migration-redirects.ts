import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  canonicalProductHandle,
  productPathForSlug,
} = require('../lib/products/catalog-data.cjs') as {
  canonicalProductHandle: (handle: string) => string;
  productPathForSlug: (handle: string) => string | null;
};

type RedirectRule = {
  source: string;
  destination: string;
  statusCode?: number;
  permanent?: boolean;
};

const configPath = path.join(process.cwd(), 'vercel.json');
const config = JSON.parse(readFileSync(configPath, 'utf8')) as {
  redirects?: RedirectRule[];
};
const redirects = config.redirects ?? [];
const errors: string[] = [];
const sourceMap = new Map(redirects.map((rule) => [rule.source, rule]));

for (const rule of redirects) {
  if (!rule.source.startsWith('/') || !rule.destination.startsWith('/')) {
    errors.push(`${rule.source} -> ${rule.destination}: redirects must be site-relative`);
    continue;
  }

  if (rule.destination !== '/' && rule.destination.endsWith('/')) {
    errors.push(`${rule.source} -> ${rule.destination}: destination must be slashless`);
  }

  if (rule.source === rule.destination) {
    errors.push(`${rule.source}: redirect loops to itself`);
  }

  const chained = sourceMap.get(rule.destination);
  if (chained) {
    errors.push(
      `${rule.source} -> ${rule.destination} -> ${chained.destination}: redirect chain detected`,
    );
  }

  const destinationHandle = rule.destination.split('/').filter(Boolean).at(-1);
  if (!destinationHandle) continue;
  const canonicalHandle = canonicalProductHandle(destinationHandle);
  const canonicalPath = productPathForSlug(canonicalHandle);
  if (canonicalPath && canonicalPath !== rule.destination) {
    errors.push(
      `${rule.source} -> ${rule.destination}: canonical product path is ${canonicalPath}`,
    );
  }
}

if (errors.length > 0) {
  console.error('\nMigration redirect validation failed:\n');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Migration redirects valid: ${redirects.length} one-hop edge rules checked.`);
