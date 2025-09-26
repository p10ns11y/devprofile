import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Next.js Color Scheme App',
  description: 'Dynamic color scheme demo with Tailwind CSS v4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" color-scheme="light">
      <body>{children}</body>
    </html>
  );
}