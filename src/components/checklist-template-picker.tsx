'use client';
import { useState } from 'react';
import { useOptionalDemoSession } from './demo-session';
import { hasPlanCapability } from '@/lib/entitlements';
import { hasCapability } from '@/lib/permissions';
import { applyStoredChecklistTemplate } from '@/lib/task-storage';
import type { ProductionTask } from '@/lib/types';
export function ChecklistTemplatePicker({
  task,
  checklist,
  onApply,
}: {
  task?: ProductionTask;
  checklist: ProductionTask['checklist'];
  onApply: (steps: ProductionTask['checklist']) => void;
}) {
  const session = useOptionalDemoSession();
  const [selected, setSelected] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  if (
    !session ||
    session.accessRevoked ||
    !hasPlanCapability(session.plan, 'templates') ||
    !(task
      ? hasCapability(session.role, 'editTasks') ||
        hasCapability(session.role, 'completeChecklist', {
          employeeId: session.employee.id,
          task,
        })
      : hasCapability(session.role, 'createTasks'))
  )
    return null;
  const templates = session.library.templates.filter((item) => item.active);
  if (!templates.length) return null;
  function apply(confirmed = false) {
    if (!session) return;
    if (checklist.length && !confirmed) {
      setConfirm(true);
      return;
    }
    const result = applyStoredChecklistTemplate(
      session.role,
      session.employee.id,
      task,
      selected,
      checklist,
      confirmed,
    );
    if (result.error) {
      setError(result.error);
      setConfirm(false);
      return;
    }
    onApply(result.checklist!);
    setConfirm(false);
    setSelected('');
    setError('');
  }
  return (
    <div className="checklist-template-picker">
      <div className="template-picker-controls">
        <label>
          Saved checklist template
          <select
            aria-label="Saved checklist template"
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value);
              setConfirm(false);
              setError('');
            }}
          >
            <option value="">Choose a template</option>
            {templates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button button-outline"
          disabled={!selected}
          onClick={() => apply()}
        >
          Apply template
        </button>
      </div>
      {confirm && (
        <div
          className="template-replace-confirm"
          role="group"
          aria-label="Confirm checklist replacement"
        >
          <p>
            Replace the existing checklist? Its current steps and completion
            progress will be replaced.
          </p>
          <div>
            <button
              type="button"
              className="button button-outline"
              onClick={() => setConfirm(false)}
            >
              Keep existing checklist
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => apply(true)}
            >
              Replace checklist
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
