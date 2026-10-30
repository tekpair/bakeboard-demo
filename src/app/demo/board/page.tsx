import { Board } from '@/components/board';
import { BoardTeam } from '@/components/board-team';
import { getDemoData } from '@/lib/data';
import { CurrentDayLabel } from '@/components/current-day-label';
import type { Status } from '@/lib/types';
export const metadata = { title: 'Production Board' };
export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    date?: string;
    attention?: string;
    task?: string;
  }>;
}) {
  const { tasks, employees, workspace } = await getDemoData();
  const params = await searchParams;
  const initialStatus = ['todo', 'progress', 'ready', 'completed'].includes(
    params.status ?? '',
  )
    ? (params.status as Status)
    : undefined;
  const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? '')
    ? params.date
    : undefined;
  // eslint-disable-next-line react-hooks/purity -- Keep overdue board filters aligned with the page's first render.
  const initialNow = Date.now();
  return (
    <main id="main" className="dashboard-main board-main">
      <div className="page-heading">
        <div>
          <CurrentDayLabel />
          <h1>Production Board</h1>
          <p className="page-description">
            Keep production moving, from the first step to ready for pickup.
          </p>
        </div>
        <BoardTeam />
      </div>
      <Board
        tasks={tasks}
        employees={employees}
        workspaceId={workspace.id}
        initialStatus={initialStatus}
        initialDate={initialDate}
        initialAttention={params.attention === 'overdue'}
        initialTaskId={params.task}
        initialNow={initialNow}
      />
    </main>
  );
}
