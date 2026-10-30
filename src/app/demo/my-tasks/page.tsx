import { MyTasks } from '@/components/my-tasks';
import { getDemoData } from '@/lib/data';

export const metadata = { title: 'My Tasks' };

export default async function MyTasksPage() {
  const { workspace, employees, tasks } = await getDemoData();
  // eslint-disable-next-line react-hooks/purity -- Share the request clock with the first client render.
  const initialNow = Date.now();
  return (
    <MyTasks
      workspace={workspace}
      employees={employees}
      initialTasks={tasks}
      initialNow={initialNow}
    />
  );
}
