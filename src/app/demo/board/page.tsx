import { BoardWithQuery } from '@/components/board';
import { BoardTeam } from '@/components/board-team';
import { getDemoData } from '@/lib/data';
import { CurrentDayLabel } from '@/components/current-day-label';
import { Suspense } from 'react';
export const metadata = { title: 'Production Board' };
export default async function BoardPage() {
  const { tasks, employees, workspace } = await getDemoData();
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
      <Suspense fallback={null}>
        <BoardWithQuery
          tasks={tasks}
          employees={employees}
          workspaceId={workspace.id}
          initialNow={initialNow}
        />
      </Suspense>
    </main>
  );
}
