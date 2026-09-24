import { getTranslations } from "next-intl/server";
import type { InviteStatus } from "@/lib/admin/queries";

const TONE: Record<InviteStatus, string> = {
  sent: "pill-orange",
  opened: "pill-blue",
  accepted: "pill-soft-green",
  expired: "pill-grey",
  revoked: "pill-soft-red",
};

export async function InvitePill({ status }: { status: InviteStatus }) {
  const t = await getTranslations();
  return (
    <span className={`pill ${TONE[status]}`}>
      <span className="dot" />
      {t(`st_${status}`)}
    </span>
  );
}
