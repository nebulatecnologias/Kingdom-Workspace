"use client";

import { useRouter } from "next/navigation";
import { T } from "@/lib/texts";

export function MemberSelect({ slug, member, team }: { slug: string; member: string; team: { id: string; full_name: string }[] }) {
  const router = useRouter();
  return (
    <select
      className="select"
      style={{ width: "auto", minHeight: 40 }}
      aria-label={T.actions.filter}
      value={member}
      onChange={(e) => router.push(`/pipelines/${slug}${e.target.value ? `?member=${e.target.value}` : ""}`)}
    >
      <option value="">{T.all}</option>
      {team.map((p) => (
        <option key={p.id} value={p.id}>
          {p.full_name.split(" ")[0]}
        </option>
      ))}
    </select>
  );
}
