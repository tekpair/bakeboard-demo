import type { WorkspacePlan } from './types';
export const planEntitlements = {
  Free: {
    workspaces: 1,
    additionalStaff: 3,
    boards: 1,
    products: true,
    templates: false,
    personalization: false,
    reminders: false,
  },
  Plus: {
    workspaces: 3,
    additionalStaff: 15,
    boards: 2,
    products: true,
    templates: true,
    personalization: true,
    reminders: true,
  },
} as const;
export type PlanCapability =
  'products' | 'templates' | 'personalization' | 'reminders';
export function isWorkspacePlan(value: unknown): value is WorkspacePlan {
  return value === 'Free' || value === 'Plus';
}
export function hasPlanCapability(
  plan: WorkspacePlan,
  capability: PlanCapability,
) {
  return planEntitlements[plan][capability];
}
