'use client';
import {
  customerRelated,
  pickupDate,
  productionSummary,
} from '@/lib/task-production';
import { useProductionLibraryData } from './demo-session';
import { taskProductName } from '@/lib/production-library';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CakeSlice,
  CheckCheck,
  CircleCheck,
  LoaderCircle,
  ListChecks,
  PackageCheck,
  Plus,
  ShoppingBag,
  TriangleAlert,
} from 'lucide-react';
import type {
  Activity,
  Employee,
  ProductionTask,
  Status,
  Workspace,
} from '@/lib/types';
import { useDemoTasks } from '@/lib/use-demo-tasks';
import { Avatar } from '@/components/ui';
import { CurrentDayLabel } from '@/components/current-day-label';
import { TaskDetails } from '@/components/task-details';
import { TaskForm } from '@/components/task-form';
import { SlidePanel } from '@/components/slide-panel';
import { useToast } from './toast-provider';
import { productionDay, productionTime } from '@/lib/production-dates';
import { deadlineWarningOptions } from '@/lib/workspace-settings';
import { canAccessWorkspaceSettings } from '@/lib/permissions';
import { useWorkspacePreferences, useDemoSession } from './demo-session';
import { taskStaff } from '@/lib/staff-history';
import { useDemoActivity } from '@/lib/use-demo-activity';
import {
  canManageTasks,
  canUpdateTask,
  isProductionOverdue,
  isAwaitingCollection,
  localDay,
} from '@/lib/task-work';

const statusLabels: Record<Status, string> = {
  todo: 'To do',
  progress: 'In progress',
  ready: 'Ready',
  completed: 'Completed',
};

export function OverviewDashboard({
  initialTasks,
  employees: initialEmployees,
  activities: initialActivities,
  workspace,
  initialNow,
}: {
  initialTasks: ProductionTask[];
  employees: Employee[];
  activities: Activity[];
  workspace: Workspace;
  initialNow: number;
}) {
  const showToast = useToast();
  const demo = useDemoTasks(initialTasks);
  const activities = useDemoActivity(initialActivities);
  const { products } = useProductionLibraryData();
  const preferences = useWorkspacePreferences();
  const session = useDemoSession();
  const employees = session.employees ?? initialEmployees;
  const canManage = canManageTasks(session.role);
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() =>
    productionDay(initialNow, preferences.timeZone),
  );
  const dateManuallySelected = useRef(false);
  const warningMinutes = preferences.warningMinutes;
  const [warningError, setWarningError] = useState('');
  const [now, setNow] = useState(initialNow);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const tasks = demo.tasks;
  const recentActivities = activities.filter((activity) => {
    const occurredAt = Date.parse(activity.occurredAt ?? '');
    return (
      Number.isFinite(occurredAt) &&
      occurredAt <= now &&
      now - occurredAt < 15 * 60_000
    );
  });
  useEffect(() => {
    const refresh = () => {
      const current = Date.now();
      setNow(current);
      if (!dateManuallySelected.current)
        setSelectedDate(productionDay(current, preferences.timeZone));
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.clearInterval(timer);
    };
  }, [preferences.timeZone]);

  const dayTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          localDay(task.deadline, preferences.timeZone) === selectedDate,
      ),
    [tasks, selectedDate, preferences.timeZone],
  );
  const completedCount = dayTasks.filter(
    (task) => task.status === 'completed',
  ).length;
  const overdueTasks = dayTasks.filter((task) =>
    isProductionOverdue(task, now),
  );
  const overdueIds = new Set(overdueTasks.map((task) => task.id));
  const pickups = tasks.filter(
    (task) =>
      pickupDate(task) &&
      localDay(pickupDate(task)!, preferences.timeZone) === selectedDate &&
      task.status !== 'completed',
  );
  const pickupAttention = pickups.filter(
    (task) => task.status !== 'ready' && Date.parse(pickupDate(task)!) < now,
  );
  const readyForCollection = pickups.filter((task) => task.status === 'ready');
  const upcoming = pickups.filter(
    (task) => task.status !== 'ready' && Date.parse(pickupDate(task)!) >= now,
  );
  const production = [...dayTasks].sort(
    (a, b) =>
      Number(a.status === 'completed') - Number(b.status === 'completed') ||
      a.deadline.localeCompare(b.deadline),
  );
  const byPickup = (a: ProductionTask, b: ProductionTask) =>
    (pickupDate(a) ?? '').localeCompare(pickupDate(b) ?? '');
  const stepsDone = dayTasks.reduce(
    (total, task) => total + task.checklist.filter((step) => step.done).length,
    0,
  );
  const stepsTotal = dayTasks.reduce(
    (total, task) => total + task.checklist.length,
    0,
  );
  const stepsPercent = stepsTotal
    ? Math.round((stepsDone / stepsTotal) * 100)
    : 0;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const stats: {
    label: string;
    value: number;
    Icon: typeof ListChecks;
    href: string;
    tone: string;
  }[] = [
    {
      label:
        selectedDate === productionDay(now, preferences.timeZone)
          ? 'Today’s tasks'
          : 'Tasks on this day',
      value: dayTasks.length,
      Icon: ListChecks,
      href: `/demo/board?date=${selectedDate}`,
      tone: 'total',
    },
    {
      label: 'In progress',
      value: dayTasks.filter((task) => task.status === 'progress').length,
      Icon: LoaderCircle,
      href: `/demo/board?date=${selectedDate}&status=progress`,
      tone: 'progress',
    },
    {
      label: 'Ready',
      value: dayTasks.filter((task) => task.status === 'ready').length,
      Icon: PackageCheck,
      href: `/demo/board?date=${selectedDate}&status=ready`,
      tone: 'ready',
    },
    {
      label: 'Completed',
      value: completedCount,
      Icon: CircleCheck,
      href: `/demo/board?date=${selectedDate}&status=completed`,
      tone: 'completed',
    },
    {
      label: 'Overdue',
      value: overdueTasks.length,
      Icon: TriangleAlert,
      href: `/demo/board?date=${selectedDate}&attention=overdue`,
      tone: 'overdue',
    },
  ];

  function saveTask(task: ProductionTask) {
    if (!canUpdateTask(session.role, session.employee.id, task)) return;
    demo.commit(
      tasks.map((current) => (current.id === task.id ? task : current)),
    );
  }
  function createTask(task: ProductionTask) {
    if (!canManage) return;
    demo.commit([...tasks, task]);
    setAddingTask(false);
    showToast('success', 'Task created.');
  }
  function taskHrefFor(activity: Activity) {
    if (activity.taskId)
      return tasks.find((task) => task.id === activity.taskId)?.id ?? null;
    return tasks.find((task) => task.title === activity.task)?.id ?? null;
  }
  function activityTime(activity: Activity) {
    if (
      !activity.occurredAt ||
      !Number.isFinite(Date.parse(activity.occurredAt))
    )
      return activity.time;
    const minutes = Math.max(
      0,
      Math.floor((now - Date.parse(activity.occurredAt)) / 60_000),
    );
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  function activityRows(items: Activity[]) {
    return items.map((activity) => {
      const employee = employees.find(
        (item) => item.id === activity.employeeId,
      );
      const taskId = taskHrefFor(activity);
      const taskTitle =
        tasks.find((task) => task.id === taskId)?.title ?? activity.task;
      const summary = (
        <>
          <strong>{employee?.name.split(' ')[0] ?? 'Team'}</strong>{' '}
          {activity.action} <span>— {taskTitle}</span>
        </>
      );
      return (
        <li className="activity-item" key={activity.id}>
          {employee && <Avatar employee={employee} small />}
          <div>
            {taskId ? (
              <button
                className="activity-link"
                type="button"
                onClick={() => {
                  setActivityPanelOpen(false);
                  setSelectedTaskId(taskId);
                }}
              >
                {summary}
              </button>
            ) : (
              <p>{summary}</p>
            )}
            <span className="activity-time">{activityTime(activity)}</span>
          </div>
        </li>
      );
    });
  }

  return (
    <main id="main" className="dashboard-main">
      <div className="page-heading overview-page-heading">
        <div>
          <CurrentDayLabel
            date={selectedDate}
            greetingName={session.employee.name.split(' ')[0]}
          />
          <p className="page-description">
            Keep customer orders, production, pickups, and team progress in
            view.
          </p>
        </div>
        <label className="overview-date-picker">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              dateManuallySelected.current = true;
              setSelectedDate(event.target.value);
            }}
            aria-label="Choose production date"
          />
        </label>
      </div>
      <section className="stats-grid" aria-label="Production summary">
        {stats.map((stat) => (
          <Link
            className={`stat-card stat-${stat.tone} ${stat.tone === 'overdue' && stat.value === 0 ? 'stat-overdue-clear' : ''}`}
            key={stat.label}
            href={stat.href}
            aria-label={`${stat.label}: ${stat.value}. View matching production tasks.`}
          >
            <span className="stat-label">
              <span className="stat-icon">
                <stat.Icon size={16} aria-hidden="true" />
              </span>
              <span>{stat.label}</span>
            </span>
            <strong className="stat-value">{stat.value}</strong>
          </Link>
        ))}
      </section>
      <div className="overview-grid">
        <section
          className="panel today-panel"
          aria-labelledby="production-heading"
        >
          <div className="panel-heading">
            <div>
              <h2 id="production-heading">
                <CakeSlice size={17} aria-hidden="true" />
                Today’s production
              </h2>
            </div>
            <div className="overview-production-actions">
              {canManage && (
                <button
                  className="overview-add-task"
                  type="button"
                  onClick={() => setAddingTask(true)}
                >
                  <Plus size={14} />
                  Add Task
                </button>
              )}
              <Link href="/demo/board" className="overview-board-link">
                Open Production Board <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="production-table">
            <div className="table-labels" aria-hidden="true">
              <span>Task / customer</span>
              <span>Status</span>
              <span>Production due</span>
              <span>Assigned</span>
            </div>
            <ul className="production-list">
              {production.map((task) => (
                <li
                  className={`production-row ${task.status === 'completed' ? 'production-completed' : ''}`}
                  key={task.id}
                >
                  <div className="production-name">
                    <button
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      {task.title}
                    </button>
                    <p>
                      {productionSummary(task) &&
                      task.productId &&
                      taskProductName(task, products) !== task.category
                        ? `${taskProductName(task, products)} · `
                        : ''}
                      {productionSummary(task)
                        ? `${productionSummary(task)} · `
                        : `${taskProductName(task, products)} · `}
                      {customerRelated(task) ? task.customer : ''}
                    </p>
                  </div>
                  <div className="production-status">
                    <span className={`status-badge badge-${task.status}`}>
                      {statusLabels[task.status]}
                    </span>
                    {overdueIds.has(task.id) && (
                      <span className="overdue-indicator">
                        <TriangleAlert size={11} aria-hidden="true" />
                        Overdue
                      </span>
                    )}
                  </div>
                  <time className="table-time" dateTime={task.deadline}>
                    {productionTime(
                      task.deadline,
                      preferences.timeZone,
                      preferences.timeFormat,
                    )}
                  </time>
                  <div className="avatar-stack">
                    {taskStaff(task, employees).map((employee) => (
                      <Avatar key={employee.id} employee={employee} small />
                    ))}
                  </div>
                </li>
              ))}
              {production.length === 0 && (
                <li className="overview-empty">
                  No production tasks for this date.
                </li>
              )}
            </ul>
          </div>
          <div className="production-progress">
            <div>
              <label htmlFor="daily-progress">
                <CheckCheck size={15} aria-hidden="true" />
                Production checklist progress
              </label>
              <span className="progress-summary">
                <strong>{stepsPercent}%</strong>
              </span>
            </div>
            <progress
              id="daily-progress"
              value={stepsDone}
              max={stepsTotal || 1}
              aria-label={`${stepsPercent}% of checklist steps completed`}
            />
          </div>
        </section>
        <aside className="overview-side">
          <section
            className="panel pickups-panel"
            aria-labelledby="pickup-heading"
          >
            <div className="panel-heading pickup-heading">
              <div>
                <h2 id="pickup-heading">
                  <ShoppingBag size={17} aria-hidden="true" />
                  Pickups &amp; Alerts
                </h2>
              </div>
              <label className="warning-setting">
                Warn within
                <select
                  disabled={
                    !canAccessWorkspaceSettings(
                      session.role,
                      session.employee.id,
                      session.employees,
                    )
                  }
                  value={warningMinutes}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    const result = session.saveWorkspaceSettings({
                      ...preferences,
                      warningMinutes: value,
                    });
                    setWarningError(result.error ?? '');
                  }}
                  aria-label="Pickup warning threshold"
                >
                  {deadlineWarningOptions.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} min
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {warningError && (
              <p role="alert" className="field-error">
                {warningError}
              </p>
            )}
            <div className="pickup-groups">
              <PickupGroup
                title="Needs Attention"
                tasks={[...pickupAttention].sort(byPickup)}
                type="attention"
                now={now}
                warningMinutes={warningMinutes}
                onSelect={setSelectedTaskId}
              />
              <PickupGroup
                title="Upcoming"
                tasks={[...upcoming].sort(byPickup)}
                type="upcoming"
                now={now}
                warningMinutes={warningMinutes}
                onSelect={setSelectedTaskId}
              />
              <PickupGroup
                title="Ready for Collection"
                tasks={[...readyForCollection].sort(byPickup)}
                type="ready"
                now={now}
                warningMinutes={warningMinutes}
                onSelect={setSelectedTaskId}
              />
            </div>
          </section>
          <section
            className="panel activity-panel"
            aria-labelledby="activity-heading"
          >
            <div className="panel-heading">
              <h2 id="activity-heading">Recent activity</h2>
            </div>
            <ul className="activity-list">
              {!recentActivities.length && (
                <li className="activity-empty">
                  Activity will appear here as you work.
                </li>
              )}
              {activityRows(recentActivities.slice(0, 5))}
            </ul>
            {recentActivities.length > 5 && (
              <button
                type="button"
                className="activity-more"
                onClick={() => setActivityPanelOpen(true)}
              >
                + {recentActivities.length - 5} more
              </button>
            )}
          </section>
        </aside>
      </div>
      {activityPanelOpen && (
        <SlidePanel
          label="WORKSPACE ACTIVITY"
          title="Recent activity"
          closeLabel="Close recent activity"
          onClose={() => setActivityPanelOpen(false)}
          className="activity-detail-panel"
        >
          <ul className="activity-list">{activityRows(recentActivities)}</ul>
        </SlidePanel>
      )}
      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          employees={employees}
          canUpdate={canUpdateTask(
            session.role,
            session.employee.id,
            selectedTask,
          )}
          onClose={() => setSelectedTaskId(null)}
          onEdit={
            canManage
              ? () => {
                  setSelectedTaskId(null);
                  router.push(
                    `/demo/board?task=${encodeURIComponent(selectedTask.id)}`,
                  );
                }
              : undefined
          }
          onUpdate={saveTask}
          onDelete={
            canManage
              ? () => {
                  demo.commit(
                    tasks.filter((task) => task.id !== selectedTask.id),
                  );
                  setSelectedTaskId(null);
                  showToast('success', 'Task deleted.');
                }
              : undefined
          }
        />
      )}
      {canManage && addingTask && (
        <TaskForm
          employees={employees}
          workspaceId={session.workspaceSettings.id || workspace.id}
          existingIds={tasks.map((task) => task.id)}
          onSave={createTask}
          onClose={() => setAddingTask(false)}
        />
      )}
    </main>
  );
}

function PickupGroup({
  title,
  tasks,
  type,
  now,
  warningMinutes,
  onSelect,
}: {
  title: string;
  tasks: ProductionTask[];
  type: 'attention' | 'upcoming' | 'ready';
  now: number;
  warningMinutes: number;
  onSelect: (taskId: string) => void;
}) {
  const preferences = useWorkspacePreferences();
  return (
    <section className={`pickup-group pickup-group-${type}`}>
      <h3>
        {title}
        <span>{tasks.length}</span>
      </h3>
      {tasks.length ? (
        <ul className="pickup-list">
          {tasks.map((task) => {
            const minutesUntil = Math.ceil(
              (new Date(pickupDate(task)!).getTime() - now) / 60_000,
            );
            const needsWarning =
              type === 'attention' ||
              (type === 'upcoming' &&
                minutesUntil >= 0 &&
                minutesUntil <= warningMinutes);
            const readyPastPickup = isAwaitingCollection(task, now);
            const alertText =
              type === 'attention'
                ? `Overdue by ${Math.abs(minutesUntil)} min`
                : readyPastPickup
                  ? 'Awaiting collection'
                  : `Pickup in ${minutesUntil} min`;
            return (
              <li
                className={`pickup-row ${needsWarning || readyPastPickup ? 'pickup-attention' : ''}`}
                key={task.id}
              >
                <time dateTime={pickupDate(task)!}>
                  {productionTime(
                    pickupDate(task)!,
                    preferences.timeZone,
                    preferences.timeFormat,
                  )}
                </time>
                <div>
                  <button
                    className="pickup-customer"
                    type="button"
                    onClick={() => onSelect(task.id)}
                  >
                    {task.customer || task.title}
                  </button>
                  <p>{task.title}</p>
                  <span className={`status-badge badge-${task.status}`}>
                    {type === 'ready' ? 'Ready' : statusLabels[task.status]}
                  </span>
                  {needsWarning || readyPastPickup ? (
                    <span
                      className={`pickup-warning ${readyPastPickup ? 'pickup-awaiting' : ''}`}
                    >
                      <TriangleAlert size={12} aria-hidden="true" />
                      {alertText}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="pickup-group-empty">Nothing here right now.</p>
      )}
    </section>
  );
}
