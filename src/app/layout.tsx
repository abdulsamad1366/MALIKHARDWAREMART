/**
 * @file layout.tsx
 * @description Root layout wrapping all pages in Malik Hardware Mart.
 * Mounts global AuthProvider, CartProvider, sticky Header, and B2B Footer.
 */

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Malik Hardware Mart — B2B Industrial Tools, Fasteners & Hardware Distributor',
  description:
    'Leading Indian wholesale distributor of power tools, high tensile fasteners, CPVC pipes, industrial electricals, and architectural hardware. Trade pricing gated for verified contractors.',
  keywords: [
    'hardware mart',
    'b2b hardware',
    'industrial tools',
    'fasteners wholesale',
    'malik hardware',
    'bosch dealer',
    'stanley tools distributor',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

/**
 * RootLayout component.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main style={{ minHeight: 'calc(100vh - 250px)' }}>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
