import { AppShell } from "@/components/shell/app-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  return (
    <AppShell variant="admin" user={{ name: profile.fullName || profile.email, email: profile.email }}>
      {children}
    </AppShell>
  );
}
