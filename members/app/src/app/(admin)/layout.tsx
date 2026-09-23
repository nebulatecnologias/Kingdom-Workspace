import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <AppShell variant="admin" user={user}>
      {children}
    </AppShell>
  );
}
