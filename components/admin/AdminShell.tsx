import type { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/admin/actions';

interface AdminShellProps {
  children: ReactNode;
  shopName?: string;
}

export function AdminShell({ children, shopName }: AdminShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold tracking-tight text-black">
              ENVIRO AQUA <span className="text-gray-400">/ Admin</span>
            </Link>
            <nav className="hidden gap-4 text-sm sm:flex">
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-gray-700 hover:text-brand-blue"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {shopName ? (
              <span className="hidden text-xs text-gray-500 md:inline">{shopName}</span>
            ) : null}
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300 hover:text-black"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
