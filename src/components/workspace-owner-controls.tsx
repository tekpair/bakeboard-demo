'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { CreditCard, KeyRound } from 'lucide-react';
import { useDemoSession } from './demo-session';
import { useToast } from './toast-provider';
import { canAccessWorkspaceSettings } from '@/lib/permissions';

export function WorkspaceOwnerControls() {
  const session = useDemoSession();
  const showToast = useToast();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const allowed =
    session.ready &&
    !session.accessRevoked &&
    canAccessWorkspaceSettings(
      session.role,
      session.employee.id,
      session.employees,
    );
  if (!allowed) return null;

  return (
    <div className="workspace-owner-controls">
      <section
        className="settings-section"
        aria-labelledby="subscription-settings-title"
      >
        <header>
          <h2 id="subscription-settings-title">
            <CreditCard size={22} aria-hidden="true" />
            Subscription
          </h2>
        </header>
        <div className="owner-settings-content owner-subscription-link">
          <div>
            <h3>BakeBoard {session.plan}</h3>
            <p>
              Review plans and preview subscription management for this bakery.
            </p>
          </div>
          <Link href="/demo/subscription" className="button button-outline">
            Manage Subscription
          </Link>
        </div>
      </section>
      <section
        className="settings-section"
        id="workspace-password"
        aria-labelledby="workspace-password-title"
      >
        <header>
          <h2 id="workspace-password-title">
            <KeyRound size={22} aria-hidden="true" />
            Workspace Password
          </h2>
        </header>
        <form
          className="owner-settings-content workspace-password-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!allowed) return;
            if (password.length < 12) {
              setError('Use at least 12 characters for the sample password.');
              passwordRef.current?.focus();
              return;
            }
            if (password !== confirmation) {
              setError('The sample passwords do not match.');
              confirmRef.current?.focus();
              return;
            }
            setPassword('');
            setConfirmation('');
            setError('');
            showToast(
              'info',
              'Password change preview complete. No password was stored or changed.',
            );
          }}
        >
          <p id="password-demo-note" className="owner-demo-note">
            Demo preview — use a sample password. Passwords are not stored or
            used to sign in.
          </p>
          {error && (
            <p role="alert" className="form-error">
              Please fix the highlighted fields. {error}
            </p>
          )}
          <div className="owner-password-fields">
            <label
              className={`form-field ${error && password.length < 12 ? 'has-error' : ''}`}
            >
              New Password
              <input
                ref={passwordRef}
                type="password"
                aria-label="New Password"
                autoComplete="off"
                minLength={12}
                maxLength={128}
                value={password}
                aria-describedby="password-demo-note password-length-note"
                aria-invalid={!!error && password.length < 12}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
              />
              <small id="password-length-note">At least 12 characters.</small>
            </label>
            <label
              className={`form-field ${error && password !== confirmation ? 'has-error' : ''}`}
            >
              Confirm New Password
              <input
                ref={confirmRef}
                type="password"
                autoComplete="off"
                maxLength={128}
                value={confirmation}
                aria-describedby="password-demo-note"
                aria-invalid={!!error && password !== confirmation}
                onChange={(event) => {
                  setConfirmation(event.target.value);
                  setError('');
                }}
              />
            </label>
          </div>
          <div className="owner-settings-actions">
            <button type="submit" className="button button-primary">
              Preview password change
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
