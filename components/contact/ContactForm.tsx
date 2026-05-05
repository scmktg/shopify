'use client';

import { useState, type FormEvent } from 'react';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [state, setState] = useState<SubmitState>('idle');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('submitting');
    // TODO 2026-05: wire to a backend submission handler (Formspree,
    // Vercel Function, or similar). Until then, simulate success so
    // the form can be exercised end-to-end without a backend.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setState('success');
    (event.currentTarget as HTMLFormElement).reset();
  };

  if (state === 'success') {
    return (
      <div
        role="status"
        className="mt-8 p-5 border border-gray-200 rounded bg-gray-50"
      >
        <p className="text-base font-semibold text-black">
          Thanks — your message has been received.
        </p>
        <p className="mt-2 text-sm text-black/70">
          We aim to respond within one business day. If your enquiry is
          urgent, email{' '}
          <a
            href="mailto:info@enviroaqua.com.au"
            className="text-brand-blue hover:underline underline-offset-4"
          >
            info@enviroaqua.com.au
          </a>{' '}
          directly.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-4 text-sm font-medium text-brand-blue hover:underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-black"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        />
      </div>
      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-black"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        />
      </div>
      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-medium text-black"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        />
      </div>
      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-black"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        />
      </div>
      {state === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'submitting'}
        className="inline-flex items-center justify-center bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded transition-colors"
      >
        {state === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
