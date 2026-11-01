import { pickupDate } from './task-production';
import {
  productCategories,
  type Category,
  type Employee,
  type ProductionTask,
  type ProductCategory,
  type Status,
} from './types';
import { matchesTaskCategory } from './production-library';
import { isProductionOverdue } from './task-work';
import {
  addCalendarDays,
  addCalendarMonths,
  calendarWeek,
  formatCalendarDate,
  isDateKey,
  productionDateTimeInput,
  productionDay,
} from './production-dates';

export type CalendarView = 'day' | 'week' | 'month';
export type CalendarFilters = {
  product: Category | '';
  status: Status | '';
  staff: string;
  priority: '' | ProductionTask['priority'];
  overdue: boolean;
};
export type CalendarState = {
  date: string;
  view: CalendarView;
  filters: CalendarFilters;
};
export const calendarCategories = productCategories;
export const calendarStatuses: Record<Status, string> = {
  todo: 'To Do',
  progress: 'In Progress',
  ready: 'Ready',
  completed: 'Completed',
};
export const weekPreviewLimit = 3;
export const monthPreviewLimit = 2;
export const emptyCalendarFilters: CalendarFilters = {
  product: '',
  status: '',
  staff: '',
  priority: '',
  overdue: false,
};

export function readCalendarState(
  params: URLSearchParams,
  today: string,
  employees: Employee[],
  defaultView: CalendarView = 'month',
  categoryChoices: readonly string[] = calendarCategories,
): CalendarState {
  const product = params.get('product') ?? '';
  const status = params.get('status') ?? '';
  const staff = params.get('staff') ?? '';
  const priority = params.get('priority') ?? '';
  const view = params.get('view');
  return {
    date: isDateKey(params.get('date')) ? params.get('date')! : today,
    view:
      view === 'day' || view === 'week' || view === 'month'
        ? view
        : defaultView,
    filters: {
      product: [...calendarCategories, ...categoryChoices].includes(product)
        ? (product as Category)
        : '',
      status: Object.hasOwn(calendarStatuses, status) ? (status as Status) : '',
      staff: employees.some((employee) => employee.id === staff) ? staff : '',
      priority:
        priority === 'Low' || priority === 'High' || priority === 'Normal'
          ? priority
          : '',
      overdue: params.get('overdue') === '1',
    },
  };
}
export function calendarHref(state: CalendarState) {
  const params = new URLSearchParams({ date: state.date, view: state.view });
  for (const [key, value] of Object.entries(state.filters)) {
    if (value) params.set(key, value === true ? '1' : String(value));
  }
  return `/demo/calendar?${params}`;
}
export function filterCalendarTasks(
  tasks: ProductionTask[],
  filters: CalendarFilters,
  now: number,
  categories: ProductCategory[] = [],
) {
  return tasks
    .filter(
      (task) =>
        matchesTaskCategory(task, filters.product, categories) &&
        (!filters.status || task.status === filters.status) &&
        (!filters.staff || task.assigneeIds.includes(filters.staff)) &&
        (!filters.priority || task.priority === filters.priority) &&
        (!filters.overdue || isProductionOverdue(task, now)),
    )
    .sort(
      (a, b) =>
        Date.parse(a.deadline) - Date.parse(b.deadline) ||
        a.id.localeCompare(b.id),
    );
}
export function groupCalendarTasks(tasks: ProductionTask[], timeZone?: string) {
  const days = new Map<string, ProductionTask[]>();
  for (const task of tasks) {
    const key = productionDay(task.deadline, timeZone);
    days.set(key, [
      ...(days.get(key) ?? []),
      { ...task, calendarMilestone: 'production' },
    ]);
    const pickup = pickupDate(task);
    if (pickup && pickup !== task.deadline) {
      const pickupKey = productionDay(pickup, timeZone);
      days.set(pickupKey, [
        ...(days.get(pickupKey) ?? []),
        {
          ...task,
          productionDue: task.productionDue ?? task.deadline,
          deadline: pickup,
          calendarMilestone: 'pickup',
        },
      ]);
    }
  }
  return days;
}
export function groupDayTimes(tasks: ProductionTask[], timeZone?: string) {
  const groups = new Map<string, ProductionTask[]>();
  for (const task of [...tasks].sort(
    (a, b) => Date.parse(a.deadline) - Date.parse(b.deadline),
  )) {
    const key = productionDateTimeInput(task.deadline, timeZone).slice(11);
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}
export function moveCalendarPeriod(
  date: string,
  view: CalendarView,
  amount: number,
) {
  return view === 'month'
    ? addCalendarMonths(date, amount)
    : addCalendarDays(date, amount * (view === 'week' ? 7 : 1));
}
export function calendarHeading(
  date: string,
  view: CalendarView,
  weekStartsOn: 0 | 1 = 1,
) {
  if (view === 'month')
    return formatCalendarDate(date, { month: 'long', year: 'numeric' });
  if (view === 'day')
    return formatCalendarDate(date, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  const week = calendarWeek(date, weekStartsOn);
  const sameYear = week[0].slice(0, 4) === week[6].slice(0, 4);
  const sameMonth = week[0].slice(0, 7) === week[6].slice(0, 7);
  const startMonth = formatCalendarDate(week[0], { month: 'long' });
  const endMonth = formatCalendarDate(week[6], { month: 'long' });
  const startDay = Number(week[0].slice(8));
  const endDay = Number(week[6].slice(8));
  if (sameMonth)
    return `${startMonth} ${startDay}–${endDay}, ${week[6].slice(0, 4)}`;
  return `${startMonth} ${startDay}${sameYear ? '' : `, ${week[0].slice(0, 4)}`}–${endMonth} ${endDay}, ${week[6].slice(0, 4)}`;
}
