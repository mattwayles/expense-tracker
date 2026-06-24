import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpendSmart — Expense Tracker',
  description: 'Track and manage your personal expenses with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 overflow-auto pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
