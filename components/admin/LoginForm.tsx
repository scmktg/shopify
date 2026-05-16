'use client';

import { useFormStatus } from 'react-dom';
import { loginAction, type LoginActionState } from '@/app/admin/actions';
import { useActionState } from 'react';

const INITIAL: LoginActionState = { error: null };

export function LoginForm() {
  const [state, action] = useActionState(loginAction, INITIAL);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-black">
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        />
      </div>
      {state.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
      <p className="text-xs text-gray-500">
        Staff only. Unauthorised access is logged.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}
