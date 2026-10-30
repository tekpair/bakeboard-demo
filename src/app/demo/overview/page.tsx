import { getDemoData } from '@/lib/data';
import { OverviewDashboard } from '@/components/overview-dashboard';

export const metadata = { title: 'Overview' };

export default async function OverviewPage() {
  const { tasks, employees, activities, workspace } = await getDemoData();
  // eslint-disable-next-line react-hooks/purity -- Use one request timestamp so server and client agree on overdue state during hydration.
  const initialNow = Date.now();
  return (
    <OverviewDashboard
      initialTasks={tasks}
      employees={employees}
      activities={activities}
      workspace={workspace}
      initialNow={initialNow}
    />
  );
}
