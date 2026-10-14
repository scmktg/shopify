'use client';

import { getAnalyticsConsent } from '@/lib/analytics/client';

const KEY = 'enviroaqua:acquisition:v1';
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const OWN_HOSTS = new Set(['enviroaqua.com.au', 'www.enviroaqua.com.au', 'checkout.enviroaqua.com.au']);

export interface AcquisitionTouch {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  referrerHost: string;
  landingPath: string;
  date: string;
}
interface AcquisitionRecord { first: AcquisitionTouch; latest: AcquisitionTouch; expiresAt: number }

// Capture the arrival URL before the visitor navigates within the SPA or accepts the banner.
// This in-memory snapshot is NOT written before permission is granted.
let arrival: { url: string; referrer: string } | null = null;
function snapshotArrival() {
  if (arrival || typeof window === 'undefined') return;
  arrival = { url: window.location.href, referrer: document.referrer };
}
function safeLabel(value: string | null): string {
  return (value ?? '').replace(/[<>\r\n\t]/g, ' ').trim().slice(0, 120);
}
function hostFromReferrer(referrer: string): string {
  try {
    const url = new URL(referrer);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    const host = url.hostname.toLowerCase();
    return OWN_HOSTS.has(host) ? '' : safeLabel(host);
  } catch { return ''; }
}
export function deriveAcquisition(urlString: string, referrer: string, date: string): AcquisitionTouch {
  const url = new URL(urlString);
  const p = url.searchParams;
  const host = hostFromReferrer(referrer);
  const sourceParam = safeLabel(p.get('utm_source')).toLowerCase();
  const mediumParam = safeLabel(p.get('utm_medium')).toLowerCase();
  const paid = ['gclid','gbraid','wbraid'].some(k => !!p.get(k));
  const source = sourceParam || (paid ? 'google' : host || 'direct');
  const medium = mediumParam || (paid ? 'cpc' : !host && !sourceParam ? 'none' :
    /(^|\.)google\.|(^|\.)bing\./.test(host) ? 'organic' : 'referral');
  return {
    source, medium,
    campaign: safeLabel(p.get('utm_campaign')),
    content: safeLabel(p.get('utm_content')),
    term: safeLabel(p.get('utm_term')),
    referrerHost: host,
    // Do not copy search parameters, hashes, emails, tokens or full referrer URLs.
    landingPath: url.pathname.slice(0, 180) || '/',
    date,
  };
}
function read(now = Date.now()): AcquisitionRecord | null {
  try {
    const value = window.localStorage.getItem(KEY);
    if (!value) return null;
    const record = JSON.parse(value) as AcquisitionRecord;
    if (!record?.first || !record?.latest || !Number.isFinite(record.expiresAt) ||
        record.expiresAt <= now) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return record;
  } catch { return null; }
}
export function clearAcquisition(): void {
  try { window.localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}
export function captureAcquisition(): void {
  if (typeof window === 'undefined') return;
  snapshotArrival();
  if (getAnalyticsConsent() !== 'granted') { clearAcquisition(); return; }
  const now = Date.now();
  try {
    const existing = read(now);
    const observed = deriveAcquisition(arrival!.url, arrival!.referrer, new Date(now).toISOString());
    // Direct visits do not erase a prior identifiable source.
    const identified = observed.source !== 'direct';
    const latest = existing && !identified ? existing.latest : observed;
    const record: AcquisitionRecord = {
      first: existing?.first ?? observed,
      latest,
      expiresAt: existing?.expiresAt ?? now + RETENTION_MS,
    };
    window.localStorage.setItem(KEY, JSON.stringify(record));
  } catch { /* Attribution must never interrupt commerce. */ }
}
export function acquisitionCartAttributes(): Array<{key: string; value: string}> {
  if (typeof window === 'undefined' || getAnalyticsConsent() !== 'granted') return [];
  const record = read();
  if (!record) return [];
  const attrs: Array<{key: string; value: string}> = [
    {key: '_ea_attribution_version', value: '1'},
  ];
  for (const [prefix, touch] of [['_ea_first', record.first], ['_ea_latest', record.latest]] as const) {
    for (const field of ['source','medium','campaign','content','term','referrerHost','landingPath','date'] as const) {
      if (touch[field]) attrs.push({key: prefix + '_' + field, value: touch[field]});
    }
  }
  return attrs;
}
export function initializeAcquisition(): void {
  snapshotArrival();
  captureAcquisition();
}
