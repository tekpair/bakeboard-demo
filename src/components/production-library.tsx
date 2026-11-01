'use client';
import { useEffect, useId, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Copy,
  ArrowUp,
  ArrowDown,
  Trash2,
  BookOpen,
  CakeSlice,
  FolderOpen,
  Sparkles,
  ClipboardList,
  FileText,
  ListChecks,
  ToggleRight,
} from 'lucide-react';
import { useDemoSession } from './demo-session';
import { useDemoTasks } from '@/lib/use-demo-tasks';
import { hasCapability } from '@/lib/permissions';
import { hasPlanCapability } from '@/lib/entitlements';
import {
  productTaskCount,
  validateProduct,
  validateTemplate,
  validateCategory,
  recordCategory,
  categoryName,
  categoryProductCount,
} from '@/lib/production-library';
import {
  type Product,
  type ProductCategory,
  type ChecklistTemplate,
  type ProductionTask,
  type LibraryKind,
} from '@/lib/types';
import { SlidePanel } from './slide-panel';
import { PlusPreview } from './plus-preview';
import { useToast } from './toast-provider';

type Kind = LibraryKind;
const itemLabel = (kind: Kind) =>
  kind === 'products'
    ? 'Product'
    : kind === 'categories'
      ? 'Category'
      : 'Checklist template';
const libraryTabs: Kind[] = ['products', 'categories', 'templates'];
export function ProductionLibraryPage({
  initialTasks,
}: {
  initialTasks: ProductionTask[];
}) {
  const showToast = useToast();
  const session = useDemoSession();
  const demo = useDemoTasks(initialTasks);
  const [tab, setTab] = useState<Kind>('products');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('all');
  const [editor, setEditor] = useState<{
    kind: Kind;
    record?: Product | ChecklistTemplate | ProductCategory;
  } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: Kind; id: string } | null>(
    null,
  );
  if (
    session.accessRevoked ||
    !hasCapability(session.role, 'viewProductionLibrary')
  )
    return (
      <main id="main" className="dashboard-main">
        <h1>This section is restricted</h1>
      </main>
    );
  const premium = hasPlanCapability(session.plan, 'templates');
  const records =
    tab === 'products'
      ? session.library.products
      : tab === 'categories'
        ? session.library.categories
        : session.library.templates;
  const matching = records.filter(
    (record) =>
      (!search ||
        `${record.name} ${record.description}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase())) &&
      (!category ||
        ('category' in record &&
          recordCategory(
            record as Product | ChecklistTemplate,
            session.library.categories,
          )?.id === category)) &&
      (status === 'all' || record.active === (status === 'active')),
  );
  function changeTab(next: Kind) {
    setTab(next);
    setSearch('');
    setCategory('');
    setStatus('all');
    setEditor(null);
  }
  function duplicate(kind: Kind, id: string) {
    const result = session.duplicateLibraryItem(kind, id);
    showToast(
      result.error ? 'error' : 'success',
      result.error ?? `${itemLabel(kind)} duplicated.`,
    );
  }
  function moveRecord(id: string, adjacentId: string) {
    const result = session.moveLibraryItem(tab, id, adjacentId);
    if (result.error) showToast('error', result.error);
  }
  const deleteRecord = deleting
    ? session.library[deleting.kind].find((item) => item.id === deleting.id)
    : undefined;
  return (
    <main id="main" className="dashboard-main library-page">
      <header className="page-heading library-heading">
        <div>
          <h1>Production Library</h1>
          <p>
            Manage your bakery&apos;s products, categories, and reusable
            production checklists.
          </p>
        </div>
        {(tab !== 'templates' || premium) && (
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setEditor({ kind: tab });
            }}
          >
            <Plus size={16} />
            {tab === 'products'
              ? 'Add Product'
              : tab === 'categories'
                ? 'Add Category'
                : 'Create Template'}
          </button>
        )}
      </header>
      <div
        className="library-tabs"
        role="tablist"
        aria-label="Production Library"
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
            return;
          event.preventDefault();
          const index = libraryTabs.indexOf(tab);
          const next =
            event.key === 'Home'
              ? libraryTabs[0]
              : event.key === 'End'
                ? libraryTabs[2]
                : libraryTabs[
                    (index + (event.key === 'ArrowLeft' ? -1 : 1) + 3) % 3
                  ];
          changeTab(next);
          requestAnimationFrame(() =>
            document.getElementById(`${next}-tab`)?.focus(),
          );
        }}
      >
        <button
          id="products-tab"
          type="button"
          role="tab"
          tabIndex={tab === 'products' ? 0 : -1}
          aria-selected={tab === 'products'}
          aria-controls="library-content"
          onClick={() => changeTab('products')}
        >
          Products
        </button>
        <button
          id="categories-tab"
          type="button"
          role="tab"
          tabIndex={tab === 'categories' ? 0 : -1}
          aria-selected={tab === 'categories'}
          aria-controls="library-content"
          onClick={() => changeTab('categories')}
        >
          Categories
        </button>
        <button
          id="templates-tab"
          type="button"
          role="tab"
          tabIndex={tab === 'templates' ? 0 : -1}
          aria-selected={tab === 'templates'}
          aria-controls="library-content"
          onClick={() => changeTab('templates')}
        >
          {!premium && <Sparkles size={15} aria-hidden="true" />}
          Checklist Templates
        </button>
      </div>
      <section
        id="library-content"
        role="tabpanel"
        aria-labelledby={`${tab}-tab`}
      >
        {tab === 'templates' && !premium ? (
          <PlusPreview title="Save Time With Reusable Checklists">
            Create your production checklist once and reuse it whenever you need
            it with BakeBoard Plus.
          </PlusPreview>
        ) : (
          <>
            <div className="library-toolbar">
              <label className="library-search">
                <Search size={16} />
                <input
                  aria-label={`Search ${tab}`}
                  placeholder={
                    tab === 'products'
                      ? 'Search products'
                      : tab === 'categories'
                        ? 'Search categories'
                        : 'Search templates'
                  }
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              {tab !== 'categories' && (
                <select
                  aria-label="Filter library by category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">All categories</option>
                  {session.library.categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {!item.active ? ' (Inactive)' : ''}
                    </option>
                  ))}
                </select>
              )}
              <select
                aria-label="Filter library by active status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {matching.length ? (
              <ul className="library-list">
                {matching.map((record, index) => (
                  <li
                    key={record.id}
                    className={`library-row ${tab === 'categories' ? 'library-category-row' : ''} ${!record.active ? 'library-inactive' : ''}`}
                  >
                    <button
                      type="button"
                      className="library-record-main"
                      aria-label={`Edit ${record.name}`}
                      onClick={() => setEditor({ kind: tab, record })}
                    >
                      <span className="library-record-icon">
                        {tab === 'products' ? (
                          <CakeSlice size={19} />
                        ) : tab === 'categories' ? (
                          <FolderOpen size={19} />
                        ) : (
                          <BookOpen size={19} />
                        )}
                      </span>
                      <span>
                        <span className="library-record-category">
                          {tab === 'categories'
                            ? 'Product category'
                            : categoryName(
                                record as Product | ChecklistTemplate,
                                session.library.categories,
                              ) || 'All categories'}
                          {'category' in record &&
                          recordCategory(
                            record as Product | ChecklistTemplate,
                            session.library.categories,
                          )?.active === false
                            ? ' · Inactive category'
                            : ''}
                        </span>
                        <strong>{record.name}</strong>
                        {record.description && (
                          <span className="library-record-description">
                            {record.description}
                          </span>
                        )}
                      </span>
                    </button>
                    <div className="library-record-meta">
                      <span
                        className={`library-state ${record.active ? '' : 'library-state-inactive'}`}
                      >
                        {record.active ? 'Active' : 'Inactive'}
                      </span>
                      <small>
                        {tab === 'products'
                          ? `${productTaskCount(record.id, demo.tasks)} ${productTaskCount(record.id, demo.tasks) === 1 ? 'task' : 'tasks'}`
                          : tab === 'categories'
                            ? `${categoryProductCount(record.id, session.library.products, session.library.categories)} ${categoryProductCount(record.id, session.library.products, session.library.categories) === 1 ? 'product' : 'products'}`
                            : `${(record as ChecklistTemplate).steps.length} steps`}
                      </small>
                    </div>
                    <div className="library-record-actions">
                      <div className="library-reorder-actions">
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Move ${record.name} up`}
                          title="Move up"
                          disabled={index === 0}
                          onClick={() =>
                            moveRecord(record.id, matching[index - 1].id)
                          }
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Move ${record.name} down`}
                          title="Move down"
                          disabled={index === matching.length - 1}
                          onClick={() =>
                            moveRecord(record.id, matching[index + 1].id)
                          }
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Duplicate ${record.name}`}
                        title={`Duplicate ${itemLabel(tab).toLowerCase()}`}
                        onClick={() => duplicate(tab, record.id)}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Edit ${record.name} details`}
                        title="Edit"
                        onClick={() => setEditor({ kind: tab, record })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button library-delete-icon"
                        aria-label={`Delete ${record.name}`}
                        title={`Delete ${itemLabel(tab).toLowerCase()}`}
                        onClick={() =>
                          setDeleting({ kind: tab, id: record.id })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="library-empty">
                <h2>
                  {records.length
                    ? 'No matching results'
                    : tab === 'products'
                      ? 'No products yet'
                      : tab === 'categories'
                        ? 'No product categories yet'
                        : 'No checklist templates yet'}
                </h2>
                <p>
                  {records.length
                    ? 'Try a different search or filter.'
                    : tab === 'products'
                      ? 'Add the products your bakery makes.'
                      : tab === 'categories'
                        ? 'Add a category to organize your bakery products.'
                        : 'Save a workflow to reuse its steps on production tasks.'}
                </p>
                {records.length > 0 && (
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => {
                      setSearch('');
                      setCategory('');
                      setStatus('all');
                    }}
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>
      {editor && (editor.kind !== 'templates' || premium) && (
        <LibraryEditor
          key={`${editor.kind}-${editor.record?.id ?? 'new'}`}
          kind={editor.kind}
          record={editor.record}
          categories={session.library.categories}
          onClose={() => setEditor(null)}
          onDelete={
            editor.record
              ? () => setDeleting({ kind: editor.kind, id: editor.record!.id })
              : undefined
          }
          onSave={(value) => {
            const result =
              editor.kind === 'products'
                ? session.saveProduct(value as Product)
                : editor.kind === 'categories'
                  ? session.saveCategory(value as ProductCategory)
                  : session.saveTemplate(value as ChecklistTemplate);
            if (!result.error) {
              setEditor(null);
              showToast(
                'success',
                editor.kind === 'products'
                  ? 'Product saved.'
                  : editor.kind === 'categories'
                    ? 'Category saved.'
                    : 'Checklist template saved.',
              );
            }
            return result;
          }}
          workspaceId={session.workspaceSettings.id}
        />
      )}
      {deleting &&
        deleteRecord &&
        (deleting.kind !== 'templates' || premium) && (
          <LibraryDeleteDialog
            key={`delete-${deleting.kind}-${deleting.id}`}
            kind={deleting.kind}
            name={deleteRecord.name}
            categories={session.library.categories.filter(
              (item) => item.id !== deleting.id && item.active,
            )}
            productCount={
              deleting.kind === 'categories'
                ? categoryProductCount(
                    deleting.id,
                    session.library.products,
                    session.library.categories,
                  )
                : 0
            }
            onClose={() => setDeleting(null)}
            onDelete={(replacement) => {
              const result = session.deleteLibraryItem(
                deleting.kind,
                deleting.id,
                replacement,
              );
              if (!result.error) {
                if (
                  editor?.kind === deleting.kind &&
                  editor.record?.id === deleting.id
                )
                  requestAnimationFrame(() => setEditor(null));
                setDeleting(null);
                showToast('success', `${itemLabel(deleting.kind)} deleted.`);
                if (category === deleting.id) setCategory('');
              }
              return result.error;
            }}
          />
        )}
    </main>
  );
}
function LibraryEditor({
  kind,
  record,
  workspaceId,
  categories,
  onClose,
  onDelete,
  onSave,
}: {
  kind: Kind;
  record?: Product | ChecklistTemplate | ProductCategory;
  workspaceId: string;
  categories: ProductCategory[];
  onClose: () => void;
  onDelete?: () => void;
  onSave: (value: Product | ChecklistTemplate | ProductCategory) => {
    error?: string;
    errors?: Record<string, string>;
  };
}) {
  const [id] = useState(
    () =>
      record?.id ??
      `${kind === 'products' ? 'product' : kind === 'categories' ? 'category' : 'template'}-${crypto.randomUUID()}`,
  );
  const [name, setName] = useState(record?.name ?? '');
  const [description, setDescription] = useState(record?.description ?? '');
  const [category, setCategory] = useState(
    record && 'category' in record
      ? (recordCategory(record, categories)?.id ?? '')
      : kind === 'products'
        ? (categories.find((item) => item.active)?.id ?? '')
        : '',
  );
  const [active, setActive] = useState(record?.active ?? true);
  const [steps, setSteps] = useState(() =>
    kind === 'templates'
      ? ((record as ChecklistTemplate | undefined)?.steps ?? ['']).map(
          (label) => ({ id: crypto.randomUUID(), label }),
        )
      : [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const ref = useRef<HTMLFormElement>(null);
  const errorId = useId();
  function move(index: number, delta: number) {
    setSteps((current) => {
      const copy = [...current];
      [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
      return copy;
    });
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const common = { id, workspaceId, name, description, active };
    const selectedCategory = categories.find((item) => item.id === category);
    const value =
      kind === 'categories'
        ? common
        : kind === 'products'
          ? {
              ...common,
              category: selectedCategory?.name ?? '',
              categoryId: selectedCategory?.id,
            }
          : {
              ...common,
              category: selectedCategory?.name,
              categoryId: selectedCategory?.id,
              steps: steps.map((step) => step.label),
            };
    const validation =
      kind === 'products'
        ? validateProduct(value as Product, categories)
        : kind === 'categories'
          ? validateCategory(value as ProductCategory)
          : validateTemplate(value as ChecklistTemplate, categories);
    setErrors(validation);
    if (Object.keys(validation).length) {
      setMessage('Please fix the highlighted fields.');
      requestAnimationFrame(() =>
        ref.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const result = onSave(value);
    if (result.error) {
      setErrors(result.errors ?? {});
      setMessage(result.error);
    }
  }
  return (
    <SlidePanel
      className="library-editor-panel"
      label="PRODUCTION LIBRARY"
      title={`${record ? 'Edit' : kind !== 'templates' ? 'Add' : 'Create'} ${kind === 'products' ? 'product' : kind === 'categories' ? 'category' : 'checklist template'}`}
      onClose={onClose}
      closeLabel="Close library panel"
    >
      <form
        className="task-form library-form"
        ref={ref}
        onSubmit={submit}
        noValidate
      >
        <div className="library-form-fields">
          {message && (
            <p className="form-error form-field-full" role="alert">
              {message}
            </p>
          )}
          <label
            className={`form-field form-field-full ${errors.name ? 'has-error' : ''}`}
          >
            <span className="task-field-label">
              {kind === 'products' ? (
                <CakeSlice size={15} aria-hidden="true" />
              ) : kind === 'categories' ? (
                <FolderOpen size={15} aria-hidden="true" />
              ) : (
                <ClipboardList size={15} aria-hidden="true" />
              )}
              {kind === 'products'
                ? 'Product Name'
                : kind === 'categories'
                  ? 'Category Name'
                  : 'Template Name'}{' '}
              *
            </span>
            <input
              required
              value={name}
              maxLength={kind === 'categories' ? 50 : 80}
              className={errors.name ? 'field-invalid' : undefined}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${errorId}-name` : undefined}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: '' }));
              }}
            />
            {errors.name && (
              <span className="field-error" id={`${errorId}-name`}>
                {errors.name}
              </span>
            )}
          </label>
          {kind !== 'categories' && (
            <label className="form-field form-field-full">
              <span className="task-field-label">
                <FolderOpen size={15} aria-hidden="true" />
                Product Category{kind === 'products' ? ' *' : ''}
              </span>
              <select
                value={category}
                aria-invalid={!!errors.category}
                className={errors.category ? 'field-invalid' : undefined}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">
                  {kind === 'templates'
                    ? 'All categories'
                    : 'Choose a category'}
                </option>
                {categories
                  .filter(
                    (item) =>
                      item.active ||
                      (record &&
                        'category' in record &&
                        recordCategory(record, categories)?.id === item.id),
                  )
                  .map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      disabled={!item.active}
                    >
                      {item.name}
                      {!item.active ? ' (Inactive · existing category)' : ''}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <span className="field-error">{errors.category}</span>
              )}
            </label>
          )}
          <label className="form-field form-field-full">
            <span className="task-field-label">
              <FileText size={15} aria-hidden="true" />
              Description
            </span>
            <textarea
              value={description}
              rows={3}
              maxLength={500}
              className={errors.description ? 'field-invalid' : undefined}
              aria-invalid={!!errors.description}
              onChange={(event) => setDescription(event.target.value)}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </label>
          <label className="form-field form-field-full">
            <span className="task-field-label">
              <ToggleRight size={15} aria-hidden="true" />
              Status
            </span>
            <select
              value={active ? 'active' : 'inactive'}
              onChange={(event) => setActive(event.target.value === 'active')}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          {kind === 'templates' && (
            <fieldset
              className={`library-step-editor form-field-full ${errors.steps ? 'has-error' : ''}`}
            >
              <legend>
                <span className="task-field-label">
                  <ListChecks size={15} aria-hidden="true" />
                  Checklist Steps
                </span>
              </legend>
              {steps.map((step, index) => (
                <div className="library-step-row" key={step.id}>
                  <span>{index + 1}</span>
                  <input
                    className={
                      !step.label.trim() && errors.steps
                        ? 'field-invalid'
                        : undefined
                    }
                    aria-label={`Template step ${index + 1}`}
                    aria-invalid={!!errors.steps && !step.label.trim()}
                    value={step.label}
                    maxLength={100}
                    onChange={(event) =>
                      setSteps((current) =>
                        current.map((item) =>
                          item.id === step.id
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <div>
                    <button
                      type="button"
                      className="icon-button"
                      disabled={index === 0}
                      aria-label={`Move step ${index + 1} up`}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      disabled={index === steps.length - 1}
                      aria-label={`Move step ${index + 1} down`}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Remove step ${index + 1}`}
                      onClick={() =>
                        setSteps((current) =>
                          current.filter((item) => item.id !== step.id),
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {errors.steps && (
                <p role="alert" className="field-error">
                  {errors.steps}
                </p>
              )}
              <button
                type="button"
                className="add-checklist-step"
                disabled={steps.length >= 50}
                onClick={() =>
                  setSteps((current) => [
                    ...current,
                    { id: crypto.randomUUID(), label: '' },
                  ])
                }
              >
                <Plus size={15} />
                Add step
              </button>
            </fieldset>
          )}
          {kind === 'categories' && (
            <p className="settings-note form-field-full">
              Inactive categories stay on existing work and aren’t offered for
              new products or tasks.
            </p>
          )}
        </div>
        <footer className="task-form-footer">
          {onDelete && (
            <button
              type="button"
              className="button button-outline library-editor-delete"
              aria-label={`Delete ${itemLabel(kind).toLowerCase()}`}
              onClick={onDelete}
            >
              <Trash2 size={16} /> <span>Delete</span>
            </button>
          )}
          <button
            type="button"
            className="button button-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="button button-primary">
            Save{' '}
            {kind === 'products'
              ? 'product'
              : kind === 'categories'
                ? 'category'
                : 'template'}
          </button>
        </footer>
      </form>
    </SlidePanel>
  );
}

function LibraryDeleteDialog({
  kind,
  name,
  categories,
  productCount,
  onClose,
  onDelete,
}: {
  kind: Kind;
  name: string;
  categories: ProductCategory[];
  productCount: number;
  onClose: () => void;
  onDelete: (replacement?: string) => string | undefined;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();
  const [replacement, setReplacement] = useState('');
  const [error, setError] = useState('');
  const needsReplacement = kind === 'categories' && productCount > 0;
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.showModal();
    ref.current
      ?.querySelector<HTMLButtonElement>('button[type="button"]')
      ?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="task-modal library-delete-dialog"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="task-modal-content"
        onSubmit={(event) => {
          event.preventDefault();
          setError(onDelete(replacement || undefined) ?? '');
        }}
      >
        <h2 id={headingId}>Delete {itemLabel(kind).toLowerCase()}?</h2>
        <p className="library-delete-name">{name}</p>
        <p id={descriptionId}>
          {kind === 'templates'
            ? 'Existing task checklists will stay unchanged.'
            : kind === 'categories'
              ? 'Existing tasks will keep their category details. Checklist templates using this category will become uncategorized.'
              : 'Existing tasks will keep their product details and checklist progress.'}{' '}
          This cannot be undone.
        </p>
        {needsReplacement &&
          (categories.length ? (
            <label className="form-field">
              Move{' '}
              {productCount === 1 ? '1 product' : `${productCount} products`} to
              <select
                value={replacement}
                required
                onChange={(event) => {
                  setReplacement(event.target.value);
                  setError('');
                }}
              >
                <option value="">Choose a category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="field-error" role="alert">
              Add another active category before deleting a category that
              contains products.
            </p>
          ))}
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="library-delete-actions">
          <button
            type="button"
            className="button button-outline"
            autoFocus
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button library-confirm-delete"
            disabled={
              needsReplacement &&
              (!replacement ||
                !categories.some((item) => item.id === replacement))
            }
          >
            <Trash2 size={16} /> Delete {itemLabel(kind).toLowerCase()}
          </button>
        </div>
      </form>
    </dialog>
  );
}
