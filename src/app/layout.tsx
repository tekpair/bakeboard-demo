import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'BakeBoard ・ Less chaos, more baking.',
    template: '%s ・ BakeBoard',
  },
  description:
    'A calmer way to manage bakery production. Plan your bakes, coordinate your team, and keep every pickup on track with BakeBoard.',
  icons: {
    icon: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.svg`, sizes: 'any', type: 'image/svg+xml' },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon-32x32.png`, sizes: '32x32', type: 'image/png' },
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon-16x16.png`, sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
