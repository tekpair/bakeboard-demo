import { ProductionLibraryPage } from '@/components/production-library';
import { getDemoData } from '@/lib/data';
export const metadata = { title: 'Production Library' };
export default async function LibraryPage() {
  const { tasks } = await getDemoData();
  return <ProductionLibraryPage initialTasks={tasks} />;
}
