import { pickupDate, productionDue } from './task-production';
import type { ProductionTask } from './types';
import { productionDay } from './production-dates';

export {
  demoRoles,
  canManageTasks,
  canUpdateTask,
  type DemoRole,
} from './permissions';
export function isProductionOverdue(task: ProductionTask, now: number) {
  return (
    task.status !== 'ready' &&
    task.status !== 'completed' &&
    Date.parse(productionDue(task)) < now
  );
}
export function isAwaitingCollection(task: ProductionTask, now: number) {
  const pickup = pickupDate(task);
  return task.status === 'ready' && !!pickup && Date.parse(pickup) < now;
}
export function isProductionDueSoon(
  task: ProductionTask,
  now: number,
  warningMinutes = 60,
) {
  const remaining = Date.parse(productionDue(task)) - now;
  return (
    task.status !== 'ready' &&
    task.status !== 'completed' &&
    remaining >= 0 &&
    remaining <= warningMinutes * 60_000
  );
}
export function localDay(value: number | string, timeZone?: string) {
  return productionDay(value, timeZone);
}
export function isInTodayWork(
  task: ProductionTask,
  now: number,
  timeZone?: string,
) {
  return (
    task.status !== 'completed' &&
    (localDay(task.deadline, timeZone) === localDay(now, timeZone) ||
      isProductionOverdue(task, now))
  );
}
export function sortAssignedWork(
  tasks: ProductionTask[],
  now: number,
  warningMinutes: number,
  timeZone?: string,
) {
  const rank = (task: ProductionTask) => {
    if (isProductionOverdue(task, now)) return 0;
    if (isProductionDueSoon(task, now, warningMinutes)) return 1;
    if (localDay(task.deadline, timeZone) <= localDay(now, timeZone)) return 2;
    return 3;
  };
  return [...tasks].sort(
    (a, b) =>
      rank(a) - rank(b) || Date.parse(a.deadline) - Date.parse(b.deadline),
  );
}

// Historical completed records without dates stay undated; only new transitions get a timestamp.
export function recordTaskCompletions(
  next: ProductionTask[],
  previous: ProductionTask[],
  now: string,
) {
  const previousById = new Map(previous.map((task) => [task.id, task]));
  return next.map((task) => {
    const old = previousById.get(task.id);
    const rest = { ...task };
    delete rest.completedAt;
    if (task.status !== 'completed') return rest;
    const completedAt = old?.status === 'completed' ? old.completedAt : now;
    return completedAt ? { ...rest, completedAt } : rest;
  });
}
