import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <AppShell variant="member" user={user}>
      {children}
    </AppShell>
  );
}
