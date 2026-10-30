import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand, DemoLink } from './ui';
export function MarketingHeader() {
  return (
    <header className="marketing-header wrap">
      <Brand />
      <nav aria-label="Main navigation">
        <Link href="/#features">Features</Link>
        <Link href="/about">About Us</Link>
        <Link href="/help">Help Center</Link>
        <Link href="/pricing">Pricing</Link>
      </nav>
      <DemoLink />
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer-band">
      <div className="footer wrap">
        <div className="footer-brand">
          <Brand />
          <p>Less chaos. More baking.</p>
          <span>
            © {new Date().getFullYear()} BakeBoard. All rights reserved.
          </span>
        </div>
        <div className="footer-group">
          <h2>Explore</h2>
          <nav aria-label="Explore">
            <Link href="/demo/overview">
              Try Free Demo <ArrowUpRight size={13} />
            </Link>
            <Link href="/#how-it-works">How It Works</Link>
            <Link href="/about">About Us</Link>
            <Link href="/help">Help Center</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
        </div>
        <div className="footer-group">
          <h2>Support &amp; Legal</h2>
          <nav aria-label="Support and legal">
            <Link href="mailto:hello@bakeboard.co">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </nav>
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
