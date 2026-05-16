import { cookies } from 'next/headers';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Lightweight admin auth. The admin dashboard is a single-user
 * surface — operations staff inside the business — so we use a
 * shared password and an HMAC-signed session cookie rather than a
 * full user system.
 *
 * Required env vars:
 *   ADMIN_PASSWORD        — the password operators type at /admin/login.
 *   ADMIN_SESSION_SECRET  — random secret used to sign session cookies.
 *                           Generate once: `openssl rand -base64 32`.
 */

const SESSION_COOKIE = 'ea_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'ADMIN_SESSION_SECRET environment variable is required and must be at least 16 characters.',
    );
  }
  return secret;
}

function getExpectedPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      'ADMIN_PASSWORD environment variable is required for the admin dashboard.',
    );
  }
  return password;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function buildToken(): string {
  const issuedAt = Date.now();
  const nonce = randomBytes(16).toString('hex');
  const payload = `${issuedAt}.${nonce}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [issuedAtRaw, nonce, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;

  const ageSeconds = (Date.now() - issuedAt) / 1000;
  if (ageSeconds < 0 || ageSeconds > SESSION_TTL_SECONDS) return false;

  const expected = sign(`${issuedAtRaw}.${nonce}`);
  const signatureBuf = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (signatureBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(signatureBuf, expectedBuf);
}

export function isPasswordCorrect(submitted: string): boolean {
  const expected = getExpectedPassword();
  const submittedBuf = Buffer.from(submitted);
  const expectedBuf = Buffer.from(expected);
  if (submittedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(submittedBuf, expectedBuf);
}

export async function createSession(): Promise<void> {
  const token = buildToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function hasValidSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  try {
    return verifyToken(token);
  } catch {
    return false;
  }
}

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE;
