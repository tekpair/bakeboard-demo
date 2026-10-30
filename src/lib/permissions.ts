import type { Employee, ProductionTask, WorkspaceRole } from './types';

export const demoRoles = {
  owner: 'Owner',
  manager: 'Manager',
  lead: 'Team Lead',
  employee: 'Employee',
  viewer: 'Viewer',
} as const;
export type DemoRole = WorkspaceRole;
export type Capability =
  | 'viewProductionLibrary'
  | 'manageCategories'
  | 'manageProducts'
  | 'manageTemplates'
  | 'viewWorkspaceSettings'
  | 'viewStaffSection'
  | 'viewManagementSection'
  | 'createTasks'
  | 'editTasks'
  | 'deleteTasks'
  | 'assignEmployees'
  | 'updateTaskStatus'
  | 'completeChecklist'
  | 'manageTeam'
  | 'removeStaff'
  | 'editEmployeeRoles'
  | 'editWorkspaceSettings';
const productionManagement: Capability[] = [
  'viewStaffSection',
  'createTasks',
  'editTasks',
  'deleteTasks',
  'assignEmployees',
  'updateTaskStatus',
  'completeChecklist',
];
const capabilities: Record<DemoRole, readonly Capability[]> = {
  owner: [
    ...productionManagement,
    'viewProductionLibrary',
    'manageProducts',
    'manageCategories',
    'manageTemplates',
    'manageTeam',
    'removeStaff',
    'viewManagementSection',
    'editEmployeeRoles',
    'editWorkspaceSettings',
    'viewWorkspaceSettings',
  ],
  manager: [
    ...productionManagement,
    'viewManagementSection',
    'viewProductionLibrary',
    'manageProducts',
    'manageCategories',
    'manageTemplates',
    'manageTeam',
    'removeStaff',
    'editEmployeeRoles',
  ],
  lead: productionManagement,
  employee: ['viewStaffSection', 'updateTaskStatus', 'completeChecklist'],
  viewer: [],
};
export const roleDescriptions: Record<DemoRole, string> = {
  owner: 'Manage production work, staff, roles and workspace configuration.',
  manager:
    'Manage production work and staff below Manager. Cannot assign Manager or Owner, or change Manager roles.',
  lead: 'Create, assign and manage production tasks. Cannot manage staff members or roles.',
  employee:
    'View the shared schedule and update statuses and checklists on assigned work.',
  viewer: 'Read-only access to workspace pages and task details.',
};

// UI simulation only. Real authorization must be enforced by a backend.
export function hasWorkspaceAccess(employees: Employee[], employeeId: string) {
  return employees.some((person) => person.id === employeeId);
}
export function hasCapability(
  role: DemoRole,
  capability: Capability,
  context?: { employeeId: string; task: ProductionTask },
) {
  if (!capabilities[role].includes(capability)) return false;
  if (
    role === 'employee' &&
    (capability === 'updateTaskStatus' || capability === 'completeChecklist')
  )
    return !!context && context.task.assigneeIds.includes(context.employeeId);
  return true;
}
export function canAccessWorkspaceSettings(
  role: DemoRole,
  actorId: string,
  employees: Employee[],
) {
  return (
    hasCapability(role, 'viewWorkspaceSettings') &&
    hasCapability(role, 'editWorkspaceSettings') &&
    employees.some((person) => person.id === actorId && person.role === 'owner')
  );
}
export function canManageTasks(role: DemoRole) {
  return (
    hasCapability(role, 'createTasks') &&
    hasCapability(role, 'editTasks') &&
    hasCapability(role, 'assignEmployees')
  );
}
export function canUpdateTask(
  role: DemoRole,
  employeeId: string,
  task: ProductionTask,
) {
  return (
    hasCapability(role, 'updateTaskStatus', { employeeId, task }) &&
    hasCapability(role, 'completeChecklist', { employeeId, task })
  );
}
export function canManageEmployee(role: DemoRole, employee?: Employee) {
  return (
    hasCapability(role, 'manageTeam') &&
    !(role === 'manager' && employee?.role === 'owner')
  );
}
export function canRemoveEmployee(
  role: DemoRole,
  actorId: string,
  employee: Employee,
) {
  return (
    hasCapability(role, 'removeStaff') &&
    employee.role !== 'owner' &&
    actorId !== employee.id &&
    !(role === 'manager' && employee.role === 'manager')
  );
}
export function permittedEmployeeRoles(role: DemoRole): DemoRole[] {
  if (!hasCapability(role, 'editEmployeeRoles')) return [];
  return (Object.keys(demoRoles) as DemoRole[]).filter(
    (value) =>
      value !== 'owner' && !(role === 'manager' && value === 'manager'),
  );
}
export function canEditEmployeeRole(role: DemoRole, employee?: Employee) {
  return (
    hasCapability(role, 'editEmployeeRoles') &&
    employee?.role !== 'owner' &&
    !(role === 'manager' && employee?.role === 'manager')
  );
}
export function validEmployeeEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}
// Repair older demos that allowed additional Owners without changing task IDs or associations.
export function normalizeTeamOwnership(
  employees: Employee[],
  originalOwner: Employee,
): Employee[] {
  const owner =
    employees.find(
      (person) => person.id === originalOwner.id && person.role === 'owner',
    ) ??
    employees.find((person) => person.role === 'owner') ??
    employees.find((person) => person.id === originalOwner.id) ??
    originalOwner;
  const team = employees.some((person) => person.id === owner.id)
    ? employees
    : [...employees, owner];
  return team.map((person) =>
    person.id === owner.id
      ? { ...person, role: 'owner', active: true }
      : person.role === 'owner'
        ? { ...person, role: 'manager' }
        : person,
  );
}
export function validateEmployeeChange(
  role: DemoRole,
  employees: Employee[],
  next: Employee,
): string | null {
  const previous = employees.find((person) => person.id === next.id);
  if (!canManageEmployee(role, previous))
    return 'Your preview role cannot manage this staff member.';
  if (previous && (next.email ?? '') !== (previous.email ?? ''))
    return 'Email addresses cannot be changed once a staff member is in the directory.';
  if (previous?.role === 'owner' && (next.role !== 'owner' || !next.active))
    return 'The Owner role is fixed and cannot be changed or deactivated.';
  if (
    previous &&
    next.role !== previous.role &&
    !canEditEmployeeRole(role, previous)
  )
    return 'Your preview role cannot change the selected staff role.';
  if (previous?.role !== 'owner' && next.role === 'owner')
    return 'Owner cannot be assigned to staff members.';
  if (
    (!previous || next.role !== previous.role) &&
    !permittedEmployeeRoles(role).includes(next.role)
  )
    return 'Your preview role cannot grant this role.';
  if (!next.id || !next.name.trim() || next.name.length > 120)
    return 'Enter a valid first and last name.';
  if (
    (!previous && !next.email?.trim()) ||
    (next.email && !validEmployeeEmail(next.email))
  )
    return 'Enter a valid email address.';
  if (
    next.email &&
    employees.some(
      (person) =>
        person.id !== next.id &&
        person.email?.toLowerCase() === next.email?.toLowerCase(),
    )
  )
    return 'A staff member already uses this email address.';
  const updated = previous
    ? employees.map((person) => (person.id === next.id ? next : person))
    : [...employees, next];
  if (
    updated.filter((person) => person.role === 'owner').length !== 1 ||
    !updated.some((person) => person.active && person.role === 'owner')
  )
    return 'The workspace must keep its single active Owner.';
  return null;
}
