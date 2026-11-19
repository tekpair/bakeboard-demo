'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import { useDemoSession } from './demo-session';
import { WorkspaceAvatar } from './workspace-avatar';
import { canAccessWorkspaceSettings } from '@/lib/permissions';

export function OwnerWorkspaceMenu() {
  const session = useDemoSession();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const allowed =
    session.ready &&
    !session.accessRevoked &&
    canAccessWorkspaceSettings(
      session.role,
      session.employee.id,
      session.employees,
    );

  useEffect(() => {
    if (!open || !allowed) return;
    container.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open, allowed]);

  if (!allowed) return null;
  return (
    <div
      className="owner-workspace-menu"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
          trigger.current?.focus();
          return;
        }
        if (
          !open ||
          !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
        )
          return;
        event.preventDefault();
        const items = Array.from(
          container.current?.querySelectorAll<HTMLElement>(
            '[role="menuitem"]',
          ) ?? [],
        );
        const index = items.indexOf(document.activeElement as HTMLElement);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
                items.length;
        items[next]?.focus();
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="owner-workspace-trigger"
        aria-label={`${session.workspaceSettings.name}. Open workspace menu`}
        aria-haspopup="menu"
        aria-controls="owner-workspace-dropdown"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <WorkspaceAvatar workspace={session.workspaceSettings} />
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div
          id="owner-workspace-dropdown"
          className="owner-workspace-dropdown"
          role="menu"
          aria-label="Workspace menu"
        >
          <p className="owner-workspace-menu-name">
            {session.workspaceSettings.name}
          </p>
          {[
            {
              href: '/demo/overview',
              label: 'Overview',
              Icon: LayoutDashboard,
            },
            {
              href: '/demo/settings',
              label: 'Workspace Settings',
              Icon: Settings,
            },
            {
              href: '/demo/subscription',
              label: 'Manage Subscription',
              Icon: CreditCard,
            },
            { href: '/', label: 'Logout', Icon: LogOut },
          ].map(({ href, label, Icon }) => (
            <Link
              key={label}
              href={href}
              role="menuitem"
              className={label === 'Logout' ? 'owner-menu-logout' : ''}
              title={label === 'Logout' ? 'Leave the demo' : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
