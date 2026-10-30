import type { Employee, ProductionTask, StaffReference } from './types';

export function taskStaff(
  task: ProductionTask,
  employees: Employee[],
): StaffReference[] {
  return [
    ...employees.filter((person) => task.assigneeIds.includes(person.id)),
    ...(task.formerAssignees ?? []).map((person) => ({
      ...person,
      removed: true,
    })),
  ];
}
export function removeStaffAssignments(
  tasks: ProductionTask[],
  employee: Employee,
): ProductionTask[] {
  return purgeStaffReferences(tasks, new Set([employee.id]));
}
export function purgeStaffReferences(
  tasks: ProductionTask[],
  removedIds: Set<string>,
): ProductionTask[] {
  return tasks.map((task) => {
    if (
      !task.assigneeIds.some((id) => removedIds.has(id)) &&
      !task.formerAssignees?.some((person) => removedIds.has(person.id))
    )
      return task;
    const { formerAssignees, ...rest } = task;
    const former = formerAssignees?.filter(
      (person) => !removedIds.has(person.id),
    );
    return {
      ...rest,
      assigneeIds: task.assigneeIds.filter((id) => !removedIds.has(id)),
      ...(former?.length ? { formerAssignees: former } : {}),
    };
  });
}
// Stale editors cannot reassign removed staff or erase their historical attribution.
export function preserveStaffHistory(
  next: ProductionTask[],
  previous: ProductionTask[],
): ProductionTask[] {
  const old = new Map(previous.map((task) => [task.id, task]));
  return next.map((task) => {
    const snapshots = new Map(
      [
        ...(task.formerAssignees ?? []),
        ...(old.get(task.id)?.formerAssignees ?? []),
      ].map((person) => [person.id, person]),
    );
    if (!snapshots.size) return task;
    return {
      ...task,
      formerAssignees: [...snapshots.values()],
      assigneeIds: task.assigneeIds.filter((id) => !snapshots.has(id)),
    };
  });
}
export function historicalStaff(
  employeeId: string,
  tasks: ProductionTask[],
): StaffReference | undefined {
  return tasks
    .flatMap((task) => task.formerAssignees ?? [])
    .find((person) => person.id === employeeId);
}
