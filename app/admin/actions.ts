'use server';

import { redirect } from 'next/navigation';
import {
  createSession,
  destroySession,
  isPasswordCorrect,
} from '@/lib/admin/auth';

export interface LoginActionState {
  error: string | null;
}

export async function loginAction(
  _previous: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const submitted = formData.get('password');
  if (typeof submitted !== 'string' || submitted.length === 0) {
    return { error: 'Password is required.' };
  }

  try {
    if (!isPasswordCorrect(submitted)) {
      return { error: 'Incorrect password.' };
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Admin authentication is not configured.';
    return { error: message };
  }

  try {
    await createSession();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Could not create session.';
    return { error: message };
  }

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}
