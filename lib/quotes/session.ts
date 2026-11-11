import 'server-only';
import { cookies } from 'next/headers';
import { quoteDb, tokenDigest } from './server';

export async function quoteSessionEmail(): Promise<string | null> {
  const token = (await cookies()).get('ea_quote_session')?.value;
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const rows = await quoteDb<{ email: string }[]>('quote_sessions', 'GET',
    'select=email&token_digest=eq.' + tokenDigest(token) +
    '&expires_at=gt.' + encodeURIComponent(new Date().toISOString()) + '&limit=1');
  return rows[0]?.email ?? null;
}
