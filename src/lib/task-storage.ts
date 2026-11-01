import { hasPlanCapability, isWorkspacePlan } from './entitlements';
import { appearanceForPreset } from './workspace-theme';
import { reminderErrors } from './workspace-settings';
import {
  defaultProductionLibrary,
  legacyProductId,
  taskProductName,
  validateProduct,
  validateCategory,
  validCategoryName,
  recordCategory,
  legacyCategoryId,
  validateTemplate,
  copyTemplateSteps,
} from './production-library';
import {
  defaultWorkspaceSettings,
  validateWorkspaceSettings,
  workspaceInitials,
  workspaceIdForName,
  validLogoData,
} from './workspace-settings';
import {
  workspace as sampleWorkspace,
  createSampleTasks,
  employees as sampleEmployees,
  activities as sampleActivities,
} from './demo-seed';
import type {
  Activity,
  Employee,
  ProductionTask,
  WorkspaceSettings,
  WorkspacePlan,
  Product,
  ProductCategory,
  ChecklistTemplate,
  ProductionLibrary,
  LibraryKind,
} from './types';
import {
  canAccessWorkspaceSettings,
  hasCapability,
  canRemoveEmployee,
  hasWorkspaceAccess,
  demoRoles,
  normalizeTeamOwnership,
  type DemoRole,
} from './permissions';
import { recordTaskCompletions } from './task-work';
import {
  preserveStaffHistory,
  purgeStaffReferences,
  removeStaffAssignments,
} from './staff-history';

const STORAGE_KEY = 'bakeboard:demo:tasks:v1';
const STATUS_SAMPLE_SEED_KEY = 'bakeboard:demo:status-samples:v1';
const CALENDAR_SAMPLE_SEED_KEY = 'bakeboard:demo:calendar-samples:v1';
const DEMO_SLATE_VERSION_KEY = 'bakeboard:demo:slate-version';
const DEMO_SLATE_VERSION = 'clean-v1';
const CHANGE_EVENT = 'bakeboard:demo:tasks-changed';
const TEAM_STORAGE_KEY = 'bakeboard:demo:employees:v1';
const TEAM_CHANGE_EVENT = 'bakeboard:demo:employees-changed';
const REMOVED_STAFF_KEY = 'bakeboard:demo:removed-staff:v1';
const ACTIVITY_KEY = 'bakeboard:demo:activity:v1';
const ACTIVITY_CHANGE_EVENT = 'bakeboard:demo:activity-changed';
const LEGACY_WORKSPACE_ID = 'ws-honey';
const PREVIOUS_SAMPLE_WORKSPACE_ID = 'ws-sweet-elevation';

// Opaque IDs prevent stale clients from restoring revoked membership or deleted activity.
// No email/name retention archive is created by the demo.
export function readRemovedStaffIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const ids: unknown = JSON.parse(
      window.localStorage.getItem(REMOVED_STAFF_KEY) ?? '[]',
    );
    return Array.isArray(ids)
      ? [
          ...new Set(
            ids.filter((id): id is string => typeof id === 'string' && !!id),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
export function readStoredActivities(
  fallback: Activity[] = sampleActivities,
): Activity[] {
  let activities = fallback;
  if (typeof window !== 'undefined') {
    try {
      const parsed: unknown = JSON.parse(
        window.localStorage.getItem(ACTIVITY_KEY) ?? 'null',
      );
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (value) =>
            value &&
            ['id', 'employeeId', 'action', 'task', 'time'].every(
              (key) => typeof value[key] === 'string',
            ),
        )
      )
        activities = parsed;
    } catch {
      /* Use the sample feed with removal filtering. */
    }
  }
  const removed = new Set(readRemovedStaffIds());
  const cleaned = activities.filter(
    (activity) => !removed.has(activity.employeeId),
  );
  if (typeof window !== 'undefined' && cleaned.length !== activities.length) {
    try {
      window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(cleaned));
    } catch {
      /* Do not expose deleted activity if storage is unavailable. */
    }
  }
  return cleaned;
}
export function activityChangeEventName() {
  return ACTIVITY_CHANGE_EVENT;
}
function purgeStaffRecords(
  employees: Employee[],
  ids = readRemovedStaffIds(),
): Employee[] {
  const removed = new Set(ids);
  return employees
    .filter((person) => !removed.has(person.id))
    .map((person) => {
      if (
        !person.invitation?.invitedBy ||
        !removed.has(person.invitation.invitedBy.id)
      )
        return person;
      const invitation = { ...person.invitation };
      delete invitation.invitedBy;
      return { ...person, invitation };
    });
}
function cleanStoredTasks(tasks: ProductionTask[]) {
  const workspaceId = readStoredWorkspaceSettings().id;
  return purgeStaffReferences(tasks, new Set(readRemovedStaffIds())).map(
    (task) => {
      const cleaned = { ...task };
      Reflect.deleteProperty(cleaned, 'productionStage');
      return task.workspaceId === LEGACY_WORKSPACE_ID ||
        task.workspaceId === PREVIOUS_SAMPLE_WORKSPACE_ID ||
        task.workspaceId === sampleWorkspace.id
        ? { ...cleaned, workspaceId }
        : cleaned;
    },
  );
}

// Team records use the same local demo storage and change-event architecture as tasks.
// Legacy records gain only the role/active fields; saved names and stable IDs survive.
export function readStoredEmployees(): Employee[] {
  const defaults = () =>
    purgeStaffRecords(sampleEmployees.map((person) => ({ ...person })));
  if (typeof window === 'undefined') return defaults();
  try {
    const raw = window.localStorage.getItem(TEAM_STORAGE_KEY);
    if (raw === null) return defaults();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults();
    const seen = new Set<string>();
    const migrated = parsed.map((value): Employee => {
      if (
        !value ||
        typeof value.id !== 'string' ||
        !value.id ||
        seen.has(value.id) ||
        typeof value.name !== 'string' ||
        !value.name.trim()
      )
        throw new Error('Invalid team record');
      seen.add(value.id);
      const seed = sampleEmployees.find((person) => person.id === value.id);
      return {
        id: value.id,
        name: value.name.trim(),
        ...(typeof value.email === 'string' && value.email.trim()
          ? { email: value.email.trim().toLowerCase() }
          : {}),
        initials: value.name
          .trim()
          .split(/\s+/)
          .map((part: string) => part[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        color: ['sage', 'caramel', 'blush'].includes(value.color)
          ? value.color
          : 'sage',
        ...(validLogoData(value.photoDataUrl)
          ? { photoDataUrl: value.photoDataUrl }
          : {}),
        role:
          typeof value.role === 'string' && Object.hasOwn(demoRoles, value.role)
            ? value.role
            : (seed?.role ?? 'employee'),
        active: typeof value.active === 'boolean' ? value.active : true,
        ...(value.invitation?.status === 'pending' &&
        typeof value.invitation.id === 'string' &&
        typeof value.invitation.createdAt === 'string' &&
        !Number.isNaN(Date.parse(value.invitation.createdAt))
          ? {
              invitation: {
                id: value.invitation.id,
                createdAt: value.invitation.createdAt,
                status: 'pending' as const,
                ...(typeof value.invitation.invitedBy?.id === 'string' &&
                typeof value.invitation.invitedBy?.name === 'string'
                  ? {
                      invitedBy: {
                        id: value.invitation.invitedBy.id,
                        name: value.invitation.invitedBy.name,
                      },
                    }
                  : {}),
              },
            }
          : {}),
      };
    });
    const normalized = normalizeTeamOwnership(
      purgeStaffRecords(migrated),
      sampleEmployees.find((person) => person.role === 'owner')!,
    );
    if (JSON.stringify(normalized) !== raw)
      window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return defaults();
  }
}
export function writeStoredEmployees(next: Employee[]): Employee[] {
  const saved = normalizeTeamOwnership(
    purgeStaffRecords(next),
    sampleEmployees.find((person) => person.role === 'owner')!,
  );
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(saved));
      window.dispatchEvent(new Event(TEAM_CHANGE_EVENT));
    } catch (error) {
      console.error(
        'Could not save BakeBoard demo team in this browser.',
        error,
      );
    }
  }
  return saved;
}
export function employeeChangeEventName() {
  return TEAM_CHANGE_EVENT;
}
export function permanentlyRemoveEmployee(
  role: DemoRole,
  actorId: string,
  employeeId: string,
): { employees?: Employee[]; error?: string } {
  if (typeof window === 'undefined')
    return { error: 'Staff removal is only available in the demo workspace.' };
  const employees = readStoredEmployees();
  if (!hasWorkspaceAccess(employees, actorId))
    return { error: 'Your workspace access has been removed.' };
  const employee = employees.find((person) => person.id === employeeId);
  if (!employee)
    return { error: 'This staff member is no longer in the workspace.' };
  if (!canRemoveEmployee(role, actorId, employee))
    return { error: 'Your preview role cannot remove this staff member.' };
  const tasks = removeStaffAssignments(readStoredTasks(), employee);
  const removedIds = [...new Set([...readRemovedStaffIds(), employeeId])];
  const remaining = purgeStaffRecords(employees, removedIds);
  const activities = readStoredActivities().filter(
    (activity) => activity.employeeId !== employeeId,
  );
  const keys = [STORAGE_KEY, TEAM_STORAGE_KEY, ACTIVITY_KEY, REMOVED_STAFF_KEY];
  let previousValues: (string | null)[];
  try {
    previousValues = keys.map((key) => window.localStorage.getItem(key));
  } catch {
    return {
      error:
        'Could not access workspace storage. This staff member was not removed.',
    };
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    window.localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(remaining));
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
    window.localStorage.setItem(REMOVED_STAFF_KEY, JSON.stringify(removedIds));
  } catch {
    try {
      keys.forEach((key, index) => {
        const value = previousValues[index];
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
      });
    } catch {
      /* Report the failed removal; do not claim success. */
    }
    return { error: 'Could not remove this staff member. Please try again.' };
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  window.dispatchEvent(new Event(TEAM_CHANGE_EVENT));
  window.dispatchEvent(new Event(ACTIVITY_CHANGE_EVENT));
  return { employees: remaining };
}
export function resetStoredEmployees() {
  return writeStoredEmployees(sampleEmployees.map((person) => ({ ...person })));
}
function isTaskList(value: unknown): value is ProductionTask[] {
  if (!Array.isArray(value)) return false;
  return value.every((candidate) => {
    if (!candidate || typeof candidate !== 'object') return false;
    const task = candidate as Record<string, unknown>;
    return (
      typeof task.id === 'string' &&
      task.id.length > 0 &&
      typeof task.workspaceId === 'string' &&
      typeof task.title === 'string' &&
      typeof task.customer === 'string' &&
      typeof task.category === 'string' &&
      validCategoryName(task.category) &&
      (task.categoryId === undefined || typeof task.categoryId === 'string') &&
      (task.productId === undefined || typeof task.productId === 'string') &&
      (task.productName === undefined ||
        typeof task.productName === 'string') &&
      typeof task.deadline === 'string' &&
      !Number.isNaN(Date.parse(task.deadline)) &&
      typeof task.pickupTime === 'string' &&
      typeof task.description === 'string' &&
      (task.quantity === undefined || typeof task.quantity === 'string') &&
      typeof task.priority === 'string' &&
      ['Low', 'High', 'Normal'].includes(task.priority) &&
      typeof task.status === 'string' &&
      ['todo', 'progress', 'ready', 'completed'].includes(task.status) &&
      (task.completedAt === undefined ||
        (typeof task.completedAt === 'string' &&
          !Number.isNaN(Date.parse(task.completedAt)))) &&
      Array.isArray(task.assigneeIds) &&
      task.assigneeIds.every((id: unknown) => typeof id === 'string') &&
      (task.formerAssignees === undefined ||
        (Array.isArray(task.formerAssignees) &&
          task.formerAssignees.every(
            (person: unknown) =>
              person &&
              typeof person === 'object' &&
              ['id', 'name', 'initials', 'color'].every(
                (key) =>
                  typeof (person as Record<string, unknown>)[key] === 'string',
              ),
          ))) &&
      Array.isArray(task.checklist) &&
      task.checklist.every(
        (step: unknown) =>
          step &&
          typeof step === 'object' &&
          typeof (step as Record<string, unknown>).label === 'string' &&
          typeof (step as Record<string, unknown>).done === 'boolean',
      ) &&
      typeof task.notes === 'string' &&
      (task.orderId === undefined || typeof task.orderId === 'string')
    );
  });
}

export function readStoredTasks(): ProductionTask[] {
  if (typeof window === 'undefined') return createSampleTasks();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return cleanStoredTasks(createSampleTasks());
    const parsed: unknown = JSON.parse(raw);
    if (!isTaskList(parsed)) return cleanStoredTasks(createSampleTasks());
    const cleaned = cleanStoredTasks(parsed);
    if (JSON.stringify(cleaned) !== raw)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return cleanStoredTasks(createSampleTasks());
  }
}

export function writeStoredTasks(next: ProductionTask[]): ProductionTask[] {
  if (typeof window === 'undefined') return next;
  const previous = readStoredTasks();
  const saved = recordTaskCompletions(
    cleanStoredTasks(preserveStaffHistory(next, previous)),
    previous,
    new Date().toISOString(),
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    recordTaskActivity(previous, saved);
  } catch (error) {
    console.error(
      'Could not save BakeBoard demo tasks in this browser.',
      error,
    );
  }
  return saved;
}

function recordTaskActivity(
  previous: ProductionTask[],
  next: ProductionTask[],
) {
  const before = new Map(previous.map((task) => [task.id, task]));
  const after = new Map(next.map((task) => [task.id, task]));
  const changes: { task: ProductionTask; action: string }[] = [];
  const statusActions: Record<ProductionTask['status'], string> = {
    todo: 'moved to To Do',
    progress: 'started work on',
    ready: 'marked ready',
    completed: 'completed',
  };
  for (const task of next) {
    const old = before.get(task.id);
    if (!old) changes.push({ task, action: 'created' });
    else if (old.status !== task.status)
      changes.push({ task, action: statusActions[task.status] });
    else if (JSON.stringify(old.checklist) !== JSON.stringify(task.checklist))
      changes.push({ task, action: 'updated the checklist for' });
    else if (
      JSON.stringify(old.assigneeIds) !== JSON.stringify(task.assigneeIds)
    )
      changes.push({ task, action: 'updated assignments for' });
    else if (JSON.stringify(old) !== JSON.stringify(task))
      changes.push({ task, action: 'updated' });
  }
  for (const task of previous)
    if (!after.has(task.id)) changes.push({ task, action: 'deleted' });
  if (!changes.length) return;

  let actorId = sampleEmployees[0].id;
  try {
    const session = JSON.parse(
      window.localStorage.getItem('bakeboard:demo:session:v1') ?? 'null',
    );
    if (typeof session?.employeeId === 'string') actorId = session.employeeId;
  } catch {
    /* Use the default demo employee for activity when preview state is invalid. */
  }
  const occurredAt = new Date().toISOString();
  const entries: Activity[] = changes.map(({ task, action }) => ({
    id: `activity-${crypto.randomUUID()}`,
    employeeId: actorId,
    action,
    task: task.title,
    taskId: task.id,
    time: 'Just now',
    occurredAt,
  }));
  try {
    window.localStorage.setItem(
      ACTIVITY_KEY,
      JSON.stringify([...entries, ...readStoredActivities()].slice(0, 40)),
    );
    window.dispatchEvent(new Event(ACTIVITY_CHANGE_EVENT));
  } catch (error) {
    console.error(
      'Could not save BakeBoard demo activity in this browser.',
      error,
    );
  }
}

export function resetDemoWorkspace(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const defaults = createSampleTasks();
    for (const key of [
      STORAGE_KEY,
      TEAM_STORAGE_KEY,
      REMOVED_STAFF_KEY,
      ACTIVITY_KEY,
      WORKSPACE_SETTINGS_KEY,
      LIBRARY_STORAGE_KEY,
      STATUS_SAMPLE_SEED_KEY,
      CALENDAR_SAMPLE_SEED_KEY,
      'bakeboard:demo:session:v1',
      'bakeboard-pickup-warning-minutes',
    ])
      window.localStorage.removeItem(key);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    window.localStorage.setItem(DEMO_SLATE_VERSION_KEY, DEMO_SLATE_VERSION);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    window.dispatchEvent(new Event(TEAM_CHANGE_EVENT));
    window.dispatchEvent(new Event(ACTIVITY_CHANGE_EVENT));
    window.dispatchEvent(new Event(LIBRARY_CHANGE_EVENT));
    window.dispatchEvent(new Event(WORKSPACE_SETTINGS_EVENT));
    return true;
  } catch (error) {
    console.error('Could not reset BakeBoard demo in this browser.', error);
    return false;
  }
}

export function initializeDemoSlate() {
  if (typeof window === 'undefined') return;
  try {
    if (
      window.localStorage.getItem(DEMO_SLATE_VERSION_KEY) !== DEMO_SLATE_VERSION
    )
      resetDemoWorkspace();
  } catch {
    /* The demo still works with in-memory defaults if storage is unavailable. */
  }
}

export function resetStoredTasks(): ProductionTask[] {
  resetDemoWorkspace();
  return readStoredTasks();
}

export function taskChangeEventName(): string {
  return CHANGE_EVENT;
}

const WORKSPACE_SETTINGS_KEY = 'bakeboard:demo:workspace-settings:v1';
const WORKSPACE_SETTINGS_EVENT = 'bakeboard:demo:workspace-settings-changed';
export function workspaceSettingsChangeEventName() {
  return WORKSPACE_SETTINGS_EVENT;
}
export function readStoredWorkspaceSettings(): WorkspaceSettings {
  const defaults = defaultWorkspaceSettings(sampleWorkspace);
  if (typeof window === 'undefined') return defaults;
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(WORKSPACE_SETTINGS_KEY) ?? 'null',
    );
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
      const legacy = Number(
        window.localStorage.getItem('bakeboard-pickup-warning-minutes'),
      );
      return {
        ...defaults,
        warningMinutes: [15, 30, 60, 120].includes(legacy)
          ? legacy
          : legacy === 90
            ? 120
            : defaults.warningMinutes,
      };
    }
    if (
      saved.id === PREVIOUS_SAMPLE_WORKSPACE_ID &&
      saved.name === 'Sweet Elevation Bakery'
    ) {
      saved.name = sampleWorkspace.name;
      saved.id = sampleWorkspace.id;
      try {
        window.localStorage.setItem(
          WORKSPACE_SETTINGS_KEY,
          JSON.stringify(saved),
        );
      } catch {
        /* Keep the renamed sample workspace in memory if storage is unavailable. */
      }
    }
    const migratedId =
      saved.id === LEGACY_WORKSPACE_ID &&
      typeof saved.name === 'string' &&
      saved.name.trim()
        ? workspaceIdForName(saved.name.trim())
        : defaults.id;
    if (saved.id === LEGACY_WORKSPACE_ID) {
      try {
        window.localStorage.setItem(
          WORKSPACE_SETTINGS_KEY,
          JSON.stringify({ ...saved, id: migratedId }),
        );
      } catch {
        /* Keep the migrated settings in memory if storage is unavailable. */
      }
    }
    const candidate = {
      ...defaults,
      ...saved,
      address: {
        ...defaults.address,
        ...(saved.address && typeof saved.address === 'object'
          ? saved.address
          : {}),
      },
      id:
        typeof saved.id === 'string' &&
        /^ws-[\p{L}\p{N}-]+$/u.test(saved.id) &&
        saved.id !== LEGACY_WORKSPACE_ID
          ? saved.id
          : migratedId,
      plan: defaults.plan,
    };
    // Validate fields independently so older or partially invalid records retain valid preferences.
    for (const key of [
      'name',
      'businessEmail',
      'businessPhone',
      'timeZone',
      'timeFormat',
      'weekStartsOn',
      'defaultCalendarView',
      'defaultPriority',
      'warningMinutes',
      'logoDataUrl',
    ] as const) {
      // Keep legacy names visible; the new length limit is enforced on every save.
      if (
        key === 'name' &&
        typeof candidate.name === 'string' &&
        candidate.name.trim() &&
        candidate.name.trim().length <= 100
      )
        continue;
      const probe = { ...defaults, [key]: candidate[key] };
      try {
        if (validateWorkspaceSettings(probe)[key])
          candidate[key] = defaults[key];
      } catch {
        candidate[key] = defaults[key];
      }
    }
    for (const key of Object.keys(
      defaults.address,
    ) as (keyof WorkspaceSettings['address'])[]) {
      if (
        typeof candidate.address[key] !== 'string' ||
        candidate.address[key].length > 160
      )
        candidate.address[key] = '';
    }
    candidate.appearance = appearanceForPreset(saved.appearance?.preset);
    candidate.reminders = {
      ...defaults.reminders,
      ...saved.reminders,
      types: { ...defaults.reminders.types, ...saved.reminders?.types },
      recipients: {
        ...defaults.reminders.recipients,
        ...saved.reminders?.recipients,
      },
    };
    if (Object.keys(reminderErrors(candidate.reminders)).length)
      candidate.reminders = defaults.reminders;
    candidate.initials = workspaceInitials(candidate.name);
    return candidate;
  } catch {
    return defaults;
  }
}
export function writeStoredWorkspaceSettings(
  role: DemoRole,
  actorId: string,
  value: WorkspaceSettings,
): {
  settings?: WorkspaceSettings;
  error?: string;
  errors?: Record<string, string>;
} {
  if (!canAccessWorkspaceSettings(role, actorId, readStoredEmployees()))
    return { error: 'Only the workspace Owner can change these settings.' };
  const initialErrors = validateWorkspaceSettings(value);
  if (Object.keys(initialErrors).length)
    return {
      error: 'Please fix the highlighted fields.',
      errors: initialErrors,
    };
  const current = readStoredWorkspaceSettings();
  const plan = readWorkspacePlan();
  if (
    (!hasPlanCapability(plan, 'personalization') &&
      JSON.stringify(value.appearance) !==
        JSON.stringify(current.appearance)) ||
    (!hasPlanCapability(plan, 'reminders') &&
      JSON.stringify(value.reminders) !== JSON.stringify(current.reminders))
  )
    return {
      error:
        'These preferences require BakeBoard Plus. Your saved premium preferences are kept.',
    };

  const next = {
    ...value,
    name: value.name.trim(),
    businessEmail: value.businessEmail.trim(),
    businessPhone: value.businessPhone.trim(),
    id:
      value.name.trim() === current.name
        ? current.id
        : workspaceIdForName(value.name.trim()),
    plan: current.plan,
    initials: workspaceInitials(value.name),
    appearance: appearanceForPreset(value.appearance.preset),
  };
  const errors = validateWorkspaceSettings(next);
  if (Object.keys(errors).length)
    return { error: 'Please fix the highlighted fields.', errors };
  const renamed = next.id !== current.id;
  const tasks = renamed
    ? readStoredTasks().map((task) =>
        task.workspaceId === current.id
          ? { ...task, workspaceId: next.id }
          : task,
      )
    : [];
  const library = renamed ? readStoredProductionLibrary() : null;
  const movedLibrary = library && {
    ...library,
    categories: library.categories.map((item) => ({
      ...item,
      workspaceId: item.workspaceId === current.id ? next.id : item.workspaceId,
    })),
    products: library.products.map((item) => ({
      ...item,
      workspaceId: item.workspaceId === current.id ? next.id : item.workspaceId,
    })),
    templates: library.templates.map((item) => ({
      ...item,
      workspaceId: item.workspaceId === current.id ? next.id : item.workspaceId,
    })),
  };
  const keys = renamed
    ? [WORKSPACE_SETTINGS_KEY, STORAGE_KEY, LIBRARY_STORAGE_KEY]
    : [WORKSPACE_SETTINGS_KEY];
  let previous: (string | null)[];
  try {
    previous = keys.map((key) => window.localStorage.getItem(key));
  } catch {
    return {
      error: 'Browser storage is unavailable. Please try again.',
    };
  }
  try {
    if (renamed) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      window.localStorage.setItem(
        LIBRARY_STORAGE_KEY,
        JSON.stringify(movedLibrary),
      );
    }
    window.localStorage.setItem(WORKSPACE_SETTINGS_KEY, JSON.stringify(next));
    if (renamed) {
      window.dispatchEvent(new Event(CHANGE_EVENT));
      window.dispatchEvent(new Event(LIBRARY_CHANGE_EVENT));
    }
    window.dispatchEvent(new Event(WORKSPACE_SETTINGS_EVENT));
    return { settings: next };
  } catch {
    keys.forEach((key, index) => {
      try {
        if (previous[index] === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, previous[index]!);
      } catch {
        /* A later reload will recover whichever records were saved. */
      }
    });
    return {
      error:
        'Changes could not be saved. Browser storage may be full or unavailable. Please try again.',
    };
  }
}

const LIBRARY_STORAGE_KEY = 'bakeboard:demo:production-library:v1';
const LIBRARY_CHANGE_EVENT = 'bakeboard:demo:production-library-changed';
export function libraryChangeEventName() {
  return LIBRARY_CHANGE_EVENT;
}
export function readWorkspacePlan(): WorkspacePlan {
  const actual = readStoredWorkspaceSettings().plan ?? 'Starter';
  if (typeof window === 'undefined') return actual;
  try {
    const session = JSON.parse(
      window.localStorage.getItem('bakeboard:demo:session:v1') ?? 'null',
    );
    return isWorkspacePlan(session?.planPreview) ? session.planPreview : actual;
  } catch {
    return actual;
  }
}
export function readStoredProductionLibrary(): ProductionLibrary {
  const workspaceId = readStoredWorkspaceSettings().id;
  const defaults = defaultProductionLibrary(workspaceId);
  if (typeof window === 'undefined') return defaults;
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(LIBRARY_STORAGE_KEY) ?? 'null',
    );
    if (!stored || typeof stored !== 'object') return defaults;
    let migrated = false;
    const saved = { ...stored };
    for (const kind of ['categories', 'products', 'templates'] as const) {
      if (!Array.isArray(saved[kind])) continue;
      saved[kind] = saved[kind].map((record: { workspaceId?: string }) => {
        if (
          record?.workspaceId !== LEGACY_WORKSPACE_ID &&
          record?.workspaceId !== PREVIOUS_SAMPLE_WORKSPACE_ID &&
          record?.workspaceId !== sampleWorkspace.id
        )
          return record;
        if (record.workspaceId === workspaceId) return record;
        migrated = true;
        return { ...record, workspaceId };
      });
    }
    if (migrated) {
      try {
        window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(saved));
      } catch {
        /* Continue with migrated records in memory if storage is unavailable. */
      }
    }
    const unique = <T extends { id: string; workspaceId: string }>(
      records: T[],
      validate: (record: T) => Record<string, string>,
    ) =>
      records.filter(
        (record, index, all) =>
          record &&
          record.workspaceId === workspaceId &&
          !Object.keys(validate(record)).length &&
          all.findIndex((other) => other?.id === record.id) === index,
      );
    const categories = Array.isArray(saved.categories)
      ? unique<ProductCategory>(saved.categories, validateCategory)
      : [...defaults.categories];
    if (!Array.isArray(saved.categories)) {
      for (const record of [
        ...(Array.isArray(saved.products) ? saved.products : []),
        ...(Array.isArray(saved.templates) ? saved.templates : []),
      ]) {
        if (
          validCategoryName(record?.category) &&
          !recordCategory(record, categories)
        )
          categories.push({
            id: record.categoryId ?? legacyCategoryId(record.category),
            workspaceId,
            name: record.category,
            description: '',
            active: true,
          });
      }
    }
    const deletedIds = Object.fromEntries(
      (['products', 'categories', 'templates'] as const).map((kind) => [
        kind,
        Array.isArray(saved.deletedIds?.[kind])
          ? [
              ...new Set<string>(
                saved.deletedIds[kind].filter(
                  (id: unknown) => typeof id === 'string',
                ),
              ),
            ]
          : [],
      ]),
    ) as Record<LibraryKind, string[]>;
    return {
      ...(saved.deletedIds ? { deletedIds } : {}),
      categories: categories.filter(
        (record) => !deletedIds.categories.includes(record.id),
      ),
      products: (Array.isArray(saved.products)
        ? unique<Product>(saved.products, validateProduct)
        : defaults.products
      ).filter((record) => !deletedIds.products.includes(record.id)),
      templates: (Array.isArray(saved.templates)
        ? unique<ChecklistTemplate>(saved.templates, validateTemplate)
        : defaults.templates
      ).filter((record) => !deletedIds.templates.includes(record.id)),
    };
  } catch {
    return defaults;
  }
}
function libraryAccess(
  role: DemoRole,
  actorId: string,
  kind: 'product' | 'template' | 'category',
) {
  if (
    !hasWorkspaceAccess(readStoredEmployees(), actorId) ||
    !hasCapability(role, 'viewProductionLibrary') ||
    !hasCapability(
      role,
      kind === 'product'
        ? 'manageProducts'
        : kind === 'category'
          ? 'manageCategories'
          : 'manageTemplates',
    )
  )
    return 'Your preview role cannot manage the Production Library.';
  if (
    kind === 'template' &&
    !hasPlanCapability(readWorkspacePlan(), 'templates')
  )
    return 'Checklist templates require BakeBoard Plus.';
  return null;
}
function persistLibrary(library: ProductionLibrary): {
  library?: ProductionLibrary;
  error?: string;
} {
  try {
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
    window.dispatchEvent(new Event(LIBRARY_CHANGE_EVENT));
    return { library };
  } catch {
    return {
      error:
        'The library could not be saved. Browser storage may be full or unavailable. Your saved library is unchanged.',
    };
  }
}
export function saveStoredProduct(
  role: DemoRole,
  actorId: string,
  product: Product,
): {
  library?: ProductionLibrary;
  error?: string;
  errors?: Record<string, string>;
} {
  const denied = libraryAccess(role, actorId, 'product');
  if (denied) return { error: denied };
  const library = readStoredProductionLibrary();
  if (library.deletedIds?.products?.includes(product.id))
    return {
      error:
        'This library item has been deleted. Close this editor and refresh the library.',
    };
  const errors = validateProduct(product, library.categories);
  const selectedCategory = recordCategory(product, library.categories);
  const previous = library.products.find((item) => item.id === product.id);
  if (
    selectedCategory &&
    !selectedCategory.active &&
    recordCategory(previous ?? {}, library.categories)?.id !==
      selectedCategory.id
  )
    errors.category = 'Choose an active category.';
  if (Object.keys(errors).length)
    return { error: 'Please fix the highlighted fields.', errors };
  const next = {
    ...product,
    categoryId: selectedCategory!.id,
    category: selectedCategory!.name,
    workspaceId: readStoredWorkspaceSettings().id,
    name: product.name.trim(),
    description: product.description.trim(),
  };
  if (
    library.products.some(
      (item) =>
        item.id !== next.id &&
        item.name.toLocaleLowerCase() === next.name.toLocaleLowerCase(),
    )
  )
    return {
      error: 'A product already uses this name.',
      errors: { name: 'Use a different product name.' },
    };
  return persistLibrary({
    ...library,
    products: library.products.some((item) => item.id === next.id)
      ? library.products.map((item) => (item.id === next.id ? next : item))
      : [...library.products, next],
  });
}
export function saveStoredChecklistTemplate(
  role: DemoRole,
  actorId: string,
  template: ChecklistTemplate,
): {
  library?: ProductionLibrary;
  error?: string;
  errors?: Record<string, string>;
} {
  const denied = libraryAccess(role, actorId, 'template');
  if (denied) return { error: denied };
  const library = readStoredProductionLibrary();
  if (library.deletedIds?.templates?.includes(template.id))
    return {
      error:
        'This library item has been deleted. Close this editor and refresh the library.',
    };
  const errors = validateTemplate(template, library.categories);
  const selectedCategory = recordCategory(template, library.categories);
  const previous = library.templates.find((item) => item.id === template.id);
  if (
    selectedCategory &&
    !selectedCategory.active &&
    recordCategory(previous ?? {}, library.categories)?.id !==
      selectedCategory.id
  )
    errors.category = 'Choose an active category.';
  if (Object.keys(errors).length)
    return { error: 'Please fix the highlighted fields.', errors };
  const next = {
    ...template,
    categoryId: selectedCategory?.id,
    category: selectedCategory?.name,
    workspaceId: readStoredWorkspaceSettings().id,
    name: template.name.trim(),
    description: template.description.trim(),
    steps: template.steps.map((step) => step.trim()),
  };
  if (
    library.templates.some(
      (item) =>
        item.id !== next.id &&
        item.name.toLocaleLowerCase() === next.name.toLocaleLowerCase(),
    )
  )
    return {
      error: 'A template already uses this name.',
      errors: { name: 'Use a different template name.' },
    };
  return persistLibrary({
    ...library,
    templates: library.templates.some((item) => item.id === next.id)
      ? library.templates.map((item) => (item.id === next.id ? next : item))
      : [...library.templates, next],
  });
}

export function applyStoredChecklistTemplate(
  role: DemoRole,
  actorId: string,
  task: ProductionTask | undefined,
  templateId: string,
  checklist: ProductionTask['checklist'],
  confirmedReplace = false,
): { checklist?: ProductionTask['checklist']; error?: string } {
  if (
    !hasWorkspaceAccess(readStoredEmployees(), actorId) ||
    !hasPlanCapability(readWorkspacePlan(), 'templates')
  )
    return {
      error: 'Checklist templates require an authorized Plus workspace.',
    };
  const current = task
    ? readStoredTasks().find((item) => item.id === task.id)
    : undefined;
  if (task && !current) return { error: 'This task is no longer available.' };
  const allowed = current
    ? hasCapability(role, 'editTasks') ||
      hasCapability(role, 'completeChecklist', {
        employeeId: actorId,
        task: current,
      })
    : hasCapability(role, 'createTasks');
  if (!allowed)
    return {
      error: 'Your preview role cannot apply a checklist to this task.',
    };
  const template = readStoredProductionLibrary().templates.find(
    (item) => item.id === templateId && item.active,
  );
  if (!template) return { error: 'This template is no longer available.' };
  if (checklist.length && !confirmedReplace)
    return { error: 'Confirm before replacing the existing checklist.' };
  return { checklist: copyTemplateSteps(template) };
}

export function saveStoredCategory(
  role: DemoRole,
  actorId: string,
  category: ProductCategory,
): {
  library?: ProductionLibrary;
  error?: string;
  errors?: Record<string, string>;
} {
  const denied = libraryAccess(role, actorId, 'category');
  if (denied) return { error: denied };
  const errors = validateCategory(category);
  if (Object.keys(errors).length)
    return { error: 'Please fix the highlighted fields.', errors };
  const library = readStoredProductionLibrary();
  if (library.deletedIds?.categories?.includes(category.id))
    return {
      error:
        'This category has been deleted. Close this editor and refresh the library.',
    };
  const next = {
    ...category,
    workspaceId: readStoredWorkspaceSettings().id,
    name: category.name.trim(),
    description: category.description.trim(),
  };
  if (
    library.categories.some(
      (item) =>
        item.id !== next.id &&
        item.name.toLocaleLowerCase() === next.name.toLocaleLowerCase(),
    )
  )
    return {
      error: 'A category already uses this name.',
      errors: { name: 'Use a different category name.' },
    };
  const categories = library.categories.some((item) => item.id === next.id)
    ? library.categories.map((item) => (item.id === next.id ? next : item))
    : [...library.categories, next];
  // Product/template labels move with their stable category ID; task snapshots are untouched.
  const update = <T extends { category?: string; categoryId?: string }>(
    record: T,
  ): T =>
    recordCategory(record, library.categories)?.id === next.id
      ? { ...record, categoryId: next.id, category: next.name }
      : record;
  return persistLibrary({
    ...library,
    categories,
    products: library.products.map(update),
    templates: library.templates.map(update),
  });
}

function libraryItemAccess(role: DemoRole, actorId: string, kind: LibraryKind) {
  return libraryAccess(
    role,
    actorId,
    kind === 'products'
      ? 'product'
      : kind === 'categories'
        ? 'category'
        : 'template',
  );
}

export function moveStoredLibraryItem(
  role: DemoRole,
  actorId: string,
  kind: LibraryKind,
  id: string,
  adjacentId: string,
): { library?: ProductionLibrary; error?: string } {
  const denied = libraryItemAccess(role, actorId, kind);
  if (denied) return { error: denied };
  const library = readStoredProductionLibrary();
  const items = [...library[kind]];
  const currentIndex = items.findIndex((item) => item.id === id);
  const adjacentIndex = items.findIndex((item) => item.id === adjacentId);
  if (currentIndex < 0 || adjacentIndex < 0)
    return { error: 'This library item is no longer available.' };
  [items[currentIndex], items[adjacentIndex]] = [
    items[adjacentIndex],
    items[currentIndex],
  ];
  return persistLibrary({ ...library, [kind]: items });
}

export function duplicateStoredLibraryItem(
  role: DemoRole,
  actorId: string,
  kind: LibraryKind,
  id: string,
): { library?: ProductionLibrary; error?: string } {
  const denied = libraryItemAccess(role, actorId, kind);
  if (denied) return { error: denied };
  const library = readStoredProductionLibrary();
  const source = library[kind].find((item) => item.id === id);
  if (!source) return { error: 'This library item is no longer available.' };
  const limit = kind === 'categories' ? 50 : 80;
  let count = 1;
  let name: string;
  do {
    const suffix = count === 1 ? ' copy' : ` copy ${count}`;
    name = `${source.name.slice(0, limit - suffix.length).trimEnd()}${suffix}`;
    count++;
  } while (
    library[kind].some(
      (item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    )
  );
  const copy = {
    ...source,
    id: `${kind === 'categories' ? 'category' : kind === 'products' ? 'product' : 'template'}-${crypto.randomUUID()}`,
    name,
  };
  // Copy only the library record. Task links and category contents are never duplicated.
  if (kind === 'templates') {
    return persistLibrary({
      ...library,
      templates: [
        ...library.templates,
        {
          ...(copy as ChecklistTemplate),
          steps: [...(source as ChecklistTemplate).steps],
        },
      ],
    });
  }
  if (kind === 'products')
    return persistLibrary({
      ...library,
      products: [...library.products, copy as Product],
    });
  return persistLibrary({
    ...library,
    categories: [...library.categories, copy as ProductCategory],
  });
}

export function deleteStoredLibraryItem(
  role: DemoRole,
  actorId: string,
  kind: LibraryKind,
  id: string,
  replacementCategoryId?: string,
): { library?: ProductionLibrary; error?: string } {
  const denied = libraryItemAccess(role, actorId, kind);
  if (denied) return { error: denied };
  const library = readStoredProductionLibrary();
  const source = library[kind].find((item) => item.id === id);
  if (!source) return { error: 'This library item is no longer available.' };
  const next: ProductionLibrary = {
    ...library,
    deletedIds: {
      ...library.deletedIds,
      [kind]: [...(library.deletedIds?.[kind] ?? []), id],
    },
  };
  const tasks = readStoredTasks();
  let nextTasks = tasks;
  if (kind === 'templates') {
    next.templates = library.templates.filter((item) => item.id !== id);
  } else if (kind === 'products') {
    next.products = library.products.filter((item) => item.id !== id);
    nextTasks = tasks.map((task) =>
      (task.productId ?? legacyProductId(task.category)) === id
        ? { ...task, productId: id, productName: source.name }
        : task,
    );
  } else {
    const linkedProducts = library.products.filter(
      (item) => recordCategory(item, library.categories)?.id === id,
    );
    const replacement = library.categories.find(
      (item) =>
        item.id === replacementCategoryId && item.id !== id && item.active,
    );
    if (linkedProducts.length && !replacement)
      return {
        error:
          'Choose another active category for the existing products before deleting this category.',
      };
    next.categories = library.categories.filter((item) => item.id !== id);
    next.products = library.products.map((item) =>
      linkedProducts.some((linked) => linked.id === item.id)
        ? { ...item, categoryId: replacement!.id, category: replacement!.name }
        : item,
    );
    next.templates = library.templates.map((item) =>
      recordCategory(item, library.categories)?.id === id
        ? { ...item, categoryId: undefined, category: undefined }
        : item,
    );
    nextTasks = tasks.map((task) =>
      recordCategory(task, library.categories)?.id === id
        ? {
            ...task,
            categoryId: id,
            category: source.name,
            productId: task.productId ?? legacyProductId(task.category),
            productName: taskProductName(task, library.products),
          }
        : task,
    );
  }
  // Save historical task snapshots and the library together; never delete production tasks.
  const taskChanged = nextTasks.some((task, index) => task !== tasks[index]);
  const entries: [string, string][] = [
    ...(taskChanged
      ? [[STORAGE_KEY, JSON.stringify(nextTasks)] as [string, string]]
      : []),
    [LIBRARY_STORAGE_KEY, JSON.stringify(next)],
  ];
  let previous: (string | null)[];
  try {
    previous = entries.map(([key]) => window.localStorage.getItem(key));
  } catch {
    return { error: 'Could not access browser storage. Nothing was deleted.' };
  }
  try {
    entries.forEach(([key, value]) => window.localStorage.setItem(key, value));
  } catch {
    try {
      entries.forEach(([key], index) => {
        if (previous[index] === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, previous[index]!);
      });
    } catch {
      /* Leave the error visible; never claim a failed deletion succeeded. */
    }
    return { error: 'Could not delete this library item. Please try again.' };
  }
  if (taskChanged) window.dispatchEvent(new Event(CHANGE_EVENT));
  window.dispatchEvent(new Event(LIBRARY_CHANGE_EVENT));
  return { library: next };
}
