'use client';
import { useProductionLibraryData } from './demo-session';
import { categoryName, taskProductName } from '@/lib/production-library';

import { useEffect, useRef } from 'react';
import { Check, Clock3, Pencil, Trash2, X } from 'lucide-react';
import type { Employee, ProductionTask, Status } from '@/lib/types';
import { ChecklistTemplatePicker } from './checklist-template-picker';
import { Avatar } from './ui';
import { useWorkspacePreferences } from './demo-session';

const statusOptions: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
];

export function TaskDetails({
  task,
  employees,
  focusChecklist = false,
  canUpdate = true,
  onClose,
  onEdit,
  onUpdate,
  onDelete,
}: {
  task: ProductionTask;
  employees: Employee[];
  focusChecklist?: boolean;
  canUpdate?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onUpdate: (task: ProductionTask) => void;
  onDelete?: () => void;
}) {
  const { products, categories } = useProductionLibraryData();
  const preferences = useWorkspacePreferences();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const checklistHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.showModal();
    if (focusChecklist) {
      requestAnimationFrame(() => {
        checklistHeadingRef.current?.focus({ preventScroll: true });
        checklistHeadingRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [focusChecklist]);
  function toggleStep(index: number) {
    if (!canUpdate) return;
    onUpdate({
      ...task,
      checklist: task.checklist.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item,
      ),
    });
  }
  function removeTask() {
    if (
      window.confirm(
        'Delete “' +
          task.title +
          '”? This removes it from this browser’s demo board.',
      )
    )
      onDelete?.();
  }
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="task-title"
      className="task-modal slide-panel"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="task-modal-content task-detail-content">
        <header className="slide-panel-header">
          <div>
            <p className="detail-reference">
              {taskProductName(task, products)}
              {task.orderId ? ' · Order ' + task.orderId : ''}
            </p>
            <h2 id="task-title">{task.title}</h2>
          </div>
          <button
            className="icon-button modal-close"
            aria-label="Close task details"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        {task.quantity && <p className="detail-quantity">{task.quantity}</p>}
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        <dl className="detail-facts">
          <div>
            <dt>Category</dt>
            <dd>{categoryName(task, categories)}</dd>
          </div>
          <div>
            <dt>Customer</dt>
            <dd>{task.customer}</dd>
          </div>
          <div>
            <dt>Due / pickup</dt>
            <dd>
              <Clock3 size={14} />
              <time dateTime={task.deadline}>
                {new Intl.DateTimeFormat(undefined, {
                  timeZone: preferences.timeZone,
                  hourCycle: preferences.timeFormat === '24h' ? 'h23' : 'h12',
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(task.deadline))}
              </time>
            </dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd
              className={task.priority === 'High' ? 'priority-detail-high' : ''}
            >
              {task.priority}
            </dd>
          </div>
          <div>
            <dt>Board status</dt>
            <dd>
              {
                statusOptions.find((option) => option.value === task.status)
                  ?.label
              }
            </dd>
          </div>
        </dl>
        {canUpdate && (
          <ChecklistTemplatePicker
            task={task}
            checklist={task.checklist}
            onApply={(steps) => onUpdate({ ...task, checklist: steps })}
          />
        )}
        <fieldset className="status-moves" disabled={!canUpdate}>
          <legend>Move task</legend>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={
                task.status === option.value ? 'status-move-active' : ''
              }
              aria-pressed={task.status === option.value}
              onClick={() =>
                canUpdate && onUpdate({ ...task, status: option.value })
              }
            >
              {option.label}
            </button>
          ))}
        </fieldset>
        <section className="detail-section">
          <h3 ref={checklistHeadingRef} tabIndex={-1}>
            Production checklist{' '}
            <span>
              {task.checklist.filter((item) => item.done).length}/
              {task.checklist.length}
            </span>
          </h3>
          {task.checklist.length === 0 ? (
            <p className="detail-note">
              No checklist steps yet. Add some while editing.
            </p>
          ) : (
            <ul className="detail-checklist">
              {task.checklist.map((item, index) => (
                <li key={index + '-' + item.label}>
                  <button
                    type="button"
                    role="checkbox"
                    disabled={!canUpdate}
                    aria-checked={item.done}
                    aria-label={
                      (item.done ? 'Mark incomplete: ' : 'Mark complete: ') +
                      item.label
                    }
                    onClick={() => toggleStep(index)}
                    className={
                      'check-box checklist-toggle ' +
                      (item.done ? 'checked' : '')
                    }
                  >
                    {item.done && <Check size={13} />}
                  </button>
                  <span className={item.done ? 'checklist-done-text' : ''}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        {canUpdate &&
          task.status === 'progress' &&
          task.checklist.length > 0 &&
          task.checklist.every((step) => step.done) && (
            <div className="ready-suggestion">
              <span>All checklist steps are complete.</span>
              <button
                type="button"
                onClick={() => onUpdate({ ...task, status: 'ready' })}
              >
                Mark as Ready?
              </button>
            </div>
          )}
        {task.notes && (
          <section className="detail-section">
            <h3>Internal notes</h3>
            <p className="detail-internal-notes">{task.notes}</p>
          </section>
        )}
        <section className="detail-section">
          <h3>Assigned staff</h3>
          {task.assigneeIds.length ? (
            <div className="detail-team">
              {employees
                .filter((employee) => task.assigneeIds.includes(employee.id))
                .map((employee) => (
                  <span key={employee.id}>
                    <Avatar employee={employee} />
                    {employee.name}
                  </span>
                ))}
            </div>
          ) : (
            <p className="detail-note">Unassigned</p>
          )}
        </section>
        {!!task.formerAssignees?.length && (
          <section className="detail-section">
            <h3>Former staff</h3>
            <div className="detail-team">
              {task.formerAssignees.map((person) => (
                <span key={person.id}>
                  <Avatar employee={{ ...person, removed: true }} />
                  {person.name} (removed)
                </span>
              ))}
            </div>
          </section>
        )}
        {(onEdit || onDelete) && (
          <footer className="task-panel-footer">
            {onEdit && (
              <button className="button button-outline" onClick={onEdit}>
                <Pencil size={15} />
                Edit task
              </button>
            )}
            {onDelete && (
              <button className="delete-task-button" onClick={removeTask}>
                <Trash2 size={15} />
                Delete task
              </button>
            )}
          </footer>
        )}
      </div>
    </dialog>
  );
}
