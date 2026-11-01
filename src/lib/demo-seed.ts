import type { Activity, Employee, ProductionTask, Workspace } from './types';

export const workspace: Workspace = {
  id: 'ws-willow-rye',
  name: 'Willow & Rye Bakery',
  initials: 'WR',
  plan: 'Starter',
};

export const employees: Employee[] = [
  {
    id: 'em',
    name: 'Emma Wilson',
    initials: 'EW',
    color: 'sage',
    role: 'owner',
    active: true,
  },
  {
    id: 'so',
    name: 'Sofia Patel',
    initials: 'SP',
    color: 'blush',
    role: 'employee',
    active: true,
  },
];

// New visitors and Reset Demo begin with an empty production board.
export function createSampleTasks(): ProductionTask[] {
  return [];
}

export const activities: Activity[] = [];
