import type { ProductionTask } from './types';

export function taskType(task: ProductionTask) {
  return task.taskType ?? 'customer_related';
}
export function customerRelated(task: ProductionTask) {
  return taskType(task) === 'customer_related';
}
export function pickupDate(task: ProductionTask) {
  if (!customerRelated(task)) return undefined;
  return task.pickupAt ?? (!task.taskType ? task.deadline : undefined);
}
export function productionDue(task: ProductionTask) {
  return task.productionDue ?? task.deadline;
}
export function calendarMilestoneLabel(task: ProductionTask) {
  if (task.calendarMilestone === 'pickup') return 'Pickup / Delivery';
  return pickupDate(task) === task.deadline
    ? 'Production due / Pickup'
    : 'Production due';
}
// Preserve the original legacy date as both its existing due value and pickup
// reference. No date is invented, and details identify it for review.
export function normalizeProductionTask(task: ProductionTask): ProductionTask {
  if (task.taskType) return task;
  return {
    ...task,
    taskType: 'customer_related',
    pickupAt: task.deadline,
    legacyPickupSchedule: true,
  };
}
export function productionSummary(task: ProductionTask) {
  return task.productionQuantity !== undefined
    ? [String(task.productionQuantity), task.size, task.flavor]
        .filter(Boolean)
        .join(' · ')
    : task.quantity;
}
export function schedulingError(due: string, pickup?: string) {
  return pickup && Date.parse(due) > Date.parse(pickup)
    ? 'Production Due must be on or before pickup / delivery. Adjust either date before saving.'
    : '';
}
