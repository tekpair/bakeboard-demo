'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, CreditCard, Sparkles, Sprout, X } from 'lucide-react';
import { useDemoSession } from './demo-session';
import { useToast } from './toast-provider';
import { canAccessWorkspaceSettings } from '@/lib/permissions';

export function ManageSubscription() {
  const session = useDemoSession();
  const showToast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const cancelDialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const allowed =
    session.ready &&
    !session.accessRevoked &&
    canAccessWorkspaceSettings(
      session.role,
      session.employee.id,
      session.employees,
    );
  useEffect(() => {
    if (!cancelOpen || !allowed) return;
    const dialog = cancelDialog.current;
    const trigger = cancelButton.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      trigger?.focus();
    };
  }, [cancelOpen, allowed]);

  if (!allowed)
    return (
      <main id="main" className="dashboard-main">
        <h1>This section is restricted</h1>
      </main>
    );

  return (
    <main id="main" className="dashboard-main subscription-page">
      <header className="page-heading">
        <div>
          <h1>Manage Subscription</h1>
          <p>Plans and billing for {session.workspaceSettings.name}.</p>
        </div>
      </header>
      <p className="owner-demo-note">
        Demo preview — no active subscription, payment method, or recurring
        charges are connected.
      </p>
      <section
        className="settings-section"
        aria-labelledby="subscription-plan-title"
      >
        <header>
          <h2 id="subscription-plan-title">
            <CreditCard size={22} aria-hidden="true" />
            Your Plan
          </h2>
        </header>
        <div className="owner-settings-content">
          <p className="subscription-intro">
            One workspace per subscription. Explore the plan that fits your
            team.
          </p>
          <div className="subscription-plan-options">
            {(
              [
                {
                  name: 'Starter',
                  monthly: '3.99',
                  annual: '39',
                  Icon: Sprout,
                  features: [
                    'Up to 3 staff members',
                    '1 Production Board',
                    'Production calendar and custom products',
                  ],
                },
                {
                  name: 'Plus',
                  monthly: '7.99',
                  annual: '79',
                  Icon: Sparkles,
                  features: [
                    'Up to 15 staff members',
                    'Reusable checklist templates',
                    'Workspace themes and email reminders',
                  ],
                },
              ] as const
            ).map(({ name, monthly, annual, Icon, features }) => (
              <article
                key={name}
                className={`subscription-plan-option ${session.plan === name ? 'subscription-plan-selected' : ''}`}
              >
                <h3>
                  <Icon size={20} aria-hidden="true" />
                  BakeBoard {name}
                </h3>
                <p className="subscription-price">
                  <strong>${monthly}</strong> / month
                </p>
                <p className="subscription-annual">
                  or ${annual} / year · launch pricing
                </p>
                {name === 'Starter' && (
                  <p className="subscription-trial">
                    14-day free trial planned for launch
                  </p>
                )}
                <ul>
                  {features.map((feature) => (
                    <li key={feature}>
                      <Check size={16} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={session.plan === name}
                  className={`button ${session.plan === name ? 'button-outline' : 'button-primary'}`}
                  onClick={() => {
                    if (!allowed) return;
                    session.selectPlan(name);
                    showToast(
                      'info',
                      `${name} preview enabled. No subscription or billing was changed.`,
                    );
                  }}
                >
                  {session.plan === name
                    ? 'Current preview'
                    : `Preview ${name}`}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        className="settings-section"
        aria-labelledby="billing-details-title"
      >
        <header>
          <h2 id="billing-details-title">Billing Details</h2>
        </header>
        <div className="owner-settings-content">
          <p>
            Payment methods, invoices, and renewal dates will be available here
            when subscriptions launch. No payment information is collected in
            this demo.
          </p>
        </div>
      </section>
      <section
        className="settings-section subscription-cancellation"
        aria-labelledby="cancel-subscription-title"
      >
        <header>
          <h2 id="cancel-subscription-title">Cancel Subscription</h2>
        </header>
        <div className="owner-settings-content owner-subscription-link">
          <p>
            Preview the cancellation flow. Your demo workspace and selected plan
            stay available.
          </p>
          <button
            ref={cancelButton}
            type="button"
            className="button button-outline"
            onClick={() => setCancelOpen(true)}
          >
            Cancel subscription
          </button>
        </div>
      </section>
      {cancelOpen && (
        <dialog
          ref={cancelDialog}
          className="task-modal owner-confirm-dialog"
          aria-labelledby="cancel-preview-title"
          aria-describedby="cancel-preview-description"
          onCancel={(event) => {
            event.preventDefault();
            setCancelOpen(false);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setCancelOpen(false);
          }}
        >
          <div className="task-modal-content">
            <button
              type="button"
              className="icon-button modal-close"
              aria-label="Close cancellation preview"
              onClick={() => setCancelOpen(false)}
            >
              <X size={20} />
            </button>
            <h2 id="cancel-preview-title">Preview cancellation</h2>
            <p id="cancel-preview-description">
              There is no active subscription to cancel in this demo. Confirming
              previews this action without changing your plan, workspace, or
              saved information.
            </p>
            <div className="owner-confirm-actions">
              <button
                type="button"
                className="button button-outline"
                autoFocus
                onClick={() => setCancelOpen(false)}
              >
                Go back
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  if (!allowed) return;
                  setCancelOpen(false);
                  showToast(
                    'info',
                    'Cancellation preview complete. No subscription was changed.',
                  );
                }}
              >
                Confirm preview
              </button>
            </div>
          </div>
        </dialog>
      )}
    </main>
  );
}
