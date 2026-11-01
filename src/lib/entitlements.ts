import type { WorkspacePlan } from './types';
export const planEntitlements = {
  Starter: {
    workspaces: 1,
    staffMembers: 3,
    boards: 1,
    products: true,
    templates: false,
    personalization: false,
    reminders: false,
  },
  Plus: {
    workspaces: 1,
    staffMembers: 15,
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
  return value === 'Starter' || value === 'Plus';
}
export function hasPlanCapability(
  plan: WorkspacePlan,
  capability: PlanCapability,
) {
  return planEntitlements[plan][capability];
}
