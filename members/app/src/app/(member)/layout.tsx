import { AppShell } from "@/components/shell/app-shell";
import { requireMember } from "@/lib/auth";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireMember();
  return (
    <AppShell variant="member" user={{ name: profile.fullName || profile.email, email: profile.email }}>
      {children}
    </AppShell>
  );
}
