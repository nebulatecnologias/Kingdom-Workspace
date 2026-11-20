import { Suspense } from "react";
import { Sidebar, Tabbar } from "@/components/shell/nav";
import { NavTracker } from "@/components/shell/nav-tracker";
import { Toaster } from "@/components/shell/toaster";
import { requireMember } from "@/lib/auth";
import { getBase, getShellCounts } from "@/lib/data";
import { signOut } from "../(auth)/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireMember();
  const [base, counts] = await Promise.all([getBase(), getShellCounts(new Date())]);
  const pipelines = base.pipelines.map((p) => ({ slug: p.slug, name: p.name, icon: p.icon, open: counts.open[p.slug] ?? 0 }));
  return (
    <Toaster>
      <div className="app-scroll">
        <div className="shell">
          <Sidebar me={me} pipelines={pipelines} todayCount={counts.today} missingCount={counts.missingMinutes} signOut={signOut} />
          <main className="main">
            <div className="panel">{children}</div>
          </main>
        </div>
        <Suspense fallback={null}>
          <Tabbar />
          <NavTracker />
        </Suspense>
      </div>
    </Toaster>
  );
}
