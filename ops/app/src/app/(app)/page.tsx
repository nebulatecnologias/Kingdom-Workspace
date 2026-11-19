import { Empty, PageHead } from "@/components/ui/bits";
import { requireMember } from "@/lib/auth";
import { dayKey, firstName, fmtDayLong, greeting } from "@/lib/format";

export default async function HomePage() {
  const me = await requireMember();
  const now = new Date();
  return (
    <>
      <header className="topbar home">
        <div style={{ flex: 1 }}>
          <div className="caption">{fmtDayLong(dayKey(now))}</div>
          <h1 className="h-display">
            {greeting(now)}, {firstName(me.full_name)}
          </h1>
        </div>
      </header>
      <div className="page">
        <PageHead desktopOnly title={`${greeting(now)}, ${firstName(me.full_name)}`} sub={fmtDayLong(dayKey(now))} />
        <div className="card">
          <Empty icon="home" title="Início" hint="O painel chega no bloco 4." />
        </div>
      </div>
    </>
  );
}
