import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Topbar } from "@/components/shell/topbar";
import { PageHead } from "@/components/ui/bits";
import { requireMember } from "@/lib/auth";
import { getBase } from "@/lib/data";
import { T } from "@/lib/texts";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: T.nav.team };

export default async function ProfilePage({ params }: PageProps<"/team/[id]">) {
  const { id } = await params;
  const me = await requireMember(`/team/${id}`);
  if (id !== me.id && me.role !== "admin") redirect("/team");
  const base = await getBase();
  const p = base.team.find((x) => x.id === id);
  if (!p) notFound();
  const title = id === me.id ? "O meu perfil" : p.full_name;
  return (
    <>
      <Topbar title={title} back="/team" />
      <div className="page" style={{ maxWidth: 640 }}>
        <PageHead desktopOnly title={title} sub={T.nav.team} />
        <ProfileForm p={p} adminFields={me.role === "admin" && id !== me.id} />
        {id === me.id ? <PasswordForm /> : null}
      </div>
    </>
  );
}
