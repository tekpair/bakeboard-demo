'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar } from './ui';
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
import {
  CalendarClock,
  CakeSlice,
  ChefHat,
  ClipboardList,
  Columns3,
  CookingPot,
  FileText,
  Flag,
  Hash,
  ListChecks,
  Package,
  Plus,
  Ruler,
  StickyNote,
  Trash2,
  TriangleAlert,
  Truck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import type { Employee, ProductionTask, Status } from '@/lib/types';
import {
  parseProductionDateTime,
  productionDateTimeInput,
  productionTime,
} from '@/lib/production-dates';

import {
  pickupDate,
  productionDue,
  schedulingError,
  taskType,
} from '@/lib/task-production';

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
> & {
  assigneeIds: string[];
  orderId: string;
  productId: string;
  taskType: 'general_production' | 'customer_related';
  productionQuantity: string;
  size: string;
  flavor: string;
  pickupAt: string;
  allergyNotes: string;
};
type FieldErrors = Partial<
  Record<
    | 'productId'
    | 'title'
    | 'description'
    | 'customer'
    | 'deadline'
    | 'assigneeIds'
    | 'checklist'
    | 'productionQuantity'
    | 'pickupAt',
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
    taskType: task ? taskType(task) : 'general_production',
    productionQuantity: String(
      task?.productionQuantity ?? (Number.parseInt(task?.quantity ?? '') || 1),
    ),
    size: task?.size ?? '',
    flavor: task?.flavor ?? '',
    allergyNotes: task?.allergyNotes ?? '',
    pickupAt:
      task && (task.pickupAt ?? pickupDate(task))
        ? productionDateTimeInput(
            (task.pickupAt ?? pickupDate(task))!,
            formTimeZone,
          )
        : '',
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
      ? productionDateTimeInput(productionDue(task), formTimeZone)
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
    if (key === 'taskType') {
      setErrors({});
      return;
    }
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
    if (
      !Number.isSafeInteger(Number(draft.productionQuantity)) ||
      Number(draft.productionQuantity) < 1
    )
      nextErrors.productionQuantity = 'Enter a positive whole-number quantity.';
    if (!draft.deadline)
      nextErrors.deadline = 'Choose a production due date and time.';
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
      setErrors({ deadline: 'Enter a valid production due date and time.' });
      setError('Enter a valid due date and time.');
      return;
    }
    const pickup = draft.pickupAt
      ? parseProductionDateTime(
          draft.pickupAt,
          task ? (task.pickupAt ?? pickupDate(task)) : undefined,
          formTimeZone,
        )
      : undefined;
    if (draft.taskType === 'customer_related' && draft.pickupAt && !pickup) {
      setErrors({ pickupAt: 'Enter a valid pickup / delivery date and time.' });
      setError('Please fix the highlighted fields.');
      return;
    }
    const conflict =
      draft.taskType === 'customer_related'
        ? schedulingError(deadline.toISOString(), pickup?.toISOString())
        : '';
    if (conflict) {
      setErrors({ deadline: conflict, pickupAt: conflict });
      setError(conflict);
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
      taskType: draft.taskType,
      productionQuantity: Number(draft.productionQuantity),
      size: draft.size,
      flavor: draft.flavor,
      allergyNotes: draft.allergyNotes,
      quantity: task?.quantity,
      productionDue: deadline.toISOString(),
      pickupAt: pickup?.toISOString(),
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
            <h2 id="task-form-title">{task ? 'Edit task' : 'Create a Task'}</h2>
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
          <section
            className="task-form-group"
            aria-labelledby="task-details-heading"
          >
            <h3 id="task-details-heading" className="task-form-group-heading">
              <ClipboardList size={17} aria-hidden="true" />
              Task Details
            </h3>
            <fieldset className="task-type-selector form-field-full">
              <legend>Task type</legend>
              {(
                [
                  {
                    value: 'general_production',
                    label: 'General Production',
                    Icon: ChefHat,
                  },
                  {
                    value: 'customer_related',
                    label: 'Customer Production',
                    Icon: ClipboardList,
                  },
                ] as const
              ).map(({ value, label, Icon }) => (
                <label
                  key={value}
                  className={draft.taskType === value ? 'selected' : ''}
                >
                  <input
                    type="radio"
                    name="taskType"
                    value={value}
                    checked={draft.taskType === value}
                    onChange={() => update('taskType', value)}
                  />
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </label>
              ))}
            </fieldset>
            <label
              className={`form-field form-field-full ${errors.title ? 'has-error' : ''}`}
            >
              <span className="task-field-label">
                <ClipboardList size={15} aria-hidden="true" />
                Task Name
              </span>
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
              <span className="task-field-label">
                <FileText size={15} aria-hidden="true" />
                Description
              </span>
              <textarea
                className={errors.description ? 'field-invalid' : undefined}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? 'description-error' : undefined
                }
                rows={2}
                maxLength={500}
                value={draft.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="Describe what needs to be prepared or completed..."
              />
              {errors.description && (
                <span id="description-error" className="field-error">
                  {errors.description}
                </span>
              )}
            </label>
            <label
              className={`form-field ${errors.productId ? 'has-error' : ''}`}
            >
              <span className="task-field-label">
                <Package size={15} aria-hidden="true" />
                Product
              </span>
              <select
                value={draft.productId}
                aria-invalid={!!errors.productId}
                aria-describedby={
                  errors.productId ? 'product-error' : undefined
                }
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
                      disabled={
                        !isSelectableProduct(product, library.categories)
                      }
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
            {(['productionQuantity', 'size', 'flavor'] as const).map(
              (field) => (
                <label
                  className={`form-field ${errors[field as keyof FieldErrors] ? 'has-error' : ''}`}
                  key={field}
                >
                  <span className="task-field-label">
                    {field === 'productionQuantity' ? (
                      <Hash size={15} aria-hidden="true" />
                    ) : field === 'size' ? (
                      <Ruler size={15} aria-hidden="true" />
                    ) : (
                      <CakeSlice size={15} aria-hidden="true" />
                    )}
                    {field === 'productionQuantity'
                      ? 'Quantity'
                      : field === 'size'
                        ? 'Size / Dimensions'
                        : 'Flavor / Filling'}
                  </span>
                  <input
                    type={field === 'productionQuantity' ? 'number' : 'text'}
                    min={field === 'productionQuantity' ? 1 : undefined}
                    step={field === 'productionQuantity' ? 1 : undefined}
                    maxLength={150}
                    value={draft[field]}
                    aria-invalid={!!errors[field as keyof FieldErrors]}
                    onChange={(e) => update(field, e.target.value)}
                  />
                  {errors[field as keyof FieldErrors] && (
                    <span className="field-error">
                      {errors[field as keyof FieldErrors]}
                    </span>
                  )}
                </label>
              ),
            )}
            {draft.taskType === 'customer_related' && (
              <>
                <label
                  className={`form-field ${errors.customer ? 'has-error' : ''}`}
                >
                  <span className="task-field-label">
                    <UserRound size={15} aria-hidden="true" />
                    Customer Name
                  </span>
                  <input
                    className={errors.customer ? 'field-invalid' : undefined}
                    aria-invalid={Boolean(errors.customer)}
                    aria-describedby={
                      errors.customer ? 'customer-error' : undefined
                    }
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
                <label className="form-field">
                  <span className="task-field-label">
                    <Hash size={15} aria-hidden="true" />
                    Linked Order ID
                  </span>
                  <input
                    maxLength={50}
                    value={draft.orderId}
                    onChange={(event) => update('orderId', event.target.value)}
                    placeholder="External order reference"
                  />
                </label>
              </>
            )}
          </section>
          <section
            className="task-form-group"
            aria-labelledby="task-scheduling-heading"
          >
            <h3
              id="task-scheduling-heading"
              className="task-form-group-heading"
            >
              <CalendarClock size={17} aria-hidden="true" />
              Scheduling &amp; Assignment
            </h3>
            <label className="form-field">
              <span className="task-field-label">
                <CalendarClock size={15} aria-hidden="true" />
                Production Due
              </span>
              <input
                required
                type="datetime-local"
                className={errors.deadline ? 'field-invalid' : undefined}
                aria-invalid={Boolean(errors.deadline)}
                aria-describedby={
                  errors.deadline ? 'deadline-error' : undefined
                }
                value={draft.deadline}
                onChange={(event) => update('deadline', event.target.value)}
              />
              {errors.deadline && (
                <span id="deadline-error" className="field-error">
                  {errors.deadline}
                </span>
              )}
            </label>
            {draft.taskType === 'customer_related' && (
              <label
                className={`form-field ${errors.pickupAt ? 'has-error' : ''}`}
              >
                <span className="task-field-label">
                  <Truck size={15} aria-hidden="true" />
                  Pickup / Delivery Date &amp; Time
                </span>
                <input
                  type="datetime-local"
                  value={draft.pickupAt}
                  aria-invalid={!!errors.pickupAt}
                  onChange={(e) => update('pickupAt', e.target.value)}
                />
                {errors.pickupAt && (
                  <span className="field-error">{errors.pickupAt}</span>
                )}
              </label>
            )}
            <fieldset
              className={`staff-assignment form-field-full ${errors.assigneeIds ? 'has-error' : ''}`}
              aria-describedby={
                errors.assigneeIds ? 'assignee-error' : undefined
              }
            >
              <legend>
                <span className="task-field-label">
                  <UsersRound size={15} aria-hidden="true" />
                  Assign to Staff
                </span>
              </legend>
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
                      <span aria-hidden="true">
                        <Avatar employee={employee} small />
                      </span>
                      <span className="staff-choice-name">
                        {employee.name}
                        {employee.active === false && (
                          <small>Inactive · existing assignment</small>
                        )}
                      </span>
                    </label>
                  ))}
              </div>
              {!employees.some((employee) => employee.active !== false) && (
                <p className="field-error">
                  No active staff members. Reactivate or add a staff member
                  before assigning new work.
                </p>
              )}
              {errors.assigneeIds && (
                <span id="assignee-error" className="field-error">
                  {errors.assigneeIds}
                </span>
              )}
            </fieldset>
            <label className="form-field">
              <span className="task-field-label">
                <Flag size={15} aria-hidden="true" />
                Priority
              </span>
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
              <span className="task-field-label">
                <Columns3 size={15} aria-hidden="true" />
                Status
              </span>
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
          </section>
          <section
            className="task-form-group"
            aria-labelledby="task-instructions-heading"
          >
            <h3
              id="task-instructions-heading"
              className="task-form-group-heading"
            >
              <CookingPot size={17} aria-hidden="true" />
              Production Instructions
            </h3>
            <label className="form-field form-field-full task-allergy-field">
              <span className="task-field-label">
                <TriangleAlert size={15} aria-hidden="true" />
                Allergy Notes / Special Handling
              </span>
              <textarea
                rows={2}
                maxLength={2000}
                value={draft.allergyNotes}
                onChange={(e) => update('allergyNotes', e.target.value)}
                placeholder="Allergens, ingredient restrictions, cross-contact precautions, or special handling instructions..."
              />
            </label>
            <fieldset
              className={`checklist-editor form-field-full ${errors.checklist ? 'has-error' : ''}`}
            >
              <legend>
                <span className="task-field-label">
                  <ListChecks size={15} aria-hidden="true" />
                  Production Checklist
                </span>
              </legend>
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
                    aria-invalid={Boolean(
                      !step.label.trim() && errors.checklist,
                    )}
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
                <p className="field-error checklist-error">
                  {errors.checklist}
                </p>
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
              <span className="task-field-label">
                <StickyNote size={15} aria-hidden="true" />
                Internal Notes
              </span>
              <textarea
                rows={3}
                maxLength={1000}
                value={draft.notes}
                onChange={(event) => update('notes', event.target.value)}
                placeholder="Finishing, storage, and handoff notes for the team"
              />
            </label>
          </section>
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
