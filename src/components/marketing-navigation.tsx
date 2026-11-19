'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Brand, DemoLink } from './ui';

export function MarketingNavigation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="marketing-header-band">
      <header className="marketing-header wrap">
        <Brand />
        <button
          className="marketing-menu-toggle"
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="marketing-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <nav
          id="marketing-navigation"
          aria-label="Main navigation"
          className={open ? 'marketing-nav-open' : ''}
        >
          <Link href="/#features" onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link href="/about" onClick={() => setOpen(false)}>
            About Us
          </Link>
          <Link href="/help" onClick={() => setOpen(false)}>
            Help Center
          </Link>
          <Link href="/pricing" onClick={() => setOpen(false)}>
            Pricing
          </Link>
          <DemoLink className="mobile-demo-link" />
        </nav>
        <DemoLink className="header-demo-link" />
      </header>
    </div>
  );
}
