'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  LibraryBig,
  BookOpen,
  ListChecks,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { WorkspaceAvatar } from './workspace-avatar';
import { Avatar, Brand } from './ui';
import type { ProductionTask, Workspace } from '@/lib/types';
import { useDemoSession } from './demo-session';
import { useDemoTasks } from '@/lib/use-demo-tasks';
import { demoRoles, type DemoRole } from '@/lib/task-work';
import { hasPlanCapability, isWorkspacePlan } from '@/lib/entitlements';
import { defaultAppearance, accentTint } from '@/lib/workspace-theme';
import { canAccessWorkspaceSettings, hasCapability } from '@/lib/permissions';
import { resetDemoWorkspace } from '@/lib/task-storage';
import { useToast } from './toast-provider';
export function AppShell({
  children,
  initialTasks,
}: {
  children: React.ReactNode;
  workspace: Workspace;
  initialTasks: ProductionTask[];
}) {
  const showToast = useToast();
  const {
    workspaceSettings: workspace,
    plan,
    selectPlan,
    employee,
    employees,
    role,
    ready,
    accessRevoked,
    selectEmployee,
    selectRole,
  } = useDemoSession();
  const { tasks } = useDemoTasks(initialTasks);
  const taskCount = tasks.length;
  const canAddBoard =
    ready && !accessRevoked && role === 'owner' && employee.role === 'owner';
  const roleLabel = `${demoRoles[role]} preview`;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [inputModality, setInputModality] = useState<'pointer' | 'keyboard'>(
    'pointer',
  );
  const [upgradeBoardsOpen, setUpgradeBoardsOpen] = useState(false);
  const pricingPreviewApplied = useRef(false);
  const upgradeBoardsRef = useRef<HTMLDialogElement>(null);
  const addBoardRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  const staffVisible =
    ready && !accessRevoked && hasCapability(role, 'viewStaffSection');
  const managementVisible =
    ready && !accessRevoked && hasCapability(role, 'viewManagementSection');
  const libraryVisible =
    ready && !accessRevoked && hasCapability(role, 'viewProductionLibrary');
  const settingsVisible =
    ready &&
    !accessRevoked &&
    canAccessWorkspaceSettings(role, employee.id, employees);
  const appearance = hasPlanCapability(plan, 'personalization')
    ? workspace.appearance
    : defaultAppearance;
  const workspaceStyle = {
    '--green': appearance.accent,
    '--ivory': appearance.background,
    '--paper': appearance.surface,
    '--line': 'color-mix(in srgb, var(--green) 13%, var(--paper))',
    '--workspace-control': 'color-mix(in srgb, var(--green) 6%, var(--paper))',
    '--workspace-column': 'color-mix(in srgb, var(--green) 9%, var(--paper))',
    '--workspace-hover': 'color-mix(in srgb, var(--green) 12%, var(--paper))',
    '--workspace-border': 'color-mix(in srgb, var(--green) 24%, var(--paper))',
    '--workspace-today': 'color-mix(in srgb, var(--green) 8%, var(--paper))',
    '--workspace-progress': 'color-mix(in srgb, var(--green) 82%, white)',
    '--sage': hasPlanCapability(plan, 'personalization')
      ? accentTint(appearance.accent)
      : '#e7eee4',
    '--workspace-nav': hasPlanCapability(plan, 'personalization')
      ? accentTint(appearance.accent)
      : '#eaf0e6',
    '--workspace-sidebar': '#fafbf8',
    '--workspace-outside': hasPlanCapability(plan, 'personalization')
      ? appearance.background
      : '#f7f8f4',
  } as React.CSSProperties;
  const restricted =
    !ready ||
    accessRevoked ||
    (path.startsWith('/demo/team') && !managementVisible) ||
    (path.startsWith('/demo/settings') && !settingsVisible) ||
    (path.startsWith('/demo/library') && !libraryVisible) ||
    (path.startsWith('/demo/my-tasks') && !staffVisible);
  useEffect(() => {
    if (!mobileOpen) return;
    const toggle = mobileToggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current
      ?.querySelector<HTMLButtonElement>('.mobile-nav-close')
      ?.focus();
    const breakpoint = window.matchMedia('(max-width: 700px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) setMobileOpen(false);
    };
    breakpoint.addEventListener('change', closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      breakpoint.removeEventListener('change', closeOnDesktop);
      toggle?.focus();
    };
  }, [mobileOpen]);
  useEffect(() => {
    if (!upgradeBoardsOpen) return;
    const dialog = upgradeBoardsRef.current;
    const trigger = addBoardRef.current;
    dialog?.showModal();
    return () => {
      if (dialog?.open) dialog.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [upgradeBoardsOpen]);
  useEffect(() => {
    if (!ready || pricingPreviewApplied.current) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('previewPlan') !== 'Plus') return;
    pricingPreviewApplied.current = true;
    selectPlan('Plus');
    url.searchParams.delete('previewPlan');
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [ready, selectPlan]);
  useEffect(() => {
    const markPointer = () => setInputModality('pointer');
    const markKeyboard = (event: KeyboardEvent) => {
      if (
        event.key === 'Tab' ||
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Home' ||
        event.key === 'End' ||
        event.key.startsWith('Arrow')
      )
        setInputModality('keyboard');
    };
    window.addEventListener('pointerdown', markPointer, true);
    window.addEventListener('keydown', markKeyboard, true);
    return () => {
      window.removeEventListener('pointerdown', markPointer, true);
      window.removeEventListener('keydown', markKeyboard, true);
    };
  }, []);
  return (
    <div
      style={workspaceStyle}
      data-input-modality={inputModality}
      className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-navigation-open' : ''}`}
    >
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className="app-sidebar"
        ref={sidebarRef}
        id="workspace-sidebar"
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? true : undefined}
        aria-label={mobileOpen ? 'Workspace menu' : undefined}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setMobileOpen(false);
          if (mobileOpen && event.key === 'Tab') {
            const controls = Array.from(
              sidebarRef.current?.querySelectorAll<HTMLElement>(
                'a[href], button, select',
              ) ?? [],
            ).filter((control) => control.offsetParent !== null);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-nav-close"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
          <button
            className="icon-button collapse-button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>
        <div className="workspace-switch">
          <WorkspaceAvatar workspace={workspace} />
          <span className="sidebar-text">
            <strong>{workspace.name}</strong>
            <small>Bakery workspace</small>
          </span>
        </div>
        {!accessRevoked && (
          <button
            type="button"
            className="sidebar-reset-demo"
            aria-label="Reset Demo"
            title="Reset Demo"
            onClick={() => {
              if (
                !window.confirm(
                  'Reset the entire demo? This will erase your saved tasks, staff, invites, activity, workspace settings, and library changes.',
                )
              )
                return;
              if (!resetDemoWorkspace()) {
                showToast(
                  'error',
                  'Could not reset the demo. Please try again.',
                );
                return;
              }
              window.location.reload();
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span className="sidebar-text">Reset Demo</span>
          </button>
        )}
        {!accessRevoked && (
          <>
            <div className="sidebar-section-label sidebar-text">WORKSPACE</div>
            <nav aria-label="Workspace navigation">
              {[
                {
                  href: '/demo/overview',
                  label: 'Overview',
                  Icon: LayoutDashboard,
                },
                {
                  href: '/demo/board',
                  label: 'Production Board',
                  Icon: ClipboardList,
                },
                {
                  href: '/demo/calendar',
                  label: 'Calendar',
                  Icon: CalendarDays,
                },
                ...(libraryVisible
                  ? [
                      {
                        href: '/demo/library',
                        label: 'Production Library',
                        Icon: LibraryBig,
                      },
                    ]
                  : []),
              ].map(({ href, label, Icon }) => {
                const link = (
                  <Link
                    title={collapsed ? label : undefined}
                    className={`sidebar-link ${path === href ? 'active' : ''}`}
                    href={href}
                    aria-label={label}
                    aria-current={path === href ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} />
                    <span className="sidebar-text">{label}</span>
                  </Link>
                );
                return href.endsWith('board') ? (
                  <div className="sidebar-board-row" key={href}>
                    {link}
                    <div className="sidebar-board-trailing">
                      {canAddBoard && (
                        <button
                          ref={addBoardRef}
                          type="button"
                          className="sidebar-board-add"
                          aria-label="Add Production Board"
                          title="Add Production Board"
                          onClick={() => {
                            if (plan === 'Starter') setUpgradeBoardsOpen(true);
                          }}
                        >
                          <Plus size={15} aria-hidden="true" />
                        </button>
                      )}
                      {taskCount > 0 && (
                        <small
                          className="sidebar-count"
                          aria-label={`${taskCount} tasks`}
                        >
                          {taskCount}
                        </small>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={href}>{link}</div>
                );
              })}
            </nav>
          </>
        )}
        {staffVisible && (
          <>
            <div className="sidebar-section-label sidebar-text">STAFF VIEW</div>
            <nav aria-label="Staff navigation">
              <Link
                href="/demo/my-tasks"
                title={collapsed ? 'My Tasks' : undefined}
                aria-label="My Tasks"
                aria-current={path === '/demo/my-tasks' ? 'page' : undefined}
                className={`sidebar-link ${path === '/demo/my-tasks' ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <ListChecks size={18} />
                <span className="sidebar-text">My Tasks</span>
              </Link>
            </nav>
          </>
        )}
        {managementVisible && (
          <>
            <div className="sidebar-section-label sidebar-text">MANAGEMENT</div>
            <nav aria-label="Management navigation">
              <Link
                href="/demo/team"
                title={collapsed ? 'Staff Management' : undefined}
                aria-label="Staff Management"
                aria-current={path === '/demo/team' ? 'page' : undefined}
                className={`sidebar-link ${path === '/demo/team' ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Users size={18} />
                <span className="sidebar-text">Staff Management</span>
              </Link>
              {settingsVisible && (
                <Link
                  href="/demo/settings"
                  title={collapsed ? 'Workspace Settings' : undefined}
                  aria-label="Workspace Settings"
                  aria-current={path === '/demo/settings' ? 'page' : undefined}
                  className={`sidebar-link ${path === '/demo/settings' ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Settings size={18} />
                  <span className="sidebar-text">Workspace Settings</span>
                </Link>
              )}
            </nav>
          </>
        )}
        <div className="sidebar-bottom">
          {ready && plan === 'Starter' && (
            <div className="sidebar-upgrade sidebar-text">
              <div>
                <h4>Starter Preview</h4>
                <Link href="/pricing">
                  Explore Plus <ArrowUpRight size={14} />
                </Link>
              </div>
              <span className="sidebar-upgrade-badge" aria-hidden="true">
                <Sparkles size={18} />
              </span>
            </div>
          )}
          <Link
            href="/help"
            className="sidebar-link"
            title={collapsed ? 'Help Center Guides' : undefined}
            aria-label="Help Center Guides"
            onClick={() => setMobileOpen(false)}
          >
            <BookOpen size={18} />
            <span className="sidebar-text">Help Center Guides</span>
          </Link>
          <Link
            href="/"
            className="sidebar-link"
            title="Back to website"
            aria-label="Back to website"
          >
            <ArrowLeft size={16} />
            <span className="sidebar-text">Back to website</span>
          </Link>
          <div
            className="profile-menu"
            onKeyDown={(event) => {
              if (event.key === 'Escape') setProfileOpen(false);
            }}
          >
            <button
              type="button"
              className={`user-profile ${profileOpen ? 'profile-open' : ''}`}
              aria-label={`${employee.name}, ${roleLabel}. Open demo controls`}
              aria-expanded={profileOpen}
              title={collapsed ? `${employee.name} · ${roleLabel}` : undefined}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <Avatar employee={employee} />
              <span className="sidebar-text">
                <strong>{employee.name}</strong>
                <small>{roleLabel}</small>
              </span>
            </button>
            {profileOpen && (
              <div className="demo-profile-popover">
                <label>
                  Preview employee
                  <select
                    aria-label="Preview employee"
                    value={employee.id}
                    onChange={(event) => selectEmployee(event.target.value)}
                  >
                    {employees.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                        {!person.active ? ' (Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Preview role
                  <select
                    aria-label="Preview role"
                    value={role}
                    onChange={(event) =>
                      selectRole(event.target.value as DemoRole)
                    }
                  >
                    {Object.entries(demoRoles).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Preview plan
                  <select
                    aria-label="Preview plan"
                    value={plan}
                    onChange={(event) => {
                      if (isWorkspacePlan(event.target.value))
                        selectPlan(event.target.value);
                    }}
                  >
                    <option>Starter</option>
                    <option>Plus</option>
                  </select>
                </label>
                <Link
                  href="/demo/profile"
                  className="demo-profile-settings"
                  onClick={() => {
                    setProfileOpen(false);
                    setMobileOpen(false);
                  }}
                >
                  <Settings size={15} aria-hidden="true" />
                  Account Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
      {upgradeBoardsOpen && canAddBoard && (
        <dialog
          ref={upgradeBoardsRef}
          className="task-modal sidebar-board-upgrade-dialog"
          aria-labelledby="add-board-upgrade-title"
          aria-describedby="add-board-upgrade-description"
          onClose={() => setUpgradeBoardsOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget)
              setUpgradeBoardsOpen(false);
          }}
        >
          <div className="task-modal-content">
            <h2 id="add-board-upgrade-title">Add another Production Board</h2>
            <p id="add-board-upgrade-description">
              Additional Production Boards are available with BakeBoard Plus.
            </p>
            <div className="sidebar-board-upgrade-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setUpgradeBoardsOpen(false)}
              >
                Maybe later
              </button>
              <Link className="button button-primary" href="/pricing">
                Explore Plus <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </dialog>
      )}
      <div className="app-body" inert={mobileOpen}>
        <header className="app-topbar">
          <button
            className="icon-button mobile-nav-toggle"
            ref={mobileToggleRef}
            aria-label="Open navigation"
            aria-controls="workspace-sidebar"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            {path.endsWith('profile')
              ? 'Account Settings'
              : path.endsWith('team') || path.endsWith('settings')
                ? 'Management'
                : path.endsWith('my-tasks')
                  ? 'Staff View'
                  : 'Workspace'}{' '}
            <span>/</span>{' '}
            <strong>
              {path.endsWith('profile')
                ? 'My Profile'
                : path.endsWith('library')
                  ? 'Production Library'
                  : path.endsWith('settings')
                    ? 'Workspace Settings'
                    : path.endsWith('team')
                      ? 'Staff Management'
                      : path.endsWith('my-tasks')
                        ? 'My Tasks'
                        : path.endsWith('calendar')
                          ? 'Calendar'
                          : path.endsWith('board')
                            ? 'Production Board'
                            : 'Overview'}
            </strong>
          </div>
          <Link
            href="/pricing"
            className="demo-pill"
            aria-label="Demo preview · view plans"
          >
            Demo · Preview
          </Link>
        </header>
        {restricted ? (
          <main id="main" className="dashboard-main">
            <section className="team-empty">
              <h1>
                {accessRevoked
                  ? 'Workspace access removed'
                  : ready
                    ? 'This section is restricted'
                    : 'Loading workspace…'}
              </h1>
              {ready && !accessRevoked && (
                <Link className="button button-outline" href="/demo/overview">
                  Open Overview
                </Link>
              )}
              {accessRevoked && (
                <p>
                  This staff identity is no longer a member of this workspace.
                </p>
              )}
            </section>
          </main>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
