import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import './brand.css';

const baloo = localFont({
  src: './fonts/Baloo2.ttf',
  variable: '--font-heading',
  weight: '700',
  display: 'swap',
});
const poppins = localFont({
  src: [
    { path: './fonts/Poppins-Regular.ttf', weight: '400' },
    { path: './fonts/Poppins-Medium.ttf', weight: '500' },
    { path: './fonts/Poppins-SemiBold.ttf', weight: '600' },
    { path: './fonts/Poppins-Bold.ttf', weight: '700' },
  ],
  variable: '--font-body',
  display: 'swap',
});
export const viewport: Viewport = { themeColor: '#0F2543' };
export const metadata: Metadata = {
  title: {
    default: 'BakeBoard ・ Less chaos, more baking.',
    template: '%s ・ BakeBoard',
  },
  description:
    'Track customer orders and bakery production in one shared workspace. Coordinate staff, follow progress, and keep deadlines and pickups in view with BakeBoard.',
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/site.webmanifest`,
  icons: {
    icon: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon-96x96.png`,
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.ico`,
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/apple-touch-icon.png`,
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${baloo.variable} ${poppins.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
