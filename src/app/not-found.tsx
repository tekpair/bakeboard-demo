import Link from 'next/link';
import Image from 'next/image';
import { House } from 'lucide-react';
import { Footer, MarketingHeader } from '@/components/marketing';

export default function NotFound() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="not-found-page">
        <div className="not-found-card wrap">
          <Image
            className="not-found-logo"
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/brand/logo-standalone.svg`}
            alt=""
            width={150}
            height={150}
          />
          <p className="eyebrow">404 · Page not found</p>
          <h1>We couldn&apos;t find that page.</h1>
          <p>
            The link may have changed, or the address might need another look.
            You can head home or explore the BakeBoard demo.
          </p>
          <div className="not-found-actions">
            <Link className="button button-primary" href="/">
              <House size={16} aria-hidden="true" /> Back to homepage
            </Link>
            <Link className="button button-outline" href="/demo/overview">
              Try Free Demo
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
