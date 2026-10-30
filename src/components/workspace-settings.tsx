'use client';
import { useId, useRef, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { PlusPreview } from './plus-preview';
import { hasPlanCapability } from '@/lib/entitlements';
import { themePresets } from '@/lib/workspace-theme';
import { useDemoSession } from './demo-session';
import { WorkspaceAvatar } from './workspace-avatar';
import { canAccessWorkspaceSettings } from '@/lib/permissions';
import {
  deadlineWarningOptions,
  maxBakeryNameLength,
  validateWorkspaceSettings,
} from '@/lib/workspace-settings';
import { prepareWorkspaceLogo } from '@/lib/workspace-logo';
import type { WorkspaceSettings } from '@/lib/types';
import { calendarStatuses } from '@/lib/calendar';
import { useToast } from './toast-provider';

export function WorkspaceSettingsPage() {
  const showToast = useToast();
  const session = useDemoSession();
  const saved = session.workspaceSettings;
  const [draftChanges, setDraftChanges] = useState<Partial<WorkspaceSettings>>(
    {},
  );
  const draft = { ...saved, ...draftChanges };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const uploadVersion = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const editable =
    !session.accessRevoked &&
    canAccessWorkspaceSettings(
      session.role,
      session.employee.id,
      session.employees,
    );
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const zones = [
    ...new Set(['UTC', saved.timeZone, ...Intl.supportedValuesOf('timeZone')]),
  ];
  function update<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K],
  ) {
    setDraftChanges((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      for (const field of Object.keys(next))
        if (field === key || field.startsWith(`${key}.`)) delete next[field];
      return next;
    });
    setMessage('');
  }
  function cancel() {
    uploadVersion.current++;
    setUploading(false);
    setDraftChanges({});
    setErrors({});
    setMessage('');
  }
  async function upload(file?: File) {
    if (!file || !editable) return;
    const version = ++uploadVersion.current;
    setUploading(true);
    setMessage('');
    try {
      const data = await prepareWorkspaceLogo(file);
      if (version === uploadVersion.current) update('logoDataUrl', data);
    } catch (error) {
      if (version === uploadVersion.current)
        setErrors((current) => ({
          ...current,
          logoDataUrl:
            error instanceof Error
              ? error.message
              : 'Unable to load this image.',
        }));
    } finally {
      if (version === uploadVersion.current) setUploading(false);
    }
  }
  function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editable || uploading) return;
    const validation = validateWorkspaceSettings(draft);
    setErrors(validation);
    if (Object.keys(validation).length) {
      setMessage('Please fix the highlighted fields.');
      showToast('warning', 'Please fix the highlighted fields.');
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const result = session.saveWorkspaceSettings(draft);
    if (result.error) {
      setMessage(result.error);
      setErrors(result.errors ?? {});
      showToast('error', result.error);
      return;
    }
    setDraftChanges({});
    setMessage('');
    showToast('success', 'Workspace settings saved.');
  }
  if (
    session.accessRevoked ||
    !canAccessWorkspaceSettings(
      session.role,
      session.employee.id,
      session.employees,
    )
  )
    return (
      <main id="main" className="dashboard-main">
        <h1>This section is restricted</h1>
      </main>
    );
  const owner = session.employees.find((person) => person.role === 'owner');
  return (
    <main id="main" className="dashboard-main settings-page">
      <header className="page-heading">
        <div>
          <h1>Workspace Settings</h1>
          <p>Manage your bakery information and production preferences.</p>
        </div>
      </header>
      {!editable && (
        <p className="settings-readonly">
          Read-only view. Workspace settings are managed by the Owner.
        </p>
      )}
      <form ref={formRef} onSubmit={save} noValidate>
        <section className="settings-section" aria-labelledby="branding-title">
          <header>
            <h2 id="branding-title">Bakery Information &amp; Branding</h2>
          </header>
          <fieldset disabled={!editable} className="settings-fields">
            <div className="settings-logo-row">
              <WorkspaceAvatar
                workspace={draft}
                className="settings-logo-preview"
              />
              <div>
                <h3>Bakery Logo</h3>
                <p>
                  Upload your bakery&apos;s logo to personalize your BakeBoard
                  workspace. If no logo is uploaded, your bakery&apos;s initials
                  will be displayed instead.
                </p>
                <div className="settings-logo-actions">
                  <label
                    className={`button button-outline logo-upload ${errors.logoDataUrl ? 'logo-upload-invalid' : ''}`}
                  >
                    <Upload size={15} />
                    {uploading
                      ? 'Preparing image…'
                      : draft.logoDataUrl
                        ? 'Replace logo'
                        : 'Upload logo'}
                    <input
                      aria-label="Bakery logo image"
                      aria-invalid={!!errors.logoDataUrl}
                      aria-describedby={
                        errors.logoDataUrl ? 'logo-upload-error' : undefined
                      }
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={!editable || uploading}
                      onChange={(event) => {
                        void upload(event.target.files?.[0]);
                        event.target.value = '';
                      }}
                    />
                  </label>
                  {draft.logoDataUrl && (
                    <button
                      type="button"
                      className="button button-outline"
                      onClick={() => {
                        uploadVersion.current++;
                        setUploading(false);
                        update('logoDataUrl', undefined);
                      }}
                    >
                      <Trash2 size={15} />
                      Remove logo
                    </button>
                  )}
                </div>
                <small>PNG, JPEG or WebP · up to 5 MB.</small>
                {errors.logoDataUrl && (
                  <p
                    id="logo-upload-error"
                    role="alert"
                    className="field-error"
                  >
                    {errors.logoDataUrl}
                  </p>
                )}
              </div>
            </div>
            <div className="settings-grid">
              <SettingsInput
                label="Bakery name"
                maxLength={maxBakeryNameLength}
                value={draft.name}
                required
                error={errors.name}
                onChange={(value) => update('name', value)}
              />
              <SettingsInput
                label="Business email"
                type="email"
                value={draft.businessEmail}
                error={errors.businessEmail}
                onChange={(value) => update('businessEmail', value)}
              />
              <SettingsInput
                label="Business phone"
                type="tel"
                value={draft.businessPhone}
                error={errors.businessPhone}
                onChange={(value) => update('businessPhone', value)}
              />
            </div>
            <div className="settings-address">
              <h3>
                Business address <span>(optional)</span>
              </h3>
              <div className="settings-grid">
                {(
                  [
                    ['line1', 'Address line 1'],
                    ['line2', 'Address line 2'],
                    ['city', 'City / town'],
                    ['region', 'State / province / region'],
                    ['postalCode', 'Postal code'],
                    ['country', 'Country'],
                  ] as const
                ).map(([key, label]) => (
                  <SettingsInput
                    key={key}
                    label={label}
                    value={draft.address[key]}
                    error={errors[`address.${key}`]}
                    onChange={(value) =>
                      update('address', { ...draft.address, [key]: value })
                    }
                  />
                ))}
              </div>
            </div>
          </fieldset>
        </section>
        <section
          className="settings-section"
          aria-labelledby="preferences-title"
        >
          <header>
            <h2 id="preferences-title">Workspace Preferences</h2>
          </header>
          <fieldset
            disabled={!editable}
            className="settings-fields settings-grid"
          >
            <SettingsSelect
              label="Time zone"
              value={draft.timeZone}
              error={errors.timeZone}
              onChange={(value) => update('timeZone', value)}
            >
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replaceAll('_', ' ')}
                </option>
              ))}
            </SettingsSelect>
            <SettingsSelect
              label="Time format"
              value={draft.timeFormat}
              error={errors.timeFormat}
              onChange={(value) =>
                update('timeFormat', value as WorkspaceSettings['timeFormat'])
              }
            >
              <option value="12h">12-hour (2:30 PM)</option>
              <option value="24h">24-hour (14:30)</option>
            </SettingsSelect>
            <SettingsSelect
              label="Calendar week starts on"
              value={String(draft.weekStartsOn)}
              error={errors.weekStartsOn}
              onChange={(value) =>
                update('weekStartsOn', Number(value) as 0 | 1)
              }
            >
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
            </SettingsSelect>
            <SettingsSelect
              label="Default Calendar view"
              value={draft.defaultCalendarView}
              error={errors.defaultCalendarView}
              onChange={(value) =>
                update(
                  'defaultCalendarView',
                  value as WorkspaceSettings['defaultCalendarView'],
                )
              }
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </SettingsSelect>
          </fieldset>
        </section>
        <section
          className="settings-section"
          aria-labelledby="production-title"
        >
          <header>
            <h2 id="production-title">Production Settings</h2>
          </header>
          <fieldset disabled={!editable} className="settings-fields">
            <div className="settings-grid">
              <SettingsSelect
                label="Default task priority"
                value={draft.defaultPriority}
                error={errors.defaultPriority}
                onChange={(value) =>
                  update(
                    'defaultPriority',
                    value as WorkspaceSettings['defaultPriority'],
                  )
                }
              >
                {['Low', 'Normal', 'High'].map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </SettingsSelect>
              <SettingsSelect
                label="Deadline warning threshold"
                value={String(draft.warningMinutes)}
                error={errors.warningMinutes}
                onChange={(value) => update('warningMinutes', Number(value))}
              >
                {deadlineWarningOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
              </SettingsSelect>
            </div>
            <h3 className="settings-statuses-heading">Production statuses</h3>
            <div className="settings-statuses">
              {(['todo', 'progress', 'ready', 'completed'] as const).map(
                (status) => (
                  <span key={status} className={`status-badge badge-${status}`}>
                    {calendarStatuses[status]}
                  </span>
                ),
              )}
            </div>
          </fieldset>
        </section>
        <section
          className="settings-section"
          aria-labelledby="appearance-title"
        >
          <header>
            <h2 id="appearance-title">Appearance &amp; Personalization</h2>
          </header>
          <div className="settings-fields">
            {hasPlanCapability(session.plan, 'personalization') ? (
              <fieldset
                className="settings-premium-fields"
                disabled={!editable}
              >
                <div
                  className="workspace-theme-options"
                  role="group"
                  aria-label="Theme presets"
                >
                  {Object.values(themePresets).map((theme) => (
                    <button
                      type="button"
                      key={theme.preset}
                      aria-pressed={draft.appearance.preset === theme.preset}
                      className="workspace-theme-option"
                      onClick={() =>
                        update('appearance', {
                          preset: theme.preset,
                          accent: theme.accent,
                          background: theme.background,
                          surface: theme.surface,
                        })
                      }
                    >
                      <span
                        className="theme-swatch"
                        style={{
                          background: theme.background,
                          borderColor: theme.accent,
                        }}
                      >
                        <i style={{ background: theme.accent }} />
                      </span>
                      {theme.name}
                    </button>
                  ))}
                </div>
                {errors['appearance.preset'] && (
                  <p role="alert" className="field-error">
                    {errors['appearance.preset']}
                  </p>
                )}
              </fieldset>
            ) : (
              <>
                <div
                  className="theme-preview-swatches"
                  aria-label="Plus theme previews"
                >
                  {Object.values(themePresets).map((theme) => (
                    <span key={theme.preset}>
                      <i style={{ background: theme.accent }} />
                      {theme.name}
                    </span>
                  ))}
                </div>
                <PlusPreview title="Personalize your workspace">
                  Choose refined theme presets with BakeBoard Plus.
                </PlusPreview>
              </>
            )}
          </div>
        </section>
        <section className="settings-section" aria-labelledby="reminders-title">
          <header>
            <h2 id="reminders-title">Notifications &amp; Reminders</h2>
            <p className="demo-inline-note">
              Demo preview · No reminder emails are sent.
            </p>
          </header>
          <div className="settings-fields">
            {hasPlanCapability(session.plan, 'reminders') ? (
              <fieldset
                disabled={!editable}
                className="settings-premium-fields"
              >
                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={draft.reminders.enabled}
                    onChange={(event) =>
                      update('reminders', {
                        ...draft.reminders,
                        enabled: event.target.checked,
                      })
                    }
                  />
                  Enable Email Task Reminders
                </label>
                <div className="settings-reminder-timing">
                  <SettingsSelect
                    label="Reminder timing"
                    value={String(draft.reminders.timingMinutes)}
                    error={errors['reminders.timingMinutes']}
                    onChange={(value) =>
                      update('reminders', {
                        ...draft.reminders,
                        timingMinutes: Number(value),
                      })
                    }
                  >
                    {[
                      [15, '15 minutes before'],
                      [30, '30 minutes before'],
                      [60, '1 hour before'],
                      [120, '2 hours before'],
                      [1440, '1 day before'],
                    ].map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </SettingsSelect>
                </div>
                <div className="settings-grid">
                  <fieldset
                    tabIndex={-1}
                    aria-invalid={!!errors['reminders.types']}
                    aria-describedby={
                      errors['reminders.types']
                        ? 'reminder-types-error'
                        : undefined
                    }
                    className={`settings-checkbox-group ${errors['reminders.types'] ? 'settings-choice-error' : ''}`}
                  >
                    <legend>Reminder types</legend>
                    {(
                      [
                        ['upcoming', 'Upcoming assigned tasks'],
                        ['deadline', 'Approaching production deadlines'],
                        ['overdue', 'Overdue production tasks'],
                      ] as const
                    ).map(([key, label]) => (
                      <label className="settings-checkbox" key={key}>
                        <input
                          type="checkbox"
                          checked={draft.reminders.types[key]}
                          onChange={(event) =>
                            update('reminders', {
                              ...draft.reminders,
                              types: {
                                ...draft.reminders.types,
                                [key]: event.target.checked,
                              },
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                    {errors['reminders.types'] && (
                      <p id="reminder-types-error" className="field-error">
                        {errors['reminders.types']}
                      </p>
                    )}
                  </fieldset>
                  <fieldset
                    tabIndex={-1}
                    aria-invalid={!!errors['reminders.recipients']}
                    aria-describedby={
                      errors['reminders.recipients']
                        ? 'reminder-recipients-error'
                        : undefined
                    }
                    className={`settings-checkbox-group ${errors['reminders.recipients'] ? 'settings-choice-error' : ''}`}
                  >
                    <legend>Reminder recipients</legend>
                    {(
                      [
                        ['assigned', 'Assigned employees'],
                        ['owner', 'Workspace Owner'],
                      ] as const
                    ).map(([key, label]) => (
                      <label className="settings-checkbox" key={key}>
                        <input
                          type="checkbox"
                          checked={draft.reminders.recipients[key]}
                          onChange={(event) =>
                            update('reminders', {
                              ...draft.reminders,
                              recipients: {
                                ...draft.reminders.recipients,
                                [key]: event.target.checked,
                              },
                            })
                          }
                        />
                        {label}
                      </label>
                    ))}
                    {errors['reminders.recipients'] && (
                      <p id="reminder-recipients-error" className="field-error">
                        {errors['reminders.recipients']}
                      </p>
                    )}
                  </fieldset>
                </div>
              </fieldset>
            ) : (
              <PlusPreview title="Keep staff informed">
                Configure task reminder types, timing and recipients with
                BakeBoard Plus.
              </PlusPreview>
            )}
          </div>
        </section>
        <section
          className="settings-section"
          aria-labelledby="information-title"
        >
          <header>
            <h2 id="information-title">Workspace Information</h2>
          </header>
          <div className="settings-fields settings-information">
            <WorkspaceAvatar workspace={saved} className="settings-info-logo" />
            <dl>
              {[
                ['Workspace name', saved.name],
                ['Workspace ID', saved.id],
                ['Permanent Owner', owner?.name ?? 'Unavailable'],
                ['Current plan', session.plan],
                ['Workspace status', 'Demo workspace'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <div className="settings-save-bar">
          <div aria-live="polite">
            {message && (
              <p role="alert" className="field-error">
                {message}
              </p>
            )}
          </div>
          {editable && (
            <div>
              <button
                type="button"
                className="button button-outline"
                disabled={!dirty && !Object.keys(errors).length}
                onClick={cancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={!dirty || uploading}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
function SettingsInput({
  label,
  value,
  onChange,
  error,
  type = 'text',
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && ' *'}
      </label>
      <input
        id={id}
        type={type}
        maxLength={maxLength}
        className={error ? 'field-invalid' : undefined}
        value={value}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) =>
          onChange(
            maxLength === undefined
              ? event.target.value
              : event.target.value.slice(0, maxLength),
          )
        }
      />
      {error && (
        <small id={`${id}-error`} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}
function SettingsSelect({
  label,
  value,
  onChange,
  error,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <select
        className={error ? 'field-invalid' : undefined}
        id={id}
        value={value}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      {error && (
        <small id={`${id}-error`} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}
