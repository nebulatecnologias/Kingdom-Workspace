import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getPlan, memberPlan } from "@/lib/plan";
import { siteUrl } from "@/lib/request";

/**
 * "Start my free days": sends the member to the plan's checkout on the gateway with their details and member
 * id, so the subscription opens this account even if they type another email there (metadata.member_user_id).
 */
export async function GET() {
  const profile = await getProfile();
  if (!profile || profile.status !== "active") redirect(`/login?next=${encodeURIComponent("/plan")}`);
  const [plan, current] = await Promise.all([getPlan(), memberPlan(profile.id)]);
  if (current?.active) redirect("/plan");

  let target: URL | null = null;
  try {
    target = plan?.checkoutUrl ? new URL(plan.checkoutUrl) : null;
  } catch {
    target = null;
  }
  const safe = target && (target.protocol === "https:" || target.hostname === "localhost");
  if (!plan?.active || !target || !safe) redirect("/plan?checkout=unavailable");

  target.searchParams.set("email", profile.email);
  if (profile.fullName) target.searchParams.set("name", profile.fullName);
  target.searchParams.set("locale", profile.locale);
  target.searchParams.set("ref", profile.id);
  target.searchParams.set("return_url", `${siteUrl()}/plan?status=started`);
  redirect(target.toString());
}
