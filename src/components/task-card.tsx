'use client';
import {
  calendarMilestoneLabel,
  customerRelated,
  pickupDate,
  productionSummary,
} from '@/lib/task-production';

import { useProductionLibraryData } from './demo-session';
import { taskProductName } from '@/lib/production-library';
import {
  AlertCircle,
  ChefHat,
  ClipboardList,
  Hash,
  Package,
  UserRound,
  CheckCheck,
  Clock3,
  Flag,
  GripVertical,
  PackageCheck,
} from 'lucide-react';
import type { Employee, ProductionTask } from '@/lib/types';
import { taskStaff } from '@/lib/staff-history';
import { Avatar } from './ui';
import { productionTime } from '@/lib/production-dates';
import { useWorkspacePreferences } from './demo-session';
import {
  isAwaitingCollection,
  isProductionOverdue,
  isProductionDueSoon,
} from '@/lib/task-work';

const statusLabels = {
  todo: 'To Do',
  progress: 'In Progress',
  ready: 'Ready',
  completed: 'Completed',
};

export function TaskCard({
  task,
  employees,
  now = 0,
  onChecklistClick,
  onClick,
  draggable = false,
  dragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  dropSide = null,
  personal = false,
  timeline = false,
  warningMinutes,
}: {
  task: ProductionTask;
  employees: Employee[];
  now?: number;
  onChecklistClick?: () => void;
  onClick?: () => void;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: React.DragEventHandler<HTMLButtonElement>;
  onDragEnd?: React.DragEventHandler<HTMLButtonElement>;
  onDragOver?: React.DragEventHandler<HTMLElement>;
  onDrop?: React.DragEventHandler<HTMLElement>;
  dropSide?: 'before' | 'after' | null;
  personal?: boolean;
  timeline?: boolean;
  warningMinutes?: number;
}) {
  const { products } = useProductionLibraryData();
  const preferences = useWorkspacePreferences();
  const assigned = taskStaff(task, employees);
  const done = task.checklist.filter((item) => item.done).length;
  const overdue = now > 0 && isProductionOverdue(task, now);
  const awaitingCollection = now > 0 && isAwaitingCollection(task, now);
  const dueSoon =
    now > 0 &&
    isProductionDueSoon(
      task,
      now,
      warningMinutes ?? preferences.warningMinutes,
    );
  const heading = (
    <h3>
      {onClick ? (
        <button
          className="task-open"
          aria-label={`View ${task.title}`}
          onClick={onClick}
        >
          {task.title}
        </button>
      ) : (
        task.title
      )}
    </h3>
  );
  return (
    <article
      className={`task-card ${personal ? 'personal-task-card' : ''} ${timeline ? 'timeline-task-card' : ''} ${task.status === 'completed' ? 'task-completed' : ''} ${dragging ? 'task-dragging' : ''} ${dropSide ? `task-drop-${dropSide}` : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {timeline ? (
        <>
          <div className="task-timeline-header">
            {heading}
            <span className={`status-badge badge-${task.status}`}>
              {statusLabels[task.status]}
            </span>
          </div>
          <div className="task-timeline-meta">
            <span className="category task-meta-label">
              <Package size={13} aria-hidden="true" />
              {taskProductName(task, products)}
            </span>
            {productionSummary(task) && (
              <span className="task-meta-label">
                <Hash size={13} aria-hidden="true" />
                {productionSummary(task)}
              </span>
            )}
          </div>
          {task.description && (
            <p className="task-timeline-description">{task.description}</p>
          )}
          {customerRelated(task) && task.customer && (
            <p className="task-customer task-meta-label">
              <UserRound size={13} aria-hidden="true" />
              {task.customer}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="task-card-top">
            {draggable && (
              <button
                type="button"
                draggable
                className="task-drag-handle"
                aria-label={`Drag ${task.title} to another column`}
                onClick={(event) => event.stopPropagation()}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                <GripVertical size={15} />
              </button>
            )}
            <span className="category task-meta-label">
              <Package size={13} aria-hidden="true" />
              {taskProductName(task, products)}
            </span>
            {personal && (
              <span className={`status-badge badge-${task.status}`}>
                {statusLabels[task.status]}
              </span>
            )}
          </div>
          {heading}
          {productionSummary(task) && (
            <p className="task-quantity task-meta-label">
              <Hash size={13} aria-hidden="true" />
              {productionSummary(task)}
            </p>
          )}
          {personal && task.description && (
            <p className="task-description-preview">{task.description}</p>
          )}
          {customerRelated(task) && task.customer && (
            <p className="task-customer task-meta-label">
              <UserRound size={13} aria-hidden="true" />
              {task.customer}
            </p>
          )}
          <div
            className={`task-deadline ${task.priority === 'High' && task.status !== 'completed' ? 'time-urgent' : ''}`}
          >
            <Clock3 size={14} aria-hidden="true" />
            <span>Production due</span>
            <time dateTime={task.deadline}>
              {personal
                ? new Intl.DateTimeFormat(undefined, {
                    timeZone: preferences.timeZone,
                    hourCycle: preferences.timeFormat === '24h' ? 'h23' : 'h12',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(task.deadline))
                : productionTime(
                    task.deadline,
                    preferences.timeZone,
                    preferences.timeFormat,
                  )}
            </time>
          </div>
        </>
      )}
      <div className="task-production-label task-meta-label">
        {customerRelated(task) ? (
          <ClipboardList size={12} aria-hidden="true" />
        ) : (
          <ChefHat size={12} aria-hidden="true" />
        )}
        {timeline
          ? calendarMilestoneLabel(task)
          : customerRelated(task)
            ? 'Customer Production'
            : 'General Production'}
      </div>
      {!timeline && pickupDate(task) && (
        <p className="task-pickup-line">
          Pickup / Delivery:{' '}
          {new Intl.DateTimeFormat(undefined, {
            timeZone: preferences.timeZone,
            dateStyle: 'short',
            timeStyle: 'short',
            hourCycle: preferences.timeFormat === '24h' ? 'h23' : 'h12',
          }).format(new Date(pickupDate(task)!))}
        </p>
      )}
      {task.allergyNotes?.trim() && (
        <div className="task-handling-warning">
          <AlertCircle size={14} aria-hidden="true" />
          Allergy / special handling — review notes
        </div>
      )}
      {(overdue ||
        awaitingCollection ||
        dueSoon ||
        task.priority === 'High') && (
        <div className="task-card-tags">
          {overdue && (
            <span className="task-overdue-indicator">
              <AlertCircle size={12} aria-hidden="true" />
              Overdue
            </span>
          )}
          {awaitingCollection && (
            <span className="task-awaiting-collection">
              <PackageCheck size={12} aria-hidden="true" />
              Awaiting collection
            </span>
          )}
          {task.priority === 'High' && (
            <span className="priority-high">
              <Flag size={12} aria-hidden="true" />
              High priority
            </span>
          )}
          {dueSoon && <span className="task-due-soon">Due soon</span>}
        </div>
      )}
      {personal && task.status === 'completed' && task.completedAt && (
        <p className="task-completion-time">
          Completed{' '}
          <time dateTime={task.completedAt}>
            {new Intl.DateTimeFormat(undefined, {
              timeZone: preferences.timeZone,
              hourCycle: preferences.timeFormat === '24h' ? 'h23' : 'h12',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(task.completedAt))}
          </time>
        </p>
      )}
      <div className="task-card-footer">
        {task.checklist.length > 0 && (
          <div className={personal ? 'task-checklist-summary' : undefined}>
            {onChecklistClick ? (
              <button
                type="button"
                className="checklist-count checklist-count-button"
                aria-label={`Open checklist: ${done} of ${task.checklist.length} production steps complete`}
                onClick={(event) => {
                  event.stopPropagation();
                  onChecklistClick();
                }}
              >
                <CheckCheck size={15} aria-hidden="true" />
                {done}/{task.checklist.length} steps
              </button>
            ) : (
              <span
                className="checklist-count"
                aria-label={`${done} of ${task.checklist.length} production steps complete`}
              >
                <CheckCheck size={15} aria-hidden="true" />
                {done}/{task.checklist.length} steps
              </span>
            )}
            {personal && (
              <progress
                className="task-checklist-progress"
                value={done}
                max={task.checklist.length}
                aria-label={`${Math.round((done / task.checklist.length) * 100)}% of checklist steps complete`}
              />
            )}
          </div>
        )}
        <div className="task-assignees">
          <div className="avatar-stack">
            {assigned.map((employee) => (
              <Avatar key={employee.id} employee={employee} small />
            ))}
          </div>
          <span>
            {assigned
              .map(
                (employee) =>
                  `${employee.name.split(' ')[0]}${employee.removed ? ' (removed)' : ''}`,
              )
              .join(', ')}
          </span>
          {!task.assigneeIds.length && task.status !== 'completed' && (
            <span className="task-unassigned">Unassigned</span>
          )}
        </div>
      </div>
    </article>
  );
}
