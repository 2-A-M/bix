import type { Metadata } from 'next';
import './globals.css';
import { CacheInitializer } from '@/components/CacheInitializer';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata: Metadata = {
  title: 'BIX Financial Dashboard',
  description: 'Dashboard financeiro para gestão e análise de transações',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <CacheInitializer />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}