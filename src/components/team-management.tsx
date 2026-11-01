'use client';
import { customerRelated } from '@/lib/task-production';

import { SlidePanel } from './slide-panel';
import { useState } from 'react';
import {
  ArrowRight,
  Mail,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import type { Employee, ProductionTask, WorkspaceRole } from '@/lib/types';
import {
  canManageEmployee,
  canRemoveEmployee,
  canEditEmployeeRole,
  canManageTasks,
  canUpdateTask,
  demoRoles,
  hasCapability,
  permittedEmployeeRoles,
  roleDescriptions,
  validateEmployeeChange,
  validEmployeeEmail,
} from '@/lib/permissions';
import { useDemoTasks } from '@/lib/use-demo-tasks';
import { useWorkspacePreferences } from './demo-session';
import { useDemoSession } from './demo-session';
import { Avatar } from './ui';
import { TaskDetails } from './task-details';
import { TaskForm } from './task-form';
import { useToast } from './toast-provider';

const statusLabels = {
  todo: 'To Do',
  progress: 'In Progress',
  ready: 'Ready',
  completed: 'Completed',
};
export function productionWorkload(
  tasks: ProductionTask[],
  employeeId: string,
) {
  return tasks.filter(
    (task) =>
      task.assigneeIds.includes(employeeId) &&
      (task.status === 'todo' || task.status === 'progress'),
  );
}
export function TeamManagement({
  initialTasks,
}: {
  initialTasks: ProductionTask[];
}) {
  const showToast = useToast();
  const preferences = useWorkspacePreferences();
  const session = useDemoSession();
  const { employees, role } = session;
  const demo = useDemoTasks(initialTasks);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null | undefined>(
    undefined,
  );
  const [taskId, setTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState(false);
  const selected = employees.find((person) => person.id === selectedId);
  const editing = employees.find((person) => person.id === editingId);
  const editingAllowed =
    editingId !== undefined &&
    (editingId === null || !!editing) &&
    canManageEmployee(role, editing);
  const task = demo.tasks.find((item) => item.id === taskId);
  const pendingInvites = employees.filter(
    (person) => person.invitation?.status === 'pending',
  );
  const filtered = employees.filter(
    (person) =>
      (!query.trim() ||
        `${person.name} ${person.email ?? ''}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())) &&
      (!roleFilter || person.role === roleFilter),
  );
  function save(person: Employee) {
    const error = session.saveEmployee(person);
    if (error) return error;
    setEditingId(undefined);
    setSelectedId(person.id);
    showToast(
      'success',
      `${person.name} ${editing ? 'updated' : 'added to staff and pending invites'}.`,
    );
    return null;
  }
  function updateTask(next: ProductionTask) {
    const current = demo.tasks.find((item) => item.id === next.id);
    if (!current || !canUpdateTask(role, session.employee.id, current)) return;
    demo.commit(demo.tasks.map((item) => (item.id === next.id ? next : item)));
  }
  return (
    <main id="main" className="dashboard-main team-page">
      <header className="page-heading team-page-heading">
        <div>
          <h1>Staff Management</h1>
          <p>Manage your bakery staff and workspace roles.</p>
        </div>
        {hasCapability(role, 'manageTeam') && (
          <button
            className="button button-primary"
            onClick={() => {
              setEditingId(null);
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Add Staff Member
          </button>
        )}
      </header>
      <div className="team-summary">
        <span>
          <Users size={16} aria-hidden="true" />
          <strong>{employees.length}</strong> staff{' '}
          {employees.length === 1 ? 'member' : 'members'}
        </span>
      </div>
      <section
        className="team-directory"
        aria-labelledby="staff-directory-title"
      >
        <div className="team-directory-heading">
          <h2 id="staff-directory-title">Staff directory</h2>
          {!hasCapability(role, 'manageTeam') && (
            <span className="team-readonly">
              View only · {demoRoles[role]} preview
            </span>
          )}
        </div>
        <div className="team-filters">
          <label className="team-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search staff members"
              placeholder="Search staff members"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            aria-label="Filter team by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">All roles</option>
            {Object.entries(demoRoles).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {filtered.length ? (
          <div className="team-member-list">
            {filtered.map((person) => {
              const count = productionWorkload(demo.tasks, person.id).length;
              return (
                <button
                  key={person.id}
                  className="team-member-row"
                  aria-label={`View ${person.name}, ${demoRoles[person.role]}, ${count} production tasks`}
                  onClick={() => {
                    setSelectedId(person.id);
                  }}
                >
                  <span className="team-member-identity">
                    <Avatar employee={person} />
                    <span>
                      <strong>{person.name}</strong>
                      <small>{demoRoles[person.role]}</small>
                      {person.email && (
                        <small className="team-member-email">
                          {person.email}
                        </small>
                      )}
                    </span>
                  </span>
                  <span className="team-workload">
                    <strong>{count}</strong> in production
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="team-empty">
            <Users size={23} aria-hidden="true" />
            <h3>
              {!employees.length
                ? 'No staff members yet'
                : 'No matching staff members'}
            </h3>
            <p>
              {!employees.length
                ? 'Add your bakery staff to start assigning production work.'
                : 'Try another name, email or role.'}
            </p>
            {employees.length > 0 && (
              <button
                className="button button-outline"
                onClick={() => {
                  setQuery('');
                  setRoleFilter('');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>
      <section
        className="team-directory team-invites"
        aria-labelledby="pending-invites-title"
      >
        <div className="team-directory-heading team-invites-heading">
          <div>
            <h2 id="pending-invites-title">
              Pending invites{' '}
              <span className="team-invite-count">{pendingInvites.length}</span>
            </h2>
            <p className="demo-inline-note">
              Demo preview · No invitation email is sent.
            </p>
          </div>
        </div>
        {pendingInvites.length ? (
          <ul className="team-invite-list">
            {[...pendingInvites]
              .sort(
                (a, b) =>
                  Date.parse(b.invitation!.createdAt) -
                  Date.parse(a.invitation!.createdAt),
              )
              .map((person) => (
                <li key={person.invitation!.id}>
                  <div className="team-invite-person">
                    <Avatar employee={person} />
                    <div>
                      <strong>{person.name}</strong>
                      <span className="team-member-email">{person.email}</span>
                    </div>
                  </div>
                  <div className="team-invite-meta">
                    <span className="team-invite-role">
                      {demoRoles[person.role]}
                    </span>
                    <span className="team-invite-by">
                      <span>Invited by</span>
                      <span>
                        {employees.find(
                          (inviter) =>
                            inviter.id === person.invitation!.invitedBy?.id,
                        )?.name ??
                          person.invitation!.invitedBy?.name ??
                          'Not recorded'}
                      </span>
                    </span>
                    <span className="team-invite-created">
                      <span>Created</span>
                      <time dateTime={person.invitation!.createdAt}>
                        {new Intl.DateTimeFormat(undefined, {
                          timeZone: preferences.timeZone,
                          hourCycle:
                            preferences.timeFormat === '24h' ? 'h23' : 'h12',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(new Date(person.invitation!.createdAt))}
                      </time>
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <div className="team-invites-empty">No pending invites.</div>
        )}
      </section>
      {selected && !task && !editingAllowed && (
        <TeamMemberDetails
          employee={selected}
          tasks={demo.tasks}
          canEdit={canManageEmployee(role, selected)}
          onEdit={() => setEditingId(selected.id)}
          onOpenTask={setTaskId}
          onClose={() => setSelectedId(null)}
          onRemove={
            canRemoveEmployee(role, session.employee.id, selected)
              ? () => {
                  const error = session.removeEmployee(selected.id);
                  if (error) return error;
                  showToast(
                    'success',
                    `${selected.name} was permanently removed from the workspace.`,
                  );
                  setSelectedId(null);
                  return null;
                }
              : undefined
          }
        />
      )}
      {editingAllowed && (
        <TeamMemberForm
          key={editingId ?? 'new'}
          employee={editing}
          employees={employees}
          role={role}
          onSave={save}
          onClose={() => setEditingId(undefined)}
        />
      )}
      {task && (!editingTask || !canManageTasks(role)) && (
        <TaskDetails
          task={task}
          employees={employees}
          canUpdate={canUpdateTask(role, session.employee.id, task)}
          onUpdate={updateTask}
          onClose={() => setTaskId(null)}
          onEdit={canManageTasks(role) ? () => setEditingTask(true) : undefined}
        />
      )}
      {task && editingTask && canManageTasks(role) && (
        <TaskForm
          task={task}
          employees={employees}
          workspaceId={task.workspaceId}
          existingIds={demo.tasks.map((item) => item.id)}
          onSave={(next) => {
            if (!canManageTasks(role)) return;
            demo.commit(
              demo.tasks.map((item) => (item.id === next.id ? next : item)),
            );
            setEditingTask(false);
            showToast('success', 'Task updated.');
          }}
          onClose={() => setEditingTask(false)}
        />
      )}
    </main>
  );
}

function TeamPanel(props: React.ComponentProps<typeof SlidePanel>) {
  return <SlidePanel {...props} closeLabel="Close staff member panel" />;
}

function TeamMemberDetails({
  employee,
  tasks,
  canEdit,
  onEdit,
  onOpenTask,
  onClose,
  onRemove,
}: {
  employee: Employee;
  tasks: ProductionTask[];
  canEdit: boolean;
  onEdit: () => void;
  onOpenTask: (id: string) => void;
  onClose: () => void;
  onRemove?: () => string | null;
}) {
  const preferences = useWorkspacePreferences();
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const [confirmationName, setConfirmationName] = useState('');
  const [removalError, setRemovalError] = useState('');
  const assigned = tasks.filter((task) =>
    task.assigneeIds.includes(employee.id),
  );
  const groups = [
    {
      label: 'Current production work',
      tasks: productionWorkload(tasks, employee.id),
    },
    {
      label: 'Ready',
      tasks: assigned.filter((task) => task.status === 'ready'),
    },
    {
      label: 'Completed work',
      tasks: assigned.filter((task) => task.status === 'completed'),
    },
  ];
  return (
    <TeamPanel title={employee.name} label="STAFF MEMBER" onClose={onClose}>
      <div className="team-detail-identity">
        <Avatar employee={employee} />
        <div>
          <strong>{demoRoles[employee.role]}</strong>
          {employee.email && (
            <span className="team-detail-email">{employee.email}</span>
          )}
        </div>
        {canEdit && (
          <button className="button button-outline" onClick={onEdit}>
            <Pencil size={14} />
            Edit member
          </button>
        )}
      </div>
      {!employee.active && (
        <p className="team-inactive-note">
          Inactive members keep their task history and existing assignments.
          They cannot receive new assignments.
        </p>
      )}
      <section className="team-role-description">
        <h3>Role access</h3>
        <p>{roleDescriptions[employee.role]}</p>
      </section>
      {groups.map((group) => (
        <section key={group.label} className="team-work-section">
          <h3>
            {group.label}
            <span>{group.tasks.length}</span>
          </h3>
          {group.tasks.length ? (
            <div className="team-task-list">
              {[...group.tasks]
                .sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
                .map((task) => (
                  <button key={task.id} onClick={() => onOpenTask(task.id)}>
                    <span>
                      <strong>{task.title}</strong>
                      <small>
                        {new Intl.DateTimeFormat(undefined, {
                          timeZone: preferences.timeZone,
                          hourCycle:
                            preferences.timeFormat === '24h' ? 'h23' : 'h12',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(new Date(task.deadline))}
                        {customerRelated(task) && task.customer
                          ? ` · ${task.customer}`
                          : ''}
                      </small>
                    </span>
                    <span className={`status-badge badge-${task.status}`}>
                      {statusLabels[task.status]}
                    </span>
                  </button>
                ))}
            </div>
          ) : (
            <p className="team-work-empty">
              {group.label === 'Current production work'
                ? 'No assigned work in production.'
                : group.label === 'Ready'
                  ? 'No Ready tasks.'
                  : 'No completed work yet.'}
            </p>
          )}
        </section>
      ))}
      {onRemove && (
        <section className="staff-removal-section">
          {!confirmRemoval ? (
            <button
              type="button"
              className="button staff-remove-button"
              onClick={() => setConfirmRemoval(true)}
            >
              <Trash2 size={15} aria-hidden="true" />
              Remove staff member
            </button>
          ) : (
            <div className="staff-removal-confirm">
              <h3>Permanently remove {employee.name}?</h3>
              <p>
                Their workspace membership will be revoked, and all activity
                history will be permanently deleted. This action cannot be
                undone.
              </p>
              <label className="form-field">
                Type {employee.name} to confirm
                <input
                  aria-label="Staff name to confirm removal"
                  value={confirmationName}
                  autoComplete="off"
                  onChange={(event) => setConfirmationName(event.target.value)}
                />
              </label>
              {removalError && (
                <p className="form-error" role="alert">
                  {removalError}
                </p>
              )}
              <div className="staff-removal-actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => {
                    setConfirmRemoval(false);
                    setConfirmationName('');
                    setRemovalError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button staff-remove-button staff-remove-confirm-button"
                  disabled={confirmationName.trim() !== employee.name}
                  onClick={() => setRemovalError(onRemove() ?? '')}
                >
                  Permanently remove
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </TeamPanel>
  );
}

function TeamMemberForm({
  employee,
  employees,
  role,
  onSave,
  onClose,
}: {
  employee?: Employee;
  employees: Employee[];
  role: WorkspaceRole;
  onSave: (employee: Employee) => string | null;
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState(
    employee?.name.split(' ')[0] ?? '',
  );
  const [lastName, setLastName] = useState(
    employee?.name.split(' ').slice(1).join(' ') ?? '',
  );
  const [assignedRole, setAssignedRole] = useState<WorkspaceRole>(
    employee?.role ?? 'employee',
  );
  const [email, setEmail] = useState(employee?.email ?? '');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const roles =
    employee && !canEditEmployeeRole(role, employee)
      ? [employee.role]
      : permittedEmployeeRoles(role);
  const emailInvalid =
    (!employee && !email.trim()) ||
    (!!email.trim() && !validEmployeeEmail(email.trim()));
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!firstName.trim() || !lastName.trim()) {
      setError('Enter a first and last name.');
      return;
    }
    if (emailInvalid) {
      setError('Enter a valid email address.');
      return;
    }
    const name = `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ');
    const next: Employee = {
      id: employee?.id ?? `staff-${crypto.randomUUID()}`,
      name,
      ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
      initials: `${firstName.trim()[0]}${lastName.trim()[0]}`.toUpperCase(),
      color:
        employee?.color ?? ['sage', 'caramel', 'blush'][employees.length % 3],
      photoDataUrl: employee?.photoDataUrl,
      role: assignedRole,
      active: employee?.active ?? true,
      invitation: employee?.invitation,
    };
    const invalid = validateEmployeeChange(role, employees, next);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(onSave(next) ?? '');
  }
  return (
    <TeamPanel
      title={employee ? 'Edit staff member' : 'Add Staff Member'}
      className="library-editor-panel staff-editor-panel"
      label="STAFF MANAGEMENT"
      onClose={onClose}
    >
      <form
        className="team-member-form library-form"
        noValidate
        onSubmit={submit}
        onChange={() => {
          setError('');
        }}
      >
        <div className="library-form-fields staff-form-fields">
          <div className="task-form">
            <label className="form-field">
              <span className="task-field-label">
                <UserRound size={15} aria-hidden="true" />
                First name
              </span>
              <input
                autoComplete="given-name"
                maxLength={60}
                required
                value={firstName}
                aria-invalid={submitted && !firstName.trim()}
                className={
                  submitted && !firstName.trim() ? 'field-invalid' : undefined
                }
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>
            <label className="form-field">
              <span className="task-field-label">
                <UserRound size={15} aria-hidden="true" />
                Last name
              </span>
              <input
                autoComplete="family-name"
                maxLength={60}
                required
                value={lastName}
                aria-invalid={submitted && !lastName.trim()}
                className={
                  submitted && !lastName.trim() ? 'field-invalid' : undefined
                }
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>
            <label className="form-field form-field-full">
              <span className="task-field-label">
                <Mail size={15} aria-hidden="true" />
                Email address
              </span>
              <input
                type="email"
                readOnly={!!employee}
                placeholder={employee && !email ? 'Not provided' : undefined}
                autoComplete="email"
                maxLength={254}
                required={!employee}
                value={email}
                aria-invalid={submitted && emailInvalid}
                className={
                  submitted && emailInvalid ? 'field-invalid' : undefined
                }
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="form-field form-field-full">
              <span className="task-field-label">
                <ShieldCheck size={15} aria-hidden="true" />
                Assigned role
              </span>
              <select
                aria-label="Assigned role"
                aria-describedby="team-role-help"
                value={assignedRole}
                disabled={!canEditEmployeeRole(role, employee)}
                onChange={(event) =>
                  setAssignedRole(event.target.value as WorkspaceRole)
                }
              >
                {roles.map((value) => (
                  <option key={value} value={value}>
                    {demoRoles[value]}
                  </option>
                ))}
              </select>
              <span id="team-role-help" className="team-field-help">
                {roleDescriptions[assignedRole]}
              </span>
            </label>
          </div>
          <p className="demo-inline-note team-form-demo-note">
            Demo preview · Staff changes stay in this browser.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <footer className="task-form-footer team-form-footer">
          <button
            type="button"
            className="button button-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="button button-primary">
            {employee ? (
              <Save size={15} aria-hidden="true" />
            ) : (
              <UserPlus size={15} aria-hidden="true" />
            )}
            {employee ? 'Save changes' : 'Add member'}
          </button>
        </footer>
      </form>
    </TeamPanel>
  );
}
