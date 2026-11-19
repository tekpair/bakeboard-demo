import Link from 'next/link';
import { Brand } from './ui';
import { MarketingNavigation as MarketingHeader } from './marketing-navigation';
export { MarketingHeader };
export function Footer() {
  return (
    <footer className="footer-band">
      <div className="footer wrap">
        <div className="footer-brand">
          <Brand light />
          <p>Less chaos. More baking.</p>
          <p className="footer-description">
            It&apos;s time to choose the simplest way to keep your bakery
            running smoothly.
          </p>
          <span>
            © {new Date().getFullYear()} BakeBoard. All rights reserved.
          </span>
        </div>
        <div className="footer-group">
          <h2>Explore</h2>
          <nav aria-label="Explore">
            <Link href="/demo/overview">Try Free Demo</Link>
            <Link href="/about">About Us</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
        </div>
        <div className="footer-group">
          <h2>Support</h2>
          <nav aria-label="Support">
            <Link href="/help">Help Center</Link>
            <Link href="mailto:hello@bakeboard.co">Contact</Link>
          </nav>
        </div>
        <div className="footer-group">
          <h2>Legal</h2>
          <nav aria-label="Legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </nav>
          <div className="footer-socials">
            <p>Follow along with BakeBoard.</p>
            <div className="footer-social-icons">
              <span
                className="footer-social-icon"
                role="img"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M14 22v-9h3l.5-4H14V6.5c0-1.2.3-2 2-2H18V1.2C17.7 1.1 16.5 1 15.2 1 12.4 1 10.5 2.7 10.5 5.8V9H7v4h3.5v9H14Z" />
                </svg>
              </span>
              <span
                className="footer-social-icon"
                role="img"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </span>
              <span
                className="footer-social-icon"
                role="img"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M15.5 2H12v13a3 3 0 1 1-3-3c.3 0 .7 0 1 .1V8.5A6.5 6.5 0 1 0 15.5 15V8.3A9.7 9.7 0 0 0 21 10V6.5A5.5 5.5 0 0 1 15.5 2Z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function LegalPlaceholder({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <>
      <MarketingHeader />
      <main className="legal-page wrap" id="main">
        <p className="eyebrow">BakeBoard demo</p>
        <h1>{title}</h1>
        <p>{message}</p>
      </main>
      <Footer />
    </>
  );
}
