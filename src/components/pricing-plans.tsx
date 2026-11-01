'use client';
import { useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
export function PricingPlans({ compact = false }: { compact?: boolean }) {
  const [yearly, setYearly] = useState(false);
  return (
    <div className={`pricing-component ${compact ? 'pricing-compact' : ''}`}>
      <div className="billing-toggle" role="group" aria-label="Billing period">
        <button
          aria-pressed={!yearly}
          className={!yearly ? 'selected' : ''}
          onClick={() => setYearly(false)}
        >
          Monthly
        </button>
        <button
          aria-pressed={yearly}
          className={yearly ? 'selected' : ''}
          onClick={() => setYearly(true)}
        >
          Yearly <span>Save 18%</span>
        </button>
      </div>
      <div className="pricing-grid">
        {[
          {
            name: 'Starter',
            price: yearly ? '39' : '3.99',
            sub: yearly ? 'year' : 'month',
            trial: '14-day free trial planned for launch',
            features: [
              '1 bakery workspace',
              'Up to 3 staff members',
              '1 Production Board & unlimited task cards',
              'Production calendar & team management',
              'Custom products & basic staff roles',
            ],
          },
          {
            name: 'Plus',
            price: yearly ? '79' : '7.99',
            sub: yearly ? 'year' : 'month',
            trial: '',
            features: [
              'Everything in Starter',
              'Up to 15 staff members',
              '2 Production Boards',
              'Reusable production checklist templates',
              'Workspace themes & email reminders',
            ],
          },
        ].map((p, i) => (
          <article
            className={`price-card ${i ? 'price-plus' : ''}`}
            key={p.name}
            id={i ? 'plus' : 'starter'}
          >
            <div className="plan-heading">
              <h3>BakeBoard {p.name}</h3>
            </div>
            <div className="plan-price">
              <strong>${p.price}</strong>
              {p.sub && <span>/{p.sub}</span>}
            </div>
            <p className="plan-trial">{p.trial || '\u00a0'}</p>
            <Link
              href={i ? '/demo/overview?previewPlan=Plus' : '/demo/overview'}
              className={`button ${i ? 'button-primary' : 'button-outline'}`}
            >
              {i ? 'Explore Plus' : 'Try Free Demo'}
              <ArrowUpRight size={15} />
            </Link>
            <ul>
              {p.features.map((f, j) => (
                <li
                  key={f}
                  className={i === 1 && j === 0 ? 'feature-intro' : ''}
                >
                  <Check size={15} />
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="pricing-preview-note">
        Plans and the Starter trial are previews. Subscriptions are not
        available in the demo.
      </p>
    </div>
  );
}
