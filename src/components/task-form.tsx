'use client';

import { useEffect, useRef, useState } from 'react';
import { ChecklistTemplatePicker } from './checklist-template-picker';
import {
  recordCategory,
  isSelectableProduct,
  legacyProductId,
} from '@/lib/production-library';
import {
  useProductionLibraryData,
  useWorkspacePreferences,
} from './demo-session';
import { Plus, Trash2, X } from 'lucide-react';
import type { Employee, ProductionTask, Status } from '@/lib/types';
import {
  parseProductionDateTime,
  productionDateTimeInput,
  productionTime,
} from '@/lib/production-dates';

const statuses: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'progress', label: 'In Progress' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
];
type Draft = Pick<
  ProductionTask,
  | 'title'
  | 'description'
  | 'customer'
  | 'category'
  | 'categoryId'
  | 'deadline'
  | 'priority'
  | 'status'
  | 'checklist'
  | 'notes'
> & { assigneeIds: string[]; orderId: string; productId: string };
type FieldErrors = Partial<
  Record<
    | 'productId'
    | 'title'
    | 'description'
    | 'customer'
    | 'deadline'
    | 'assigneeIds'
    | 'checklist',
    string
  >
>;

export function TaskForm({
  task,
  initialDate,
  employees,
  workspaceId,
  existingIds,
  onSave,
  onClose,
}: {
  task?: ProductionTask;
  initialDate?: string;
  employees: Employee[];
  workspaceId: string;
  existingIds: string[];
  onSave: (task: ProductionTask) => void;
  onClose: () => void;
}) {
  const library = useProductionLibraryData();
  const initialProduct = task
    ? library.products.find(
        (product) =>
          product.id === (task.productId ?? legacyProductId(task.category)),
      )
    : library.products.find((product) =>
        isSelectableProduct(product, library.categories),
      );
  const preferences = useWorkspacePreferences();
  const [formTimeZone] = useState(preferences.timeZone);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [draft, setDraft] = useState<Draft>(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    customer: task?.customer ?? '',
    category: task?.category ?? initialProduct?.category ?? 'Cakes',
    categoryId:
      task?.categoryId ??
      recordCategory(initialProduct ?? {}, library.categories)?.id,
    productId: task
      ? (task.productId ?? legacyProductId(task.category))
      : (initialProduct?.id ?? ''),
    deadline: task
      ? productionDateTimeInput(task.deadline, formTimeZone)
      : initialDate
        ? `${initialDate}T09:00`
        : productionDateTimeInput(Date.now() + 3_600_000, formTimeZone),
    priority: task?.priority ?? preferences.defaultPriority,
    status: task?.status ?? 'todo',
    assigneeIds: task?.assigneeIds ?? [],
    checklist: task?.checklist.map((item) => ({ ...item })) ?? [],
    orderId: task?.orderId ?? '',
    notes: task?.notes ?? '',
  }));
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, []);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
    if (key === 'checklist') {
      const checklist = value as Draft['checklist'];
      setErrors((current) => {
        const next = { ...current };
        if (checklist.some((item) => !item.label.trim())) {
          next.checklist = 'Add a description or remove each empty step.';
        } else {
          delete next.checklist;
        }
        return next;
      });
      return;
    }
    setErrors((current) => {
      const next = { ...current };
      delete next[key as keyof FieldErrors];
      return next;
    });
  };
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    const nextErrors: FieldErrors = {};
    const selectedProduct = library.products.find(
      (product) => product.id === draft.productId,
    );
    const originalProductId = task
      ? (task.productId ?? legacyProductId(task.category))
      : undefined;
    if (
      ((!selectedProduct ||
        !isSelectableProduct(selectedProduct, library.categories)) &&
        draft.productId !== originalProductId) ||
      !draft.productId
    )
      nextErrors.productId = 'Choose an active product.';
    if (
      draft.assigneeIds.some(
        (id) =>
          !task?.assigneeIds.includes(id) &&
          !employees.some(
            (person) => person.id === id && person.active !== false,
          ),
      )
    )
      nextErrors.assigneeIds = 'New assignments must use active staff members.';
    if (!title) nextErrors.title = 'Enter a task name.';
    if (!draft.description.trim())
      nextErrors.description = 'Add a short description.';
    if (!draft.customer.trim())
      nextErrors.customer = 'Enter the customer name.';
    if (!draft.deadline) nextErrors.deadline = 'Choose a pickup date and time.';
    if (!task && !draft.assigneeIds.length)
      nextErrors.assigneeIds = 'Choose at least one staff member.';
    if (draft.checklist.some((item) => !item.label.trim()))
      nextErrors.checklist = 'Add a description or remove each empty step.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setError('Please fix the highlighted fields before saving.');
      return;
    }
    setErrors({});
    const deadline = parseProductionDateTime(
      draft.deadline,
      task?.deadline,
      formTimeZone,
    );
    if (!deadline) {
      setErrors({ deadline: 'Enter a valid pickup date and time.' });
      setError('Enter a valid due date and time.');
      return;
    }
    const id =
      task?.id ?? 'BB-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    if (!task && existingIds.includes(id)) {
      setError('Please try again to create a unique task ID.');
      return;
    }
    onSave({
      id,
      workspaceId: task?.workspaceId ?? workspaceId,
      title,
      description: draft.description.trim(),
      customer: draft.customer.trim(),
      category: draft.category,
      categoryId: draft.categoryId,
      productId: draft.productId,
      productName: selectedProduct?.name ?? task?.productName ?? draft.category,
      quantity: task?.quantity,
      deadline: deadline.toISOString(),
      pickupTime: productionTime(
        deadline,
        formTimeZone,
        preferences.timeFormat,
      ),
      priority: draft.priority,
      status: draft.status,
      assigneeIds: draft.assigneeIds,
      formerAssignees: task?.formerAssignees,
      checklist: draft.checklist.map((item) => ({
        label: item.label.trim(),
        done: item.done,
      })),
      orderId: draft.orderId.trim() || undefined,
      notes: draft.notes.trim(),
    });
  }
  return (
    <dialog
      ref={dialogRef}
      className="task-modal slide-panel"
      aria-labelledby="task-form-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="task-modal-content task-form-content">
        <header className="slide-panel-header">
          <div>
            <p className="detail-reference">
              {task ? 'EDIT TASK' : 'NEW PRODUCTION TASK'}
            </p>
            <h2 id="task-form-title">{task ? 'Edit task' : 'Create a task'}</h2>
          </div>
          <button
            className="icon-button modal-close"
            type="button"
            aria-label="Close task form"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        <form onSubmit={submit} className="task-form" noValidate>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <label
            className={`form-field form-field-full ${errors.title ? 'has-error' : ''}`}
          >
            Task name{' '}
            <input
              required
              className={errors.title ? 'field-invalid' : undefined}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              maxLength={100}
              value={draft.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="e.g. Lemon layer cake"
            />
            {errors.title && (
              <span id="title-error" className="field-error">
                {errors.title}
              </span>
            )}
          </label>
          <label
            className={`form-field form-field-full ${errors.description ? 'has-error' : ''}`}
          >
            Description{' '}
            <textarea
              required
              className={errors.description ? 'field-invalid' : undefined}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'description-error' : undefined
              }
              rows={2}
              maxLength={500}
              value={draft.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Production details and finishing instructions"
            />
            {errors.description && (
              <span id="description-error" className="field-error">
                {errors.description}
              </span>
            )}
          </label>
          <label className={`form-field ${errors.customer ? 'has-error' : ''}`}>
            Customer name{' '}
            <input
              required
              className={errors.customer ? 'field-invalid' : undefined}
              aria-invalid={Boolean(errors.customer)}
              aria-describedby={errors.customer ? 'customer-error' : undefined}
              maxLength={100}
              value={draft.customer}
              onChange={(event) => update('customer', event.target.value)}
              placeholder="Customer or counter"
            />
            {errors.customer && (
              <span id="customer-error" className="field-error">
                {errors.customer}
              </span>
            )}
          </label>
          <label
            className={`form-field ${errors.productId ? 'has-error' : ''}`}
          >
            Product
            <select
              value={draft.productId}
              aria-invalid={!!errors.productId}
              aria-describedby={errors.productId ? 'product-error' : undefined}
              className={errors.productId ? 'field-invalid' : undefined}
              onChange={(event) => {
                const product = library.products.find(
                  (item) => item.id === event.target.value,
                );
                if (product) {
                  update('productId', product.id);
                  update(
                    'category',
                    recordCategory(product, library.categories)?.name ??
                      product.category,
                  );
                  update(
                    'categoryId',
                    recordCategory(product, library.categories)?.id,
                  );
                }
              }}
            >
              {!draft.productId && (
                <option value="">No active products available</option>
              )}
              {library.products
                .filter(
                  (product) =>
                    isSelectableProduct(product, library.categories) ||
                    product.id ===
                      (task?.productId ??
                        (task ? legacyProductId(task.category) : undefined)),
                )
                .map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                    disabled={!isSelectableProduct(product, library.categories)}
                  >
                    {product.name}
                    {!isSelectableProduct(product, library.categories)
                      ? ' (Inactive · existing product/category)'
                      : ''}
                  </option>
                ))}
              {draft.productId &&
                !library.products.some(
                  (product) => product.id === draft.productId,
                ) && (
                  <option value={draft.productId} disabled>
                    {task?.productName ?? task?.category} (unavailable)
                  </option>
                )}
            </select>
            {errors.productId && (
              <span id="product-error" className="field-error">
                {errors.productId}
              </span>
            )}
          </label>
          <label className="form-field">
            Date / pickup time ({formTimeZone}){' '}
            <input
              required
              type="datetime-local"
              className={errors.deadline ? 'field-invalid' : undefined}
              aria-invalid={Boolean(errors.deadline)}
              aria-describedby={errors.deadline ? 'deadline-error' : undefined}
              value={draft.deadline}
              onChange={(event) => update('deadline', event.target.value)}
            />
            {errors.deadline && (
              <span id="deadline-error" className="field-error">
                {errors.deadline}
              </span>
            )}
          </label>
          <fieldset
            className={`staff-assignment form-field-full ${errors.assigneeIds ? 'has-error' : ''}`}
            aria-describedby={errors.assigneeIds ? 'assignee-error' : undefined}
          >
            <legend>Assign to staff</legend>
            <div className="staff-assignment-options">
              {employees
                .filter(
                  (employee) =>
                    employee.active !== false ||
                    task?.assigneeIds.includes(employee.id),
                )
                .map((employee) => (
                  <label key={employee.id}>
                    <input
                      type="checkbox"
                      disabled={employee.active === false}
                      checked={draft.assigneeIds.includes(employee.id)}
                      onChange={(event) => {
                        const assigneeIds = event.target.checked
                          ? [...draft.assigneeIds, employee.id]
                          : draft.assigneeIds.filter(
                              (id) => id !== employee.id,
                            );
                        update('assigneeIds', assigneeIds);
                      }}
                    />
                    {employee.name}
                    {employee.active === false
                      ? ' (Inactive · existing assignment)'
                      : ''}
                  </label>
                ))}
            </div>
            {!employees.some((employee) => employee.active !== false) && (
              <p className="field-error">
                No active staff members. Reactivate or add a staff member before
                assigning new work.
              </p>
            )}
            {errors.assigneeIds && (
              <span id="assignee-error" className="field-error">
                {errors.assigneeIds}
              </span>
            )}
          </fieldset>
          <label className="form-field">
            Priority{' '}
            <select
              value={draft.priority}
              onChange={(event) =>
                update('priority', event.target.value as Draft['priority'])
              }
            >
              <option>Low</option>
              <option>Normal</option>
              <option>High</option>
            </select>
          </label>
          <label className="form-field">
            Status{' '}
            <select
              value={draft.status}
              onChange={(event) =>
                update('status', event.target.value as Status)
              }
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Customer order reference (optional){' '}
            <input
              maxLength={50}
              value={draft.orderId}
              onChange={(event) => update('orderId', event.target.value)}
              placeholder="Optional"
            />
          </label>
          <fieldset
            className={`checklist-editor form-field-full ${errors.checklist ? 'has-error' : ''}`}
          >
            <legend>Production checklist (optional)</legend>
            <ChecklistTemplatePicker
              task={task}
              checklist={draft.checklist}
              onApply={(steps) => update('checklist', steps)}
            />
            {draft.checklist.map((step, index) => (
              <div className="checklist-edit-row" key={index}>
                <input
                  aria-label={'Checklist step ' + (index + 1)}
                  maxLength={100}
                  className={
                    !step.label.trim() && errors.checklist
                      ? 'field-invalid'
                      : undefined
                  }
                  aria-invalid={Boolean(!step.label.trim() && errors.checklist)}
                  value={step.label}
                  onChange={(event) =>
                    update(
                      'checklist',
                      draft.checklist.map((item, i) =>
                        i === index
                          ? { ...item, label: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
                <label className="checklist-done">
                  <input
                    type="checkbox"
                    checked={step.done}
                    onChange={(event) =>
                      update(
                        'checklist',
                        draft.checklist.map((item, i) =>
                          i === index
                            ? { ...item, done: event.target.checked }
                            : item,
                        ),
                      )
                    }
                  />
                  Done
                </label>
                <button
                  className="icon-button checklist-remove"
                  type="button"
                  aria-label={'Remove checklist step ' + (index + 1)}
                  onClick={() =>
                    update(
                      'checklist',
                      draft.checklist.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {errors.checklist && (
              <p className="field-error checklist-error">{errors.checklist}</p>
            )}
            <button
              className="add-checklist-step"
              type="button"
              onClick={() =>
                update('checklist', [
                  ...draft.checklist,
                  { label: '', done: false },
                ])
              }
            >
              <Plus size={15} /> Add a checklist step
            </button>
          </fieldset>
          <label className="form-field form-field-full">
            Internal notes (optional){' '}
            <textarea
              rows={3}
              maxLength={1000}
              value={draft.notes}
              onChange={(event) => update('notes', event.target.value)}
              placeholder="Finishing, storage, and handoff notes for the team"
            />
          </label>
          <footer className="task-form-footer">
            <button
              className="button button-outline"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              {task ? 'Save changes' : 'Create task'}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
