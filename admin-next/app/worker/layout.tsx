'use client';

import { WorkerAuthProvider } from '@/lib/context/WorkerAuthContext';
import WorkerShell from '@/lib/components/worker/WorkerShell';

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkerAuthProvider>
      <WorkerShell>{children}</WorkerShell>
    </WorkerAuthProvider>
  );
}
