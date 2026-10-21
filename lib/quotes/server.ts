import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

const url = process.env.QUOTES_SUPABASE_URL;
const key = process.env.QUOTES_SUPABASE_SERVICE_ROLE_KEY;

export function quoteDbConfigured() {
  return Boolean(url && key);
}

export async function quoteDb<T>(table: string, method: 'GET' | 'POST' | 'PATCH', query: string, body?: unknown, prefer?: string): Promise<T> {
  if (!url || !key) throw new Error('Quotation storage is not configured');
  if (!['quotes', 'quote_access_challenges', 'quote_sessions', 'quote_purchase_order_requests'].includes(table)) throw new Error('Invalid table');
  const response = await fetch(url + '/rest/v1/' + table + '?' + query, {
    method,
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Quotation persistence failed: HTTP ' + response.status);
  if (response.status === 204) return [] as T;
  return response.json() as Promise<T>;
}

export async function newQuoteReference(): Promise<string> {
  if (!url || !key) throw new Error('Quotation storage is not configured');
  const response = await fetch(url + '/rest/v1/rpc/next_enviro_quote_reference', {
    method: 'POST',
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Unable to allocate quotation reference: HTTP ' + response.status);
  const reference: unknown = await response.json();
  if (typeof reference !== 'string' || !/^EA-Q-\\d{4,}$/.test(reference)) throw new Error('Invalid quotation reference');
  return reference;
}
export function newAccessToken() {
  return randomBytes(32).toString('base64url');
}
export function tokenDigest(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export type QuoteItem = {
  handle: string;
  variant_id: string;
  name: string;
  variant: string;
  quantity: number;
  unit_price_cents: number;
};

export type SavedQuote = {
  id: string;
  reference: string;
  customer_email: string;
  organisation: string;
  contact_name: string;
  postcode: string;
  items: QuoteItem[];
  product_total_cents: number;
  freight_status: string;
  status: string;
  created_at: string;
  expires_at: string;
  shopify_cart_id: string | null;
  shopify_order_id: string | null;
  shopify_order_name?: string | null;
  access_token_digest?: string | null;
  delivery_address?: {street:string;suburb:string;state:string;postcode:string;abn?:string} | null;
  freight_cents?: number | null;
  included_gst_cents?: number | null;
  invoice_reference?: string | null;
  invoice_status?: 'unpaid'|'checkout_started'|'paid'|'cancelled'|'refunded'|null;
  invoice_created_at?: string | null;
  invoice_paid_at?: string | null;
};
