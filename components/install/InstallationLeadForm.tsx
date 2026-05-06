'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  PROPERTY_TYPES,
  NOTES_MAX,
  PREFERRED_TIME_MAX,
  validateInstallationLead,
  type InstallationLead,
} from '@/lib/leadForm/installation';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface InstallationLeadFormProps {
  productUrl: string;
}

const INITIAL: InstallationLead = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  postcode: '',
  propertyType: 'House',
  preferredTime: '',
  notes: '',
  company: '',
};

export function InstallationLeadForm({ productUrl }: InstallationLeadFormProps) {
  const [data, setData] = useState<InstallationLead>(INITIAL);
  const [errors, setErrors] = useState<
    Partial<Record<keyof InstallationLead, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>('idle');

  function update<K extends keyof InstallationLead>(
    key: K,
    value: InstallationLead[K],
  ): void {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (serverError) setServerError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateInstallationLead(data);
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setServerError(null);
    setState('submitting');
    try {
      const response = await fetch('/api/lead-installation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setState('success');
        return;
      }
      const body: { error?: string; errors?: typeof errors } = await response
        .json()
        .catch(() => ({}));
      if (body.errors) setErrors(body.errors);
      setServerError(
        body.error ?? 'Could not send your enquiry. Please try again shortly.',
      );
      setState('error');
    } catch {
      setServerError(
        'Network error. Please try again or email info@enviroaqua.com.au directly.',
      );
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div
        role="status"
        className="mt-6 p-6 border border-gray-200 rounded bg-gray-50"
      >
        <h3 className="text-lg font-semibold text-black">
          Thanks — we&apos;ve got your details.
        </h3>
        <p className="mt-3 text-base text-black/80">
          We&apos;ll be in touch within 1–2 business days to confirm a time with
          the plumber. If anything is urgent, call{' '}
          <a
            href="tel:+61287728162"
            className="text-brand-blue hover:underline underline-offset-4"
          >
            (02) 8772 8162
          </a>
          .
        </p>
      </div>
    );
  }

  const showOutOfArea = errors.postcode?.startsWith('Sorry');

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
      {/* Honeypot — hidden from real users, visible to naive bots. */}
      <div
        aria-hidden="true"
        className="hidden"
        style={{ position: 'absolute', left: '-9999px' }}
      >
        <label htmlFor="install-company">Company (leave blank)</label>
        <input
          id="install-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={data.company}
          onChange={(e) => update('company', e.target.value)}
        />
      </div>

      <Field
        id="install-name"
        label="Full name"
        error={errors.fullName}
        required
      >
        <input
          id="install-name"
          type="text"
          autoComplete="name"
          required
          value={data.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          className={inputClass(Boolean(errors.fullName))}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="install-email"
          label="Email"
          error={errors.email}
          required
        >
          <input
            id="install-email"
            type="email"
            autoComplete="email"
            required
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass(Boolean(errors.email))}
          />
        </Field>
        <Field
          id="install-phone"
          label="Phone"
          error={errors.phone}
          required
        >
          <input
            id="install-phone"
            type="tel"
            autoComplete="tel"
            required
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>
      </div>

      <Field
        id="install-address"
        label="Property address"
        error={errors.address}
        required
      >
        <input
          id="install-address"
          type="text"
          autoComplete="street-address"
          required
          value={data.address}
          onChange={(e) => update('address', e.target.value)}
          className={inputClass(Boolean(errors.address))}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="install-postcode"
          label="Postcode"
          error={errors.postcode}
          required
        >
          <input
            id="install-postcode"
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            autoComplete="postal-code"
            required
            value={data.postcode}
            onChange={(e) => update('postcode', e.target.value)}
            className={inputClass(Boolean(errors.postcode))}
          />
        </Field>
        <Field
          id="install-propertyType"
          label="Property type"
          error={errors.propertyType}
          required
        >
          <select
            id="install-propertyType"
            required
            value={data.propertyType}
            onChange={(e) =>
              update(
                'propertyType',
                e.target.value as InstallationLead['propertyType'],
              )
            }
            className={inputClass(Boolean(errors.propertyType))}
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {showOutOfArea && (
        <div
          role="alert"
          className="p-4 border border-gray-200 rounded bg-gray-50 text-sm text-black"
        >
          The Whole House Install Package is currently NSW Central Coast only.
          You can still buy the filter on its own at $1,199.95 —{' '}
          <Link
            href={productUrl}
            className="text-brand-blue hover:underline underline-offset-4"
          >
            view the product
          </Link>
          .
        </div>
      )}

      <Field
        id="install-preferredTime"
        label={`Preferred install time (optional, max ${PREFERRED_TIME_MAX} chars)`}
        error={errors.preferredTime}
      >
        <input
          id="install-preferredTime"
          type="text"
          maxLength={PREFERRED_TIME_MAX}
          placeholder="e.g. weekday mornings, or after 3pm Tuesdays"
          value={data.preferredTime}
          onChange={(e) => update('preferredTime', e.target.value)}
          className={inputClass(Boolean(errors.preferredTime))}
        />
      </Field>

      <Field
        id="install-notes"
        label={`Notes (optional, max ${NOTES_MAX} chars)`}
        error={errors.notes}
      >
        <textarea
          id="install-notes"
          rows={4}
          maxLength={NOTES_MAX}
          placeholder="Anything we should know? e.g. specific water concerns, access issues, garage vs outdoor install"
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          className={inputClass(Boolean(errors.notes))}
        />
      </Field>

      {serverError && !showOutOfArea && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded transition-colors"
      >
        {state === 'submitting' ? 'Sending…' : 'Request a quote'}
      </button>

      <p className="text-xs text-black/60">
        We&apos;ll only use your details to coordinate this install. See our{' '}
        <Link
          href="/privacy/"
          className="text-brand-blue hover:underline underline-offset-4"
        >
          privacy policy
        </Link>{' '}
        for full info.
      </p>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ id, label, error, required, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-black"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="text-red-600 ml-0.5">
            *
          </span>
        )}
      </label>
      <div className="mt-1">{children}</div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  const base =
    'block w-full border rounded px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue';
  return hasError ? `${base} border-red-400` : `${base} border-gray-300`;
}
