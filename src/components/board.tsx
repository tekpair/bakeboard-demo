'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerRelated, taskType } from '@/lib/task-production';
import { matchesTaskCategory } from '@/lib/production-library';
import { ChevronDown, Plus, RotateCcw, Search } from 'lucide-react';
import type { Employee, ProductionTask, Status } from '@/lib/types';
import { useDemoTasks } from '@/lib/use-demo-tasks';
import { TaskCard } from './task-card';
import { TaskDetails } from './task-details';
import { TaskForm } from './task-form';
import { useOptionalToast } from './toast-provider';
import {
  useWorkspacePreferences,
  useProductionLibraryData,
  useOptionalDemoSession,
} from './demo-session';
import {
  canManageTasks,
  canUpdateTask,
  isProductionOverdue,
  localDay,
} from '@/lib/task-work';

const columns: { status: Status; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'neutral' },
  { status: 'progress', label: 'In Progress', color: 'caramel' },
  { status: 'ready', label: 'Ready', color: 'sage' },
  { status: 'completed', label: 'Completed', color: 'muted' },
];
export function Board({
  tasks: initialTasks,
  employees: initialEmployees,
  preview = false,
  workspaceId = 'workspace-demo',
  initialStatus,
  initialDate,
  initialAttention = false,
  initialTaskId,
  initialNow = 0,
}: {
  tasks: ProductionTask[];
  employees: Employee[];
  preview?: boolean;
  workspaceId?: string;
  initialStatus?: Status;
  initialDate?: string;
  initialAttention?: boolean;
  initialTaskId?: string;
  initialNow?: number;
}) {
  const showToast = useOptionalToast();
  const library = useProductionLibraryData();
  const preferences = useWorkspacePreferences();
  const demo = useDemoTasks(initialTasks);
  const session = useOptionalDemoSession();
  const employees = session?.employees ?? initialEmployees;
  const canManage = !!session && canManageTasks(session.role);
  const canWork = (task: ProductionTask) =>
    !!session && canUpdateTask(session.role, session.employee.id, task);
  const tasks = preview ? initialTasks : demo.tasks;
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [category, setCategory] = useState('');
  const [assignee, setAssignee] = useState('Anyone');
  const [priority, setPriority] = useState('Any priority');
  const [status, setStatus] = useState(initialStatus ?? 'All statuses');
  const [dateFilter, setDateFilter] = useState(initialDate ?? '');
  const [attentionFilter, setAttentionFilter] = useState(initialAttention);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTaskId ?? null,
  );
  const [focusChecklist, setFocusChecklist] = useState(false);
  const [now, setNow] = useState(initialNow);
  const [formTask, setFormTask] = useState<ProductionTask | null | undefined>(
    undefined,
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Status | null>(null);
  const [dropMarker, setDropMarker] = useState<{
    id: string;
    side: 'before' | 'after';
  } | null>(null);
  const selected = tasks.find((task) => task.id === selectedId) ?? null;

  useEffect(() => {
    const firstTick = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(timer);
    };
  }, []);

  const filtered = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesSearch =
          `${task.title} ${task.description} ${task.size ?? ''} ${task.flavor ?? ''} ${customerRelated(task) ? `${task.customer} ${task.orderId ?? ''}` : ''}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        return (
          matchesSearch &&
          (!typeFilter || taskType(task) === typeFilter) &&
          matchesTaskCategory(task, category, library.categories) &&
          (assignee === 'Anyone' || task.assigneeIds.includes(assignee)) &&
          (priority === 'Any priority' || task.priority === priority) &&
          (status === 'All statuses' || task.status === status) &&
          (!dateFilter ||
            localDay(task.deadline, preferences.timeZone) === dateFilter) &&
          (!attentionFilter || isProductionOverdue(task, now))
        );
      }),
    [
      tasks,
      query,
      typeFilter,
      category,
      library.categories,
      assignee,
      priority,
      status,
      dateFilter,
      preferences.timeZone,
      attentionFilter,
      now,
    ],
  );

  function saveTask(task: ProductionTask) {
    if (!canManage) return;
    const exists = tasks.some((current) => current.id === task.id);
    demo.commit(
      exists
        ? tasks.map((current) => (current.id === task.id ? task : current))
        : [task, ...tasks],
    );
    setFormTask(undefined);
    setSelectedId(task.id);
    showToast?.('success', exists ? 'Task updated.' : 'Task created.');
  }
  function updateTask(task: ProductionTask) {
    if (!canWork(task)) return;
    demo.commit(
      tasks.map((current) => (current.id === task.id ? task : current)),
    );
  }
  function moveTask(id: string, nextStatus: Status) {
    const source = tasks.find((item) => item.id === id);
    if (!source || !canWork(source)) return;
    const remaining = tasks.filter((item) => item.id !== id);
    const lastInColumn = remaining.reduce(
      (last, item, index) => (item.status === nextStatus ? index : last),
      -1,
    );
    remaining.splice(lastInColumn + 1, 0, { ...source, status: nextStatus });
    demo.commit(remaining);
  }
  function placeTask(
    id: string,
    targetId: string,
    targetStatus: Status,
    side: 'before' | 'after',
  ) {
    if (id === targetId) return;
    const source = tasks.find((item) => item.id === id);
    if (!source || !canWork(source)) return;
    const remaining = tasks.filter((item) => item.id !== id);
    const targetIndex = remaining.findIndex((item) => item.id === targetId);
    if (targetIndex < 0) return;
    const insertionIndex = targetIndex + (side === 'after' ? 1 : 0);
    remaining.splice(insertionIndex, 0, { ...source, status: targetStatus });
    demo.commit(remaining);
  }
  function resetFilters() {
    setTypeFilter('');
    setQuery('');
    setCategory('');
    setAssignee('Anyone');
    setPriority('Any priority');
    setStatus('All statuses');
    setDateFilter('');
    setAttentionFilter(false);
  }

  return (
    <>
      {!preview && (
        <>
          {canManage && (
            <div className="board-new-task-row">
              <button
                type="button"
                className="button button-primary board-action"
                onClick={() => setFormTask(null)}
              >
                <Plus size={16} />
                New task
              </button>
            </div>
          )}
          <div className="board-tools">
            <label className="search-field">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a task, order, or customer…"
                aria-label="Search tasks, orders, or customers"
              />
            </label>
            <label className="board-date-filter">
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Select production date"
              />
            </label>
            <div className="board-filter-group">
              <button
                type="button"
                className="board-filter-toggle"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((open) => !open)}
              >
                Filters <ChevronDown size={15} aria-hidden="true" />
              </button>
              <div
                className={`board-filter-options ${filtersOpen ? 'filters-open' : ''}`}
              >
                <select
                  aria-label="Filter by task type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Tasks</option>
                  <option value="general_production">General Production</option>
                  <option value="customer_related">Customer-Related</option>
                </select>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label="Filter by product"
                >
                  <option value="">All categories</option>
                  {library.categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {!item.active ? ' (Inactive)' : ''}
                    </option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setAttentionFilter(false);
                  }}
                  aria-label="Filter by status"
                >
                  <option>All statuses</option>
                  {columns.map((column) => (
                    <option key={column.status} value={column.status}>
                      {column.label}
                    </option>
                  ))}
                </select>
                <select
                  value={assignee}
                  onChange={(event) => setAssignee(event.target.value)}
                  aria-label="Filter by employee"
                >
                  <option>Anyone</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                      {employee.active === false ? ' (Inactive)' : ''}
                    </option>
                  ))}
                </select>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  aria-label="Filter by priority"
                >
                  <option>Any priority</option>
                  <option>High</option>
                  <option>Normal</option>
                  <option>Low</option>
                </select>
                <label className="overdue-filter">
                  <input
                    type="checkbox"
                    checked={attentionFilter}
                    onChange={(event) =>
                      setAttentionFilter(event.target.checked)
                    }
                  />
                  Overdue
                </label>
                <button
                  type="button"
                  className="button button-outline board-action"
                  onClick={resetFilters}
                >
                  <RotateCcw size={15} />
                  Reset filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <div
        className={`production-board ${preview ? 'board-preview' : ''}`}
        role="region"
        aria-label="Production columns; scroll horizontally on smaller screens"
        tabIndex={0}
      >
        {columns.map((column) => {
          const columnTasks = filtered.filter(
            (task) => task.status === column.status,
          );
          return (
            <section
              key={column.status}
              className={`board-column column-${column.color} ${dragOverStatus === column.status ? 'column-drop-target' : ''}`}
              onDragOver={(event) => {
                if (!preview) {
                  event.preventDefault();
                  setDragOverStatus(column.status);
                }
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node))
                  setDragOverStatus(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData('text/plain');
                if (id) moveTask(id, column.status);
                setDraggingId(null);
                setDragOverStatus(null);
                setDropMarker(null);
              }}
            >
              <header>
                <span
                  className={`status-dot ${column.color}`}
                  aria-hidden="true"
                />
                <h3>{column.label}</h3>
                <span className="column-count">{columnTasks.length}</span>
              </header>
              <div className="column-cards">
                {columnTasks.slice(0, preview ? 2 : 99).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    employees={employees}
                    now={now}
                    dropSide={
                      dropMarker?.id === task.id ? dropMarker.side : null
                    }
                    onClick={preview ? undefined : () => setSelectedId(task.id)}
                    onChecklistClick={
                      preview
                        ? undefined
                        : () => {
                            setFocusChecklist(true);
                            setSelectedId(task.id);
                          }
                    }
                    draggable={!preview && canWork(task)}
                    dragging={draggingId === task.id}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', task.id);
                      setDraggingId(task.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverStatus(null);
                      setDropMarker(null);
                    }}
                    onDragOver={(event) => {
                      if (preview || !draggingId || draggingId === task.id)
                        return;
                      event.preventDefault();
                      event.stopPropagation();
                      event.dataTransfer.dropEffect = 'move';
                      const rect = event.currentTarget.getBoundingClientRect();
                      const side =
                        event.clientY < rect.top + rect.height / 2
                          ? 'before'
                          : 'after';
                      setDropMarker({ id: task.id, side });
                      setDragOverStatus(column.status);
                    }}
                    onDrop={(event) => {
                      if (preview) return;
                      event.preventDefault();
                      event.stopPropagation();
                      const id = event.dataTransfer.getData('text/plain');
                      const rect = event.currentTarget.getBoundingClientRect();
                      const side =
                        event.clientY < rect.top + rect.height / 2
                          ? 'before'
                          : 'after';
                      if (id) placeTask(id, task.id, column.status, side);
                      setDraggingId(null);
                      setDragOverStatus(null);
                      setDropMarker(null);
                    }}
                  />
                ))}
                {!columnTasks.length && (
                  <p className="empty-column">
                    {filtered.length
                      ? 'No tasks in this status'
                      : 'No matching tasks'}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
      {!preview && selected && (
        <TaskDetails
          task={selected}
          employees={employees}
          focusChecklist={focusChecklist}
          canUpdate={canWork(selected)}
          onClose={() => {
            setSelectedId(null);
            setFocusChecklist(false);
          }}
          onEdit={canManage ? () => setFormTask(selected) : undefined}
          onUpdate={updateTask}
          onDelete={
            canManage
              ? () => {
                  demo.commit(tasks.filter((task) => task.id !== selected.id));
                  setSelectedId(null);
                  showToast?.('success', 'Task deleted.');
                }
              : undefined
          }
        />
      )}
      {!preview && canManage && formTask !== undefined && (
        <TaskForm
          task={formTask ?? undefined}
          employees={employees}
          workspaceId={session?.workspaceSettings.id ?? workspaceId}
          existingIds={tasks.map((task) => task.id)}
          onSave={saveTask}
          onClose={() => setFormTask(undefined)}
        />
      )}
    </>
  );
}

export function BoardWithQuery({
  tasks,
  employees,
  workspaceId,
  initialNow,
}: {
  tasks: ProductionTask[];
  employees: Employee[];
  workspaceId: string;
  initialNow: number;
}) {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const date = searchParams.get('date');
  return (
    <Board
      key={searchParams.toString()}
      tasks={tasks}
      employees={employees}
      workspaceId={workspaceId}
      initialStatus={
        columns.some((column) => column.status === status)
          ? (status as Status)
          : undefined
      }
      initialDate={date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined}
      initialAttention={searchParams.get('attention') === 'overdue'}
      initialTaskId={searchParams.get('task') ?? undefined}
      initialNow={initialNow}
    />
  );
}
