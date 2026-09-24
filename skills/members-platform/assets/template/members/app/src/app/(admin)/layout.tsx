import { headers } from "next/headers";
import { Toaster } from "@/components/admin/toaster";
import { AppShell } from "@/components/shell/app-shell";
import { adminContext } from "@/lib/admin/context";
import { safeNext } from "@/lib/request";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, db } = await adminContext(safeNext((await headers()).get("x-km-path"), "/admin"));
  const { count } = await db
    .from("invites")
    .select("id", { count: "exact", head: true })
    .in("status", ["sent", "opened"])
    .gt("expires_at", new Date().toISOString());
  return (
    <AppShell variant="admin" user={{ name: profile.fullName || profile.email, email: profile.email }} pendingInvites={count ?? 0}>
      {children}
      <Toaster />
    </AppShell>
  );
}
