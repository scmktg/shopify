import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { hasValidSession } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await hasValidSession()) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">Enviro Aqua</p>
          <h1 className="mt-1 text-2xl font-semibold text-black">Admin sign in</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
