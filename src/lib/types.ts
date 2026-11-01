export type Status = 'todo' | 'progress' | 'ready' | 'completed';
export const productCategories = [
  'Cakes',
  'Cupcakes',
  'Pastries',
  'Cookies',
] as const;
// Seed labels are retained for migration; workspace categories are managed in the library.
export type Category = string;
export type WorkspacePlan = 'Starter' | 'Plus';
export type WorkspaceRole =
  'owner' | 'manager' | 'lead' | 'employee' | 'viewer';
export interface Employee {
  id: string;
  name: string;
  email?: string;
  initials: string;
  color: string;
  photoDataUrl?: string;
  role: WorkspaceRole;
  active: boolean;
  invitation?: {
    id: string;
    createdAt: string;
    status: 'pending';
    invitedBy?: { id: string; name: string };
  };
}
export type StaffReference = Pick<
  Employee,
  'id' | 'name' | 'initials' | 'color' | 'photoDataUrl'
> & { active?: boolean; removed?: boolean };
export interface ProductionTask {
  taskType?: 'general_production' | 'customer_related';
  productionQuantity?: number;
  size?: string;
  flavor?: string;
  productionDue?: string;
  pickupAt?: string;
  allergyNotes?: string;
  legacyPickupSchedule?: boolean;
  /** Calendar-only projection; never a second stored task. */
  calendarMilestone?: 'production' | 'pickup';
  id: string;
  workspaceId: string;
  title: string;
  customer: string;
  category: Category;
  categoryId?: string;
  productId?: string;
  productName?: string;
  quantity?: string;
  deadline: string;
  pickupTime: string;
  description: string;
  orderId?: string;
  priority: 'Low' | 'High' | 'Normal';
  status: Status;
  completedAt?: string;
  assigneeIds: string[];
  formerAssignees?: StaffReference[];
  checklist: { label: string; done: boolean }[];
  notes: string;
}
export interface Workspace {
  id: string;
  name: string;
  initials: string;
  plan?: WorkspacePlan;
}
export interface WorkspaceSettings extends Workspace {
  businessEmail: string;
  businessPhone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  logoDataUrl?: string;
  timeZone: string;
  timeFormat: '12h' | '24h';
  weekStartsOn: 0 | 1;
  defaultCalendarView: 'day' | 'week' | 'month';
  defaultPriority: ProductionTask['priority'];
  warningMinutes: number;
  appearance: WorkspaceAppearance;
  reminders: ReminderSettings;
}
export interface Activity {
  id: string;
  employeeId: string;
  action: string;
  task: string;
  time: string;
  taskId?: string;
  occurredAt?: string;
}

export interface Product {
  id: string;
  workspaceId: string;
  name: string;
  category: Category;
  categoryId?: string;
  description: string;
  active: boolean;
}
export interface ChecklistTemplate {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  category?: Category;
  categoryId?: string;
  steps: string[];
  active: boolean;
}
export interface ProductCategory {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  active: boolean;
}
export type LibraryKind = 'products' | 'categories' | 'templates';
export interface ProductionLibrary {
  deletedIds?: Partial<Record<LibraryKind, string[]>>;
  categories: ProductCategory[];
  products: Product[];
  templates: ChecklistTemplate[];
}
export type ThemePreset =
  'classic-sage' | 'soft-rose' | 'warm-neutral' | 'slate-blue';
export interface WorkspaceAppearance {
  preset: ThemePreset;
  accent: string;
  background: string;
  surface: string;
}
export interface ReminderSettings {
  enabled: boolean;
  timingMinutes: number;
  types: { upcoming: boolean; deadline: boolean; overdue: boolean };
  recipients: { assigned: boolean; owner: boolean };
}
