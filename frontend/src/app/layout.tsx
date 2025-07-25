import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MindConnect - Platform Kesehatan Mental & Edukasi untuk Remaja',
  description: 'Platform web interaktif yang menyediakan dukungan kesehatan mental, edukasi finansial, dan manajemen penggunaan teknologi untuk generasi muda.',
  keywords: ['kesehatan mental', 'edukasi finansial', 'digital wellness', 'remaja', 'mindfulness'],
  authors: [{ name: 'MindConnect Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}