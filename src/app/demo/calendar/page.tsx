import { ProductionCalendar } from '@/components/production-calendar';
import { readCalendarState } from '@/lib/calendar';
import { getDemoData } from '@/lib/data';
import { productionDay } from '@/lib/production-dates';

export const metadata = { title: 'Production Calendar' };
export default async function CalendarPage() {
  const { workspace, employees, tasks } = await getDemoData();
  const params = new URLSearchParams();
  // eslint-disable-next-line react-hooks/purity -- One request clock keeps server/client urgency and Today aligned.
  const initialNow = Date.now();
  return (
    <ProductionCalendar
      workspace={workspace}
      employees={employees}
      initialTasks={tasks}
      initialNow={initialNow}
      initialState={readCalendarState(
        params,
        productionDay(initialNow),
        employees,
      )}
    />
  );
}
