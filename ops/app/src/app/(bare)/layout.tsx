import { requireMember } from "@/lib/auth";

/** Pages without the app shell (print view). */
export default async function BareLayout({ children }: { children: React.ReactNode }) {
  await requireMember();
  return (
    <div className="app">
      <div className="app-scroll">{children}</div>
    </div>
  );
}
