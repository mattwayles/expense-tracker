'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Plus, Wallet, Lightbulb } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: List },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/add', label: 'Add Expense', icon: Plus },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-100 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-6 border-b border-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">SpendSmart</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 p-3 pt-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Data stored locally</p>
        </div>
      </aside>

      {/* Bottom bar — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white lg:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const isAdd = href === '/add';
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isAdd
                  ? 'text-indigo-600'
                  : active
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {isAdd ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-200">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              ) : (
                <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : ''}`} />
              )}
              <span className={isAdd ? 'text-indigo-600' : ''}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
