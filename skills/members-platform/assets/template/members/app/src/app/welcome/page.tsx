import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/shell/auth-shell";
import { WelcomeQuiz } from "@/components/welcome/welcome-quiz";
import { requireMember } from "@/lib/auth";
import { safeNext } from "@/lib/request";
import { isSphere, type Sphere } from "@/lib/spheres";
import { createAdminClient } from "@/lib/supabase/admin";
import { skipWelcome } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("wel_title") };
}

/** Welcome questions: shown once after accepting an invite, and again whenever the member wants to update them. */
export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const sp = await searchParams;
  const profile = await requireMember("/welcome");
  const t = await getTranslations();
  const next = safeNext(typeof sp.next === "string" ? sp.next : null, "/home");
  const { data: sub } = await createAdminClient().from("curation_subscriptions").select("spheres, unsubscribed_at").eq("user_id", profile.id).maybeSingle();
  const subscribed = sub && !sub.unsubscribed_at ? (sub.spheres as string[]).filter(isSphere) : null;
  const first = (profile.fullName || profile.email).split(" ")[0];

  return (
    <AuthShell art={{ title: t("wel_artTitle", { name: first }), body: t("wel_artP") }}>
      <WelcomeQuiz next={next} subscribed={subscribed as Sphere[] | null} />
      <form action={skipWelcome}>
        <input type="hidden" name="next" value={next} />
        <button type="submit" className="btn-link" style={{ fontSize: 14 }}>
          {profile.onboardedAt ? t("wel_cancel") : t("wel_skip")}
        </button>
      </form>
    </AuthShell>
  );
}
