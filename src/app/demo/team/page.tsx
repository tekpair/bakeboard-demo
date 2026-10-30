import { TeamManagement } from '@/components/team-management';
import { getDemoData } from '@/lib/data';
export const metadata = { title: 'Staff Management' };
export default async function TeamPage() {
  const { tasks } = await getDemoData();
  return <TeamManagement initialTasks={tasks} />;
}
