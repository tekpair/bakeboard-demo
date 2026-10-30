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
            name: 'Free',
            price: '0',
            sub: '',
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
            sub: yearly ? 'per year' : 'per month',
            features: [
              'Everything in Free',
              '2 workspaces & up to 15 staff members',
              '2 Production Boards',
              'Reusable production checklist templates',
              'Workspace themes & email reminders',
            ],
          },
        ].map((p, i) => (
          <article
            className={`price-card ${i ? 'price-plus' : ''}`}
            key={p.name}
            id={i ? 'plus' : 'free'}
          >
            <div className="plan-heading">
              <h3>BakeBoard {p.name}</h3>
            </div>
            <div className="plan-price">
              <strong>${p.price}</strong>
              {p.sub && <span>/{p.sub}</span>}
            </div>
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
    </div>
  );
}
