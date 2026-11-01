import type { Activity, Employee, ProductionTask, Workspace } from './types';
import {
  addCalendarDays,
  parseProductionDateTime,
  productionDay,
  productionTime,
  productionTimeZone,
} from './production-dates';

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

const checklist = (labels: string[], done = 0) =>
  labels.map((label, index) => ({ label, done: index < done }));

// A fresh demo starts around the visitor's current bakery day. Once loaded,
// these tasks are saved locally and do not move forward on every visit.
export function createSampleTasks(now = Date.now()): ProductionTask[] {
  const today = productionDay(now, productionTimeZone);
  const tomorrow = addCalendarDays(today, 1);
  const due = (day: string, hour: string) =>
    parseProductionDateTime(`${day}T${hour}`, undefined, productionTimeZone)!;
  const task = (
    value: Omit<ProductionTask, 'workspaceId' | 'pickupTime' | 'deadline'> & {
      deadline: Date;
    },
  ): ProductionTask => ({
    ...value,
    workspaceId: workspace.id,
    deadline: value.deadline.toISOString(),
    pickupTime: productionTime(value.deadline, productionTimeZone),
  });

  return [
    task({
      id: 'BB-1042',
      title: 'Vanilla birthday cake',
      customer: 'Maya Bennett',
      category: 'Cakes',
      productId: 'product-cakes',
      quantity: '1 × 8-inch · Vanilla bean',
      deadline: due(today, '16:00'),
      description: 'Finish an eight-inch vanilla cake with a piped border.',
      priority: 'Normal',
      status: 'progress',
      assigneeIds: ['em', 'so'],
      checklist: checklist(
        ['Bake layers', 'Prepare filling', 'Decorate', 'Box'],
        2,
      ),
      notes: 'Add a short birthday message before boxing.',
    }),
    task({
      id: 'BB-1043',
      title: 'Lemon cupcakes',
      customer: 'Jordan Lee',
      category: 'Cupcakes',
      productId: 'product-cupcakes',
      quantity: '12 cupcakes · Lemon buttercream',
      deadline: due(today, '17:30'),
      description: 'Box a dozen lemon cupcakes for pickup.',
      priority: 'Normal',
      status: 'ready',
      assigneeIds: ['so'],
      checklist: checklist(['Bake cupcakes', 'Frost and box'], 2),
      notes: 'Keep the box chilled until collection.',
    }),
    task({
      id: 'BB-1044',
      title: 'Morning pastry prep',
      customer: 'Front counter',
      category: 'Pastries',
      productId: 'product-pastries',
      quantity: '24 pastries · Assorted',
      deadline: due(today, '09:00'),
      description: 'Prepare the morning pastry counter batch.',
      priority: 'Normal',
      status: 'completed',
      completedAt: new Date(now).toISOString(),
      assigneeIds: ['em'],
      checklist: checklist(['Bake', 'Cool', 'Stock counter'], 3),
      notes: 'Counter restock completed.',
    }),
    task({
      id: 'BB-1045',
      title: 'Decorated sugar cookies',
      customer: 'Willow School',
      category: 'Cookies',
      productId: 'product-cookies',
      quantity: '24 cookies · Vanilla icing',
      deadline: due(tomorrow, '14:00'),
      description: 'Bake and decorate two dozen cookies for pickup.',
      priority: 'Normal',
      status: 'todo',
      assigneeIds: ['so'],
      checklist: checklist(['Mix dough', 'Bake', 'Decorate and pack']),
      notes: 'Pack in two labeled boxes.',
    }),
  ];
}

export const activities: Activity[] = [];
