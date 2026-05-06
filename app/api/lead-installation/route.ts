import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { BUSINESS_INFO } from '@/content/business-info';
import {
  validateInstallationLead,
  isEligiblePostcode,
  type InstallationLead,
} from '@/lib/leadForm/installation';

export const runtime = 'nodejs';

// In-memory rate limit. Per-process and resets on cold start; good
// enough to block casual abuse from a single IP without standing up
// Redis for v1.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitState = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const previous = rateLimitState.get(ip) ?? [];
  const recent = previous.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitState.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateLimitState.set(ip, recent);
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml(
  lead: InstallationLead,
  meta: { ip: string; userAgent: string; submittedAt: string },
): string {
  const rows: Array<[string, string]> = [
    ['Name', lead.fullName],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Address', lead.address],
    ['Postcode', lead.postcode],
    ['Property type', lead.propertyType],
    ['Preferred install time', lead.preferredTime || '(not specified)'],
    ['Notes', lead.notes || '(none)'],
    ['Submitted at', meta.submittedAt],
    ['IP', meta.ip],
    ['User-Agent', meta.userAgent],
  ];
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #e5e5e5;font-weight:600;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px;border-bottom:1px solid #e5e5e5;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  return `<table style="font-family:system-ui,sans-serif;border-collapse:collapse;width:100%;max-width:640px">${body}</table>`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: Partial<InstallationLead>;
  try {
    payload = (await request.json()) as Partial<InstallationLead>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  // Honeypot: silently accept and discard so bots don't learn the
  // field name was the trap.
  if (typeof payload.company === 'string' && payload.company.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { ok, errors } = validateInstallationLead(payload);
  if (!ok) {
    return NextResponse.json({ error: 'Validation failed', errors }, {
      status: 400,
    });
  }

  // Server-side belt-and-braces postcode check (validateInstallationLead
  // already does this, but re-checking against BUSINESS_INFO directly
  // makes the eligibility constraint impossible to bypass with a
  // crafted client request).
  const postcode = (payload.postcode ?? '').trim();
  if (!isEligiblePostcode(postcode)) {
    return NextResponse.json(
      { error: 'Postcode is outside the eligible NSW Central Coast list.' },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);
  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions from this IP. Please try again later.' },
      { status: 429 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    console.warn(
      '[lead-installation] RESEND_API_KEY or RESEND_FROM_EMAIL missing — submission accepted in form, but no email sent.',
    );
    return NextResponse.json(
      {
        error:
          'Email delivery is not configured yet. Please email info@enviroaqua.com.au directly while we sort this out.',
      },
      { status: 503 },
    );
  }

  const lead: InstallationLead = {
    fullName: payload.fullName!.toString().trim(),
    email: payload.email!.toString().trim(),
    phone: payload.phone!.toString().trim(),
    address: payload.address!.toString().trim(),
    postcode,
    propertyType: payload.propertyType as InstallationLead['propertyType'],
    preferredTime: (payload.preferredTime ?? '').toString().trim(),
    notes: (payload.notes ?? '').toString().trim(),
    company: '',
  };

  const meta = {
    ip,
    userAgent: request.headers.get('user-agent') ?? 'unknown',
    submittedAt: new Date().toISOString(),
  };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: BUSINESS_INFO.email,
      replyTo: lead.email,
      subject: `Install package lead — ${lead.fullName} — ${lead.postcode}`,
      html: buildEmailHtml(lead, meta),
    });
    if (error) {
      console.error('[lead-installation] Resend error:', error);
      return NextResponse.json(
        { error: 'Could not send your enquiry. Please try again shortly.' },
        { status: 502 },
      );
    }
  } catch (caught) {
    console.error('[lead-installation] unexpected send failure:', caught);
    return NextResponse.json(
      { error: 'Could not send your enquiry. Please try again shortly.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
