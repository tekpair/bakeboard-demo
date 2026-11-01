'use client';
import { calendarMilestoneLabel } from '@/lib/task-production';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  PackageCheck,
  Plus,
  RotateCcw,
} from 'lucide-react';
import type { Employee, ProductionTask, Workspace } from '@/lib/types';
import {
  calendarHeading,
  calendarHref,
  calendarStatuses,
  emptyCalendarFilters,
  filterCalendarTasks,
  groupCalendarTasks,
  groupDayTimes,
  moveCalendarPeriod,
  readCalendarState,
  weekPreviewLimit,
  monthPreviewLimit,
  type CalendarFilters,
  type CalendarState,
  type CalendarView,
} from '@/lib/calendar';
import {
  addCalendarDays,
  calendarMonth,
  calendarWeek,
  formatCalendarDate,
  isDateKey,
  productionDay,
  productionTime,
} from '@/lib/production-dates';
import {
  canManageTasks,
  canUpdateTask,
  isAwaitingCollection,
  isProductionDueSoon,
  isProductionOverdue,
} from '@/lib/task-work';
import { useDemoTasks } from '@/lib/use-demo-tasks';
import { categoryFromValue, taskProductName } from '@/lib/production-library';
import {
  useProductionLibraryData,
  useWorkspacePreferences,
  useDemoSession,
} from './demo-session';
import { Avatar } from './ui';
import { TaskCard } from './task-card';
import { TaskDetails } from './task-details';
import { TaskForm } from './task-form';
import { taskStaff } from '@/lib/staff-history';
import { useToast } from './toast-provider';

export function ProductionCalendar({
  workspace,
  employees: initialEmployees,
  initialTasks,
  initialNow,
  initialState,
}: {
  workspace: Workspace;
  employees: Employee[];
  initialTasks: ProductionTask[];
  initialNow: number;
  initialState: CalendarState;
}) {
  const showToast = useToast();
  const library = useProductionLibraryData();
  const categoryChoices = useMemo(
    () => library.categories.flatMap((item) => [item.id, item.name]),
    [library.categories],
  );
  const preferences = useWorkspacePreferences();
  const demo = useDemoTasks(initialTasks);
  const session = useDemoSession();
  const employees = session.employees ?? initialEmployees;
  const canManage = canManageTasks(session.role);
  const [schedule, setSchedule] = useState(initialState);
  const [now, setNow] = useState(initialNow);
  const warningMinutes = preferences.warningMinutes;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusChecklist, setFocusChecklist] = useState(false);
  const [formTask, setFormTask] = useState<ProductionTask | null | undefined>(
    undefined,
  );
  const [creationDate, setCreationDate] = useState(initialState.date);
  const periodHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const restore = () =>
      setSchedule(
        readCalendarState(
          new URLSearchParams(window.location.search),
          productionDay(Date.now(), preferences.timeZone),
          employees,
          preferences.defaultCalendarView,
          categoryChoices,
        ),
      );
    restore();
    const firstTick = window.setTimeout(() => setNow(Date.now()), 0);
    window.addEventListener('popstate', restore);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.removeEventListener('popstate', restore);
      window.clearTimeout(firstTick);
      window.clearInterval(timer);
    };
  }, [
    employees,
    preferences.timeZone,
    preferences.defaultCalendarView,
    categoryChoices,
  ]);

  function navigate(next: Partial<CalendarState>, replace = false) {
    const value = { ...schedule, ...next };
    if (!isDateKey(value.date)) return;
    setSchedule(value);
    window.history[replace ? 'replaceState' : 'pushState'](
      null,
      '',
      `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${calendarHref(value)}`,
    );
  }
  const filtered = filterCalendarTasks(
    demo.tasks,
    schedule.filters,
    now,
    library.categories,
  );
  const byDay = groupCalendarTasks(filtered, preferences.timeZone);
  const selectedTasks = byDay.get(schedule.date) ?? [];
  const today = productionDay(now, preferences.timeZone);
  const selected = demo.tasks.find((task) => task.id === selectedId);
  const filterCount = Object.values(schedule.filters).filter(Boolean).length;
  const clearFilters = () =>
    navigate({ filters: { ...emptyCalendarFilters } }, true);
  function openTask(task: ProductionTask, checklist = false) {
    setFocusChecklist(checklist);
    setSelectedId(task.id);
  }
  function createTask(date: string) {
    if (!canManage) return;
    setCreationDate(date);
    setFormTask(null);
  }
  function updateTask(task: ProductionTask) {
    const current = demo.tasks.find((item) => item.id === task.id);
    if (!current || !canUpdateTask(session.role, session.employee.id, current))
      return;
    demo.commit(demo.tasks.map((item) => (item.id === task.id ? task : item)));
  }
  function saveTask(task: ProductionTask) {
    if (!canManage) return;
    const exists = demo.tasks.some((item) => item.id === task.id);
    demo.commit(
      exists
        ? demo.tasks.map((item) => (item.id === task.id ? task : item))
        : [...demo.tasks, task],
    );
    setFormTask(undefined);
    setSelectedId(task.id);
    setFocusChecklist(false);
    navigate({ date: productionDay(task.deadline, preferences.timeZone) });
    showToast('success', exists ? 'Task updated.' : 'Task created.');
  }
  const openDay = (date: string) => {
    navigate({ date, view: 'day' });
    requestAnimationFrame(() => {
      periodHeadingRef.current?.scrollIntoView({ block: 'start' });
      periodHeadingRef.current?.focus({ preventScroll: true });
    });
  };
  const week = calendarWeek(schedule.date, preferences.weekStartsOn);
  const weekCount = week.reduce(
    (count, date) => count + (byDay.get(date)?.length ?? 0),
    0,
  );
  const monthCount = [...byDay.entries()]
    .filter(([date]) => date.slice(0, 7) === schedule.date.slice(0, 7))
    .reduce((total, [, entries]) => total + entries.length, 0);

  return (
    <main id="main" className="dashboard-main calendar-page">
      <div className="page-heading calendar-page-heading">
        <div>
          <h1>Calendar</h1>
          <p className="page-description">
            Plan production and see what’s coming up.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            className="button button-primary calendar-new-task"
            onClick={() => createTask(schedule.date)}
          >
            <Plus size={16} />
            New task
          </button>
        )}
      </div>
      <div className="calendar-toolbar">
        <div
          className="calendar-period-nav"
          role="group"
          aria-label="Calendar date navigation"
        >
          <button
            type="button"
            className="icon-button"
            aria-label={`Previous ${schedule.view}`}
            title={`Previous ${schedule.view}`}
            onClick={() =>
              navigate({
                date: moveCalendarPeriod(schedule.date, schedule.view, -1),
              })
            }
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="calendar-today"
            onClick={() => navigate({ date: today })}
          >
            Today
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={`Next ${schedule.view}`}
            title={`Next ${schedule.view}`}
            onClick={() =>
              navigate({
                date: moveCalendarPeriod(schedule.date, schedule.view, 1),
              })
            }
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <h2
          className="calendar-period-title"
          aria-live="polite"
          ref={periodHeadingRef}
          tabIndex={-1}
        >
          {calendarHeading(
            schedule.date,
            schedule.view,
            preferences.weekStartsOn,
          )}
        </h2>
        <div
          className="calendar-view-selector"
          role="group"
          aria-label="Calendar view"
        >
          {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={schedule.view === view}
              onClick={() => navigate({ view })}
            >
              {view === 'day' ? 'Day' : view === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
        <CalendarFiltersMenu
          filters={schedule.filters}
          employees={employees}
          onChange={(filters) => navigate({ filters }, true)}
          onClear={clearFilters}
        />
      </div>

      {schedule.view === 'month' && (
        <>
          {monthCount === 0 && (
            <p className="calendar-period-empty">
              {filterCount
                ? 'No tasks match these filters this month.'
                : 'No production tasks scheduled this month.'}
            </p>
          )}
          <MonthSchedule
            date={schedule.date}
            today={today}
            byDay={byDay}
            now={now}
            warningMinutes={warningMinutes}
            onSelect={(date) => navigate({ date }, true)}
            onOpenDay={openDay}
            onOpenTask={openTask}
          />
          <section
            className="calendar-selected-day"
            aria-labelledby="calendar-selected-day-title"
          >
            <div className="calendar-day-heading">
              <div>
                <h2
                  id="calendar-selected-day-title"
                  aria-live="polite"
                  tabIndex={-1}
                >
                  {formatCalendarDate(schedule.date, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
              </div>
              <button type="button" onClick={() => openDay(schedule.date)}>
                Open day <ChevronRight size={14} />
              </button>
            </div>
            <DaySchedule
              tasks={selectedTasks}
              employees={employees}
              now={now}
              warningMinutes={warningMinutes}
              onOpenTask={openTask}
              onCreate={canManage ? () => createTask(schedule.date) : undefined}
              filtered={filterCount > 0}
              onClear={clearFilters}
            />
          </section>
        </>
      )}
      {schedule.view === 'week' &&
        (weekCount ? (
          <WeekSchedule
            dates={week}
            today={today}
            byDay={byDay}
            employees={employees}
            now={now}
            warningMinutes={warningMinutes}
            onOpenTask={openTask}
            onOpenDay={openDay}
            onCreate={canManage ? createTask : undefined}
          />
        ) : (
          <CalendarEmpty
            period="week"
            filtered={filterCount > 0}
            onClear={clearFilters}
            onCreate={canManage ? () => createTask(schedule.date) : undefined}
          />
        ))}
      {schedule.view === 'day' && (
        <section aria-label="Selected day schedule">
          <DaySchedule
            tasks={selectedTasks}
            employees={employees}
            now={now}
            warningMinutes={warningMinutes}
            onOpenTask={openTask}
            onCreate={canManage ? () => createTask(schedule.date) : undefined}
            filtered={filterCount > 0}
            onClear={clearFilters}
          />
        </section>
      )}

      {selected && (
        <TaskDetails
          key={selected.id}
          task={selected}
          employees={employees}
          focusChecklist={focusChecklist}
          canUpdate={canUpdateTask(session.role, session.employee.id, selected)}
          onClose={() => setSelectedId(null)}
          onUpdate={updateTask}
          onEdit={canManage ? () => setFormTask(selected) : undefined}
          onDelete={
            canManage
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
      {canManage && formTask !== undefined && (
        <TaskForm
          task={formTask ?? undefined}
          initialDate={creationDate}
          employees={employees}
          workspaceId={session.workspaceSettings.id || workspace.id}
          existingIds={demo.tasks.map((task) => task.id)}
          onSave={saveTask}
          onClose={() => setFormTask(undefined)}
        />
      )}
    </main>
  );
}

export function MonthSchedule({
  date,
  today,
  byDay,
  now,
  warningMinutes = 60,
  onSelect,
  onOpenDay,
  onOpenTask,
}: {
  date: string;
  today: string;
  byDay: Map<string, ProductionTask[]>;
  now: number;
  warningMinutes?: number;
  onSelect: (date: string) => void;
  onOpenDay: (date: string) => void;
  onOpenTask: (task: ProductionTask) => void;
}) {
  const preferences = useWorkspacePreferences();
  const days = calendarMonth(date, preferences.weekStartsOn);
  const rows = Array.from({ length: days.length / 7 }, (_, row) =>
    days.slice(row * 7, row * 7 + 7),
  );
  const names = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  if (preferences.weekStartsOn === 0) names.unshift(names.pop()!);
  function selectDay(day: string) {
    onSelect(day);
    requestAnimationFrame(() => {
      const heading = document.getElementById('calendar-selected-day-title');
      heading?.scrollIntoView({ block: 'start' });
      heading?.focus({ preventScroll: true });
    });
  }
  function moveFocus(
    event: React.KeyboardEvent<HTMLButtonElement>,
    day: string,
  ) {
    const delta: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const next =
      event.key === 'Home'
        ? calendarWeek(day, preferences.weekStartsOn)[0]
        : event.key === 'End'
          ? calendarWeek(day, preferences.weekStartsOn)[6]
          : delta[event.key]
            ? addCalendarDays(day, delta[event.key])
            : null;
    if (!next) return;
    event.preventDefault();
    onSelect(next);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>(`[data-calendar-date="${next}"]`)
        ?.focus(),
    );
  }
  return (
    <div className="calendar-month-wrap">
      <table
        className="calendar-month"
        aria-label={formatCalendarDate(date, {
          month: 'long',
          year: 'numeric',
        })}
      >
        <thead>
          <tr>
            {names.map((name) => (
              <th key={name} scope="col">
                <abbr title={name}>{name.slice(0, 3)}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((key) => {
                const tasks = byDay.get(key) ?? [];
                const label = formatCalendarDate(key, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                });
                const tones = [
                  ...new Set(
                    tasks.map((task) =>
                      isProductionOverdue(task, now) ? 'overdue' : task.status,
                    ),
                  ),
                ];
                return (
                  <td
                    key={key}
                    className={`calendar-cell ${key.slice(0, 7) !== date.slice(0, 7) ? 'calendar-cell-outside' : ''} ${key === today ? 'calendar-cell-today' : ''} ${key === date ? 'calendar-cell-selected' : ''}`}
                  >
                    <div className="calendar-cell-content">
                      <div className="calendar-cell-heading">
                        <button
                          type="button"
                          className="calendar-date-number"
                          data-calendar-date={key}
                          aria-label={`${key === today ? 'Today, ' : ''}${key === date ? 'Selected, ' : ''}${label}, ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
                          aria-current={key === today ? 'date' : undefined}
                          aria-pressed={key === date}
                          onClick={() => selectDay(key)}
                          onKeyDown={(event) => moveFocus(event, key)}
                        >
                          <time dateTime={key}>{Number(key.slice(8))}</time>
                        </button>
                        {key === today && (
                          <span
                            className="calendar-today-label"
                            aria-hidden="true"
                          >
                            Today
                          </span>
                        )}
                      </div>
                      <div className="calendar-month-entries">
                        {tasks.slice(0, monthPreviewLimit).map((task) => (
                          <CalendarEntry
                            key={`${task.id}-${task.calendarMilestone}`}
                            task={task}
                            now={now}
                            warningMinutes={warningMinutes}
                            onClick={() => onOpenTask(task)}
                          />
                        ))}
                        {tasks.length > monthPreviewLimit && (
                          <button
                            type="button"
                            className="calendar-more"
                            aria-label={`Show all ${tasks.length} tasks for ${label}`}
                            onClick={() => onOpenDay(key)}
                          >
                            +{tasks.length - monthPreviewLimit} more
                          </button>
                        )}
                      </div>
                      {tasks.length > 0 && (
                        <button
                          type="button"
                          className="calendar-mobile-count"
                          onClick={() => selectDay(key)}
                          aria-label={`Show ${tasks.length} tasks for ${label}`}
                        >
                          <span className="calendar-mobile-dots">
                            {tones.slice(0, 4).map((tone) => (
                              <span
                                key={tone}
                                className={`calendar-dot calendar-dot-${tone}`}
                              />
                            ))}
                          </span>
                          <span>{tasks.length}</span>
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalendarEntry({
  task,
  now,
  onClick,
  employees,
  warningMinutes = 60,
}: {
  task: ProductionTask;
  now: number;
  onClick: () => void;
  employees?: Employee[];
  warningMinutes?: number;
}) {
  const { products } = useProductionLibraryData();
  const preferences = useWorkspacePreferences();
  const overdue = isProductionOverdue(task, now);
  const awaiting = isAwaitingCollection(task, now);
  const dueSoon = isProductionDueSoon(task, now, warningMinutes);
  const assigned = taskStaff(task, employees ?? []);
  const assignedNames = assigned
    .map(
      (employee) => `${employee.name}${employee.removed ? ' (removed)' : ''}`,
    )
    .join(', ');
  const label = `${calendarMilestoneLabel(task)}, ${task.title}${task.productId ? `, ${taskProductName(task, products)}` : ''}, ${productionTime(task.deadline, preferences.timeZone, preferences.timeFormat)}, ${calendarStatuses[task.status]}${overdue ? ', Overdue production' : awaiting ? ', Awaiting collection' : dueSoon ? ', Due soon' : ''}${task.priority === 'High' ? ', High priority' : ''}${assignedNames ? `, Assigned to ${assignedNames}` : ''}`;
  return (
    <button
      type="button"
      className={`calendar-entry calendar-entry-${task.status} ${overdue ? 'calendar-entry-overdue' : ''} ${employees ? 'calendar-week-entry' : ''}`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <span className="calendar-entry-main">
        <strong>{task.title}</strong>
        <span className="calendar-milestone">
          {calendarMilestoneLabel(task)}
        </span>
        <time dateTime={task.deadline}>
          {productionTime(
            task.deadline,
            preferences.timeZone,
            preferences.timeFormat,
          )}
        </time>
      </span>
      {!employees && overdue && <AlertCircle size={11} aria-hidden="true" />}
      {!employees && awaiting && <PackageCheck size={11} aria-hidden="true" />}
      {employees && (
        <>
          <span className={`status-badge badge-${task.status}`}>
            {calendarStatuses[task.status]}
          </span>
          {(overdue || awaiting || dueSoon || task.priority === 'High') && (
            <span className="calendar-entry-warnings">
              {overdue && (
                <span className="task-overdue-indicator">Overdue</span>
              )}
              {awaiting && (
                <span className="task-awaiting-collection">
                  Awaiting collection
                </span>
              )}
              {dueSoon && <span className="task-due-soon">Due soon</span>}
              {task.priority === 'High' && (
                <span className="priority-high">
                  <Flag size={11} aria-hidden="true" />
                  High priority
                </span>
              )}
            </span>
          )}
          <span className="avatar-stack calendar-entry-staff">
            {assigned.map((employee) => (
              <Avatar key={employee.id} employee={employee} small />
            ))}
          </span>
        </>
      )}
    </button>
  );
}

export function WeekSchedule({
  dates,
  today,
  byDay,
  employees,
  now,
  warningMinutes,
  onOpenTask,
  onOpenDay,
  onCreate,
}: {
  dates: string[];
  today: string;
  byDay: Map<string, ProductionTask[]>;
  employees: Employee[];
  now: number;
  warningMinutes: number;
  onOpenTask: (task: ProductionTask) => void;
  onOpenDay: (date: string) => void;
  onCreate?: (date: string) => void;
}) {
  return (
    <div className="calendar-week">
      {dates.map((date) => (
        <section
          key={date}
          className={`calendar-week-day ${date === today ? 'calendar-week-today' : ''}`}
          aria-label={formatCalendarDate(date, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        >
          <button
            type="button"
            className="calendar-week-day-heading"
            onClick={() => onOpenDay(date)}
            aria-label={`Open ${formatCalendarDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}`}
          >
            <span>{formatCalendarDate(date, { weekday: 'short' })}</span>
            <strong>
              {formatCalendarDate(date, { month: 'short', day: 'numeric' })}
            </strong>
            {date === today && <small>Today</small>}
          </button>
          <div className="calendar-week-tasks">
            {(byDay.get(date) ?? []).slice(0, weekPreviewLimit).map((task) => (
              <CalendarEntry
                key={`${task.id}-${task.calendarMilestone}`}
                task={task}
                now={now}
                warningMinutes={warningMinutes}
                employees={employees}
                onClick={() => onOpenTask(task)}
              />
            ))}
            {(byDay.get(date)?.length ?? 0) > weekPreviewLimit && (
              <button
                type="button"
                className="calendar-more calendar-week-more"
                aria-label={`Show ${(byDay.get(date)?.length ?? 0) - weekPreviewLimit} more tasks for ${formatCalendarDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}`}
                onClick={() => onOpenDay(date)}
              >
                +{(byDay.get(date)?.length ?? 0) - weekPreviewLimit} more
              </button>
            )}
            {!byDay.get(date)?.length && (
              <div className="calendar-week-empty">
                <p>Nothing scheduled</p>
                {onCreate && (
                  <button type="button" onClick={() => onCreate(date)}>
                    <Plus size={12} />
                    New task
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export function DaySchedule({
  tasks,
  employees,
  now,
  warningMinutes,
  onOpenTask,
  onCreate,
  filtered,
  onClear,
}: {
  tasks: ProductionTask[];
  employees: Employee[];
  now: number;
  warningMinutes: number;
  onOpenTask: (task: ProductionTask, checklist?: boolean) => void;
  onCreate?: () => void;
  filtered: boolean;
  onClear: () => void;
}) {
  const preferences = useWorkspacePreferences();
  if (!tasks.length)
    return (
      <CalendarEmpty
        period="day"
        filtered={filtered}
        onClear={onClear}
        onCreate={onCreate}
      />
    );
  return (
    <div className="calendar-day-schedule">
      {groupDayTimes(tasks, preferences.timeZone).map(([time, group]) => (
        <section
          key={time}
          className="calendar-time-group"
          aria-label={`Tasks at ${productionTime(group[0].deadline, preferences.timeZone, preferences.timeFormat)}`}
        >
          <h3>
            <Clock3 size={15} aria-hidden="true" />
            <time dateTime={group[0].deadline}>
              {productionTime(
                group[0].deadline,
                preferences.timeZone,
                preferences.timeFormat,
              )}
            </time>
          </h3>
          <div className="calendar-day-cards">
            {group.map((task) => (
              <TaskCard
                key={`${task.id}-${task.calendarMilestone}`}
                task={task}
                employees={employees}
                now={now}
                warningMinutes={warningMinutes}
                personal
                timeline
                onClick={() => onOpenTask(task)}
                onChecklistClick={() => onOpenTask(task, true)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CalendarFiltersMenu({
  filters,
  employees,
  onChange,
  onClear,
}: {
  filters: CalendarFilters;
  employees: Employee[];
  onChange: (filters: CalendarFilters) => void;
  onClear: () => void;
}) {
  const library = useProductionLibraryData();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const count = Object.values(filters).filter(Boolean).length;
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return (
    <div className="board-filter-group calendar-filters" ref={menuRef}>
      <button
        ref={toggleRef}
        type="button"
        className="board-filter-toggle"
        aria-label={`Filters${count ? `, ${count} active` : ''}`}
        aria-expanded={open}
        aria-controls="calendar-filter-options"
        onClick={() => setOpen((value) => !value)}
      >
        Filters
        {count > 0 && <span className="calendar-filter-count">{count}</span>}
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      <div
        id="calendar-filter-options"
        className={`board-filter-options ${open ? 'filters-open' : ''}`}
      >
        <select
          aria-label="Filter calendar by product"
          value={
            categoryFromValue(filters.product, library.categories)?.id ??
            filters.product
          }
          onChange={(event) =>
            onChange({
              ...filters,
              product: event.target.value as CalendarFilters['product'],
            })
          }
        >
          <option value="">All categories</option>
          {library.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {!category.active ? ' (Inactive)' : ''}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter calendar by status"
          value={filters.status}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as CalendarFilters['status'],
            })
          }
        >
          <option value="">All statuses</option>
          {Object.entries(calendarStatuses).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter calendar by staff"
          value={filters.staff}
          onChange={(event) =>
            onChange({ ...filters, staff: event.target.value })
          }
        >
          <option value="">Anyone</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
              {employee.active === false ? ' (Inactive)' : ''}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter calendar by priority"
          value={filters.priority}
          onChange={(event) =>
            onChange({
              ...filters,
              priority: event.target.value as CalendarFilters['priority'],
            })
          }
        >
          <option value="">Any priority</option>
          <option>High</option>
          <option>Normal</option>
          <option>Low</option>
        </select>
        <label className="overdue-filter">
          <input
            type="checkbox"
            checked={filters.overdue}
            onChange={(event) =>
              onChange({ ...filters, overdue: event.target.checked })
            }
          />
          Overdue only
        </label>
        <button
          type="button"
          className="button button-outline board-action"
          disabled={!count}
          onClick={onClear}
        >
          <RotateCcw size={14} />
          Reset filters
        </button>
      </div>
    </div>
  );
}

function CalendarEmpty({
  period,
  filtered,
  onClear,
  onCreate,
}: {
  period: 'day' | 'week';
  filtered: boolean;
  onClear: () => void;
  onCreate?: () => void;
}) {
  return (
    <div className="calendar-empty">
      <CalendarDays size={24} aria-hidden="true" />
      <h3>{filtered ? 'No matching tasks' : 'No tasks scheduled'}</h3>
      <p>
        {filtered
          ? `No tasks match these filters for this ${period}.`
          : period === 'day'
            ? 'Nothing scheduled for this day.'
            : 'No production tasks scheduled this week.'}
      </p>
      {filtered ? (
        <button
          type="button"
          className="button button-outline"
          onClick={onClear}
        >
          Clear filters
        </button>
      ) : (
        onCreate && (
          <button
            type="button"
            className="button button-outline"
            onClick={onCreate}
          >
            <Plus size={14} />
            New task
          </button>
        )
      )}
    </div>
  );
}
