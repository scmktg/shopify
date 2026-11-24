import type { ProductCardData } from '@/types/product';

// Canonical terms shared by customer queries and catalogue text.
export function normaliseSearch(value: string): string {
  return value.toLowerCase().normalize('NFKC')
    .replace(/[“”″]/g, '"').replace(/×/g, 'x')
    .replace(/(\d+(?:\.\d+)?)\s*(?:"|inches\b|inch\b)/g, '$1 ')
    .replace(/(\d)\s*\/\s*(\d)/g, '$1fraction$2')
    .replace(/(\d)\.(\d)/g, '$1decimal$2')
    .replace(/\b(\d)\s*x\s*(?=\d)/g, '$1 x ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(?:drinking\s+|water\s+)?(?:fountains?|bubblers?)\b/g, 'fountain')
    .replace(/\b(?:reverse osmosis|ro)\b/g, 'reverseosmosis')
    .replace(/\b(?:ultraviolet|uv)\b/g, 'ultraviolet')
    .replace(/\b(?:three\s*way|3\s*way)\b/g, 'threeway')
    .replace(/\b(?:faucets?|taps?)\b/g, 'tap')
    .replace(/\b(?:under\s*counter|undercounter)\b/g, 'undercounter')
    .replace(/\b(?:bench\s*top|counter\s*top)\b/g, 'benchtop')
    .replace(/\b(?:sterilisation|sterilization)\b/g, 'sterilisation')
    .replace(/\b(filters|cartridges|housings|pumps|chillers|coolers|valves|fittings|systems|membranes|tanks|mixers)\b/g, word => word.slice(0, -1))
    .trim().replace(/\s+/g, ' ');
}

function near(a: string, b: string): boolean {
  if (a.length < 4 || b.length < 4 || /\d/.test(a+b) || Math.abs(a.length-b.length)>1) return false;
  if (a.length === b.length) {
    const diffs = [...a].map((c,i) => c === b[i] ? -1 : i).filter(i => i >= 0);
    return diffs.length === 1 || (diffs.length === 2 && diffs[1] === diffs[0]+1 && a[diffs[0]] === b[diffs[1]] && a[diffs[1]] === b[diffs[0]]);
  }
  const [short,long] = a.length < b.length ? [a,b] : [b,a];
  return [...long].some((_,i) => long.slice(0,i)+long.slice(i+1) === short);
}

function match(token: string, words: string[], fuzzy: boolean): number {
  if (words.includes(token)) return 3;
  if (token.length >= 3 && !/\d/.test(token) && words.some(word => word.startsWith(token))) return 2;
  if (fuzzy && words.some(word => near(token,word))) return 1;
  return 0;
}

export function rankProducts(products: ReadonlyArray<ProductCardData>, query: string): ProductCardData[] {
  const q = normaliseSearch(query);
  const tokens = [...new Set(q.split(' ').filter(t => t && !['a','the','for','of','and','x','water'].includes(t)))];
  if (!tokens.length && q) tokens.push(...q.split(' '));
  if (!tokens.length) return [];
  const skuQuery = query.trim().toLowerCase();
  const score = (p: ProductCardData, fuzzy: boolean): number => {
    if (p.variants.some(v => v.sku?.trim().toLowerCase() === skuQuery)) return 10000;
    const title = normaliseSearch(p.title);
    const titleWords = title.split(' ');
    const details = normaliseSearch([p.handle,p.productType,...p.tags,p.housingSize ?? '',...p.variants.flatMap(v => [v.title,v.sku ?? '',...v.selectedOptions.map(o => o.value)])].join(' ')).split(' ');
    let total = 0;
    for (const token of tokens) {
      const t = match(token,titleWords,fuzzy);
      const d = match(token,details,fuzzy);
      // Every meaningful term must match; do not silently discard size or model constraints.
      if (!t && !d) return 0;
      total += Math.max(t * 12,d * 3);
    }
    if (title === q) total += 80;
    else if ((' '+title+' ').includes(' '+q+' ')) total += 24;
    const wantsPart = tokens.some(t => /^(replacement|cartridge|part|tap|filter|valve|accessory|membrane)$/.test(t));
    if (!wantsPart && tokens.includes('fountain') && /\b(replacement|cartridge|fitting)\b|\bfountain tap\b/.test(title) && !/\b(chilled|freestanding)\b/.test(title)) total -= 30;
    if (p.variants.some(v => v.availableForSale)) total += 3;
    return Math.max(total,1);
  };
  const ranked = (fuzzy: boolean) => products.map(p => ({p,s:score(p,fuzzy)})).filter(x => x.s>0).sort((a,b)=>b.s-a.s || a.p.title.localeCompare(b.p.title)).map(x=>x.p);
  const exact = ranked(false);
  return exact.length ? exact : ranked(true);
}
