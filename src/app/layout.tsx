import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { SokoNovaProvider } from '@/context/SokoNovaContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SokoNova | B2B Wholesale Electronics & Direct Import Distribution',
  description:
    'Quality electronics at wholesale prices. Live stock visibility, automated Bronze/Silver/Gold bulk tier pricing, official warranty coverage, and Direct Warehouse-to-Doorstep Delivery.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'SokoNova Wholesale Electronics Portal',
    description:
      'Direct Import & Bulk Distribution for Retailers and Corporate Buyers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#F8FAFC] text-zinc-900`}>
        <SokoNovaProvider>{children}</SokoNovaProvider>
      </body>
    </html>
  );
}