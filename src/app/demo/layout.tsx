import { AppShell } from '@/components/app-shell';
import { getDemoData } from '@/lib/data';
import { DemoSessionProvider } from '@/components/demo-session';
import { ToastProvider } from '@/components/toast-provider';
export default async function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workspace, employees, tasks } = await getDemoData();
  return (
    <DemoSessionProvider employees={employees}>
      <ToastProvider>
        <AppShell workspace={workspace} initialTasks={tasks}>
          {children}
        </AppShell>
      </ToastProvider>
    </DemoSessionProvider>
  );
}
