'use client';
import { useProductionLibraryData } from './demo-session';
import { taskProductName } from '@/lib/production-library';

import { useEffect, useState } from 'react';
import {
  CheckCheck,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  ListChecks,
  LoaderCircle,
  TriangleAlert,
} from 'lucide-react';
import type { Employee, ProductionTask, Workspace } from '@/lib/types';
import {
  canManageTasks,
  canUpdateTask,
  demoRoles,
  isProductionOverdue,
  isInTodayWork,
  localDay,
  sortAssignedWork,
} from '@/lib/task-work';
import { useDemoTasks } from '@/lib/use-demo-tasks';
import { useDemoSession } from './demo-session';
import { TaskCard } from './task-card';
import { TaskDetails } from './task-details';
import { TaskForm } from './task-form';
import { useToast } from './toast-provider';
import { Avatar } from './ui';
import { useWorkspacePreferences } from './demo-session';

type TaskView = 'today' | 'active' | 'completed';

export function MyTasks({
  initialTasks,
  employees: initialEmployees,
  workspace,
  initialNow,
}: {
  initialTasks: ProductionTask[];
  employees: Employee[];
  workspace: Workspace;
  initialNow: number;
}) {
  const showToast = useToast();
  const preferences = useWorkspacePreferences();
  const demo = useDemoTasks(initialTasks);
  const { employee, role, employees = initialEmployees } = useDemoSession();
  const [view, setView] = useState<TaskView>('active');
  const [now, setNow] = useState(initialNow);
  const warningMinutes = preferences.warningMinutes;
  const [completedOpen, setCompletedOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusChecklist, setFocusChecklist] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const assigned = demo.tasks.filter((task) =>
    task.assigneeIds.includes(employee.id),
  );
  const active = sortAssignedWork(
    assigned.filter((task) => task.status !== 'completed'),
    now,
    warningMinutes,
    preferences.timeZone,
  );
  const completed = assigned
    .filter((task) => task.status === 'completed')
    .sort(
      (a, b) =>
        (b.completedAt ? Date.parse(b.completedAt) : 0) -
          (a.completedAt ? Date.parse(a.completedAt) : 0) ||
        a.deadline.localeCompare(b.deadline),
    );
  const visibleActive =
    view === 'today'
      ? active.filter((task) => isInTodayWork(task, now, preferences.timeZone))
      : active;
  const needsAttention = visibleActive.filter(
    (task) => task.status === 'todo' || task.status === 'progress',
  );
  const readyForCollection = visibleActive.filter(
    (task) => task.status === 'ready',
  );
  const overdueCount = active.filter((task) =>
    isProductionOverdue(task, now),
  ).length;
  const completedToday = completed.filter(
    (task) =>
      task.completedAt &&
      localDay(task.completedAt, preferences.timeZone) ===
        localDay(now, preferences.timeZone),
  ).length;
  const selected = assigned.find((task) => task.id === selectedId);
  const editing = canManageTasks(role)
    ? assigned.find((task) => task.id === editingId)
    : undefined;
  const summaries = [
    {
      label: 'Assigned Tasks',
      count: active.length,
      Icon: ListChecks,
      tone: 'total',
    },
    {
      label: 'In Progress',
      count: active.filter((task) => task.status === 'progress').length,
      Icon: LoaderCircle,
      tone: 'progress',
    },
    {
      label: 'Completed Today',
      count: completedToday,
      Icon: CircleCheck,
      tone: 'completed',
    },
  ];

  function select(task: ProductionTask, checklist = false) {
    setFocusChecklist(checklist);
    setSelectedId(task.id);
  }
  function update(task: ProductionTask) {
    const current = demo.tasks.find((item) => item.id === task.id);
    if (
      !current ||
      !current.assigneeIds.includes(employee.id) ||
      !canUpdateTask(role, employee.id, current)
    )
      return;
    demo.commit(demo.tasks.map((item) => (item.id === task.id ? task : item)));
  }
  function cards(tasks: ProductionTask[]) {
    return (
      <div className="my-task-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            employees={employees}
            now={now}
            warningMinutes={warningMinutes}
            personal
            onClick={() => select(task)}
            onChecklistClick={() => select(task, true)}
          />
        ))}
      </div>
    );
  }

  return (
    <main id="main" className="dashboard-main my-tasks-page">
      <div className="page-heading my-tasks-heading">
        <div>
          <h1>My Tasks</h1>
          <p className="page-description">
            See your assigned work and what needs your attention.
          </p>
        </div>
        <div className="my-tasks-identity">
          <Avatar employee={employee} />
          <div>
            <strong>{employee.name}</strong>
            <small>
              {demoRoles[employee.role]} · {demoRoles[role]} preview
            </small>
          </div>
        </div>
      </div>
      <section className="my-task-summaries" aria-label="Your task summary">
        {summaries.map(({ label, count, Icon, tone }) => (
          <div className={`stat-card stat-${tone}`} key={label}>
            <span className="stat-label">
              <span className="stat-icon">
                <Icon size={16} aria-hidden="true" />
              </span>
              {label}
            </span>
            <strong className="stat-value">{count}</strong>
          </div>
        ))}
      </section>
      <div className="my-task-controls">
        <div className="my-task-filters" role="group" aria-label="Task view">
          {(['today', 'active', 'completed'] as const).map((filter) => (
            <button
              type="button"
              key={filter}
              aria-pressed={view === filter}
              onClick={() => {
                setView(filter);
                if (filter === 'completed') setCompletedOpen(true);
              }}
            >
              {filter === 'today'
                ? 'Today'
                : filter === 'active'
                  ? 'All Active'
                  : 'Completed'}
            </button>
          ))}
        </div>
        {overdueCount > 0 && (
          <span className="my-task-overdue">
            <TriangleAlert size={14} aria-hidden="true" />
            {overdueCount} overdue
          </span>
        )}
      </div>
      {assigned.length === 0 ? (
        <EmptyTasks message="You don't have any assigned tasks yet." />
      ) : (
        <>
          {view !== 'completed' &&
            (visibleActive.length ? (
              <>
                <section
                  className="my-work-section"
                  aria-labelledby="my-attention-title"
                >
                  <div className="my-work-heading">
                    <h2 id="my-attention-title">Needs My Attention</h2>
                  </div>
                  {needsAttention.length ? (
                    cards(needsAttention)
                  ) : (
                    <EmptyTasks
                      compact
                      message="No production work needs your attention."
                    />
                  )}
                </section>
                <section
                  className="my-work-section my-ready-section"
                  aria-labelledby="my-ready-title"
                >
                  <div className="my-work-heading">
                    <h2 id="my-ready-title">Ready / Awaiting Collection</h2>
                  </div>
                  {readyForCollection.length ? (
                    cards(readyForCollection)
                  ) : (
                    <EmptyTasks
                      compact
                      message="No tasks are waiting for collection."
                    />
                  )}
                </section>
              </>
            ) : (
              <EmptyTasks
                message={
                  view === 'today'
                    ? "You're all caught up for today."
                    : 'You have no active assigned work.'
                }
              />
            ))}
          <section
            className="my-completed-section"
            aria-labelledby="my-completed-title"
          >
            <button
              type="button"
              className="my-completed-toggle"
              aria-expanded={completedOpen}
              aria-controls="my-completed-list"
              onClick={() => setCompletedOpen((open) => !open)}
            >
              <span>
                <CheckCheck size={17} aria-hidden="true" />
                <span id="my-completed-title">Completed</span>
                <small>{completed.length}</small>
              </span>
              <ChevronDown size={17} aria-hidden="true" />
            </button>
            <div id="my-completed-list" hidden={!completedOpen}>
              {completedOpen &&
                (completed.length ? (
                  <ul className="my-completed-rows">
                    {completed.map((task) => (
                      <li key={task.id}>
                        <CompletedTaskRow
                          task={task}
                          onSelect={() => select(task)}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyTasks message="Completed tasks will appear here." />
                ))}
            </div>
          </section>
        </>
      )}
      {selected && (
        <TaskDetails
          key={selected.id}
          task={selected}
          employees={employees}
          focusChecklist={focusChecklist}
          canUpdate={canUpdateTask(role, employee.id, selected)}
          onClose={() => setSelectedId(null)}
          onUpdate={update}
          onEdit={
            canManageTasks(role) ? () => setEditingId(selected.id) : undefined
          }
          onDelete={
            canManageTasks(role)
              ? () => {
                  demo.commit(
                    demo.tasks.filter((task) => task.id !== selected.id),
                  );
                  setSelectedId(null);
                  showToast('success', 'Task deleted.');
                }
              : undefined
          }
        />
      )}
      {editing && (
        <TaskForm
          task={editing}
          employees={employees}
          workspaceId={preferences.id || workspace.id}
          existingIds={demo.tasks.map((task) => task.id)}
          onClose={() => setEditingId(null)}
          onSave={(task) => {
            update(task);
            setEditingId(null);
            showToast('success', 'Task updated.');
          }}
        />
      )}
    </main>
  );
}

export function CompletedTaskRow({
  task,
  onSelect,
}: {
  task: ProductionTask;
  onSelect: () => void;
}) {
  const preferences = useWorkspacePreferences();
  const { products } = useProductionLibraryData();
  const done = task.checklist.filter((step) => step.done).length;
  return (
    <button
      type="button"
      className="my-completed-row"
      aria-label={`View completed task: ${task.title}`}
      onClick={onSelect}
    >
      <span className="my-completed-name">
        <strong>{task.title}</strong>
        <small>{taskProductName(task, products)}</small>
      </span>
      <span className="status-badge badge-completed">Completed</span>
      {task.checklist.length > 0 && (
        <span
          className="my-completed-checklist"
          aria-label={`${done} of ${task.checklist.length} checklist steps complete`}
        >
          <CheckCheck size={14} aria-hidden="true" />
          {done}/{task.checklist.length} steps
        </span>
      )}
      {task.completedAt && (
        <time className="my-completed-time" dateTime={task.completedAt}>
          {new Intl.DateTimeFormat(undefined, {
            timeZone: preferences.timeZone,
            hourCycle: preferences.timeFormat === '24h' ? 'h23' : 'h12',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date(task.completedAt))}
        </time>
      )}
    </button>
  );
}

function EmptyTasks({
  message,
  compact = false,
}: {
  message: string;
  compact?: boolean;
}) {
  return (
    <div className={`my-task-empty ${compact ? 'my-task-empty-compact' : ''}`}>
      <ClipboardCheck size={24} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
