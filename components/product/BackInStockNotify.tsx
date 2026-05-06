'use client';

import { useId, useState } from 'react';
import { BACK_IN_STOCK_ENDPOINT } from '@/lib/site-config';

interface BackInStockNotifyProps {
  productId: string;
  sku: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'done' | 'error';

export function BackInStockNotify({ productId, sku }: BackInStockNotifyProps) {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting' || status === 'done') return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email.');
      return;
    }

    setStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch(BACK_IN_STOCK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sku, email: trimmed }),
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      setStatus('done');
    } catch {
      setStatus('error');
      setErrorMessage(
        'Something went wrong — please try again in a moment.',
      );
    }
  };

  if (status === 'done') {
    return (
      <p className="text-sm text-black" role="status">
        We&apos;ll email you the moment it&apos;s back.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
      <label htmlFor={inputId} className="sr-only">
        Notify me when back in stock
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="Notify me when back in stock"
          aria-invalid={status === 'error'}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-4 py-2 text-sm bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
        >
          {status === 'submitting' ? 'Sending…' : 'Notify me'}
        </button>
      </div>
      {errorMessage && (
        <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
