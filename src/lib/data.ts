import {
  activities,
  createSampleTasks,
  employees,
  workspace,
} from './demo-seed';
import type { Activity, Employee, ProductionTask, Workspace } from './types';
// Adapter boundary: replace the mock implementation with scoped Supabase queries later.
export interface BakeryRepository {
  getWorkspace(): Promise<Workspace>;
  getTasks(workspaceId: string): Promise<ProductionTask[]>;
  getEmployees(workspaceId: string): Promise<Employee[]>;
  getActivity(workspaceId: string): Promise<Activity[]>;
}
export const bakeryRepository: BakeryRepository = {
  async getWorkspace() {
    return workspace;
  },
  async getTasks(workspaceId) {
    return createSampleTasks().filter(
      (task) => task.workspaceId === workspaceId,
    );
  },
  async getEmployees(workspaceId) {
    return workspaceId === workspace.id ? employees : [];
  },
  async getActivity(workspaceId) {
    return workspaceId === workspace.id ? activities : [];
  },
};
export async function getDemoData() {
  const workspace = await bakeryRepository.getWorkspace();
  const [tasks, employees, activities] = await Promise.all([
    bakeryRepository.getTasks(workspace.id),
    bakeryRepository.getEmployees(workspace.id),
    bakeryRepository.getActivity(workspace.id),
  ]);
  return { workspace, tasks, employees, activities };
}
