"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { getPlan, memberPlan, planOpen } from "@/lib/plan";
import { safeNext } from "@/lib/request";
import { CONTENT_TYPES, DAILY_TIMES, FAITH_STAGES, one, pick, SPHERES, STUDY_WITH } from "@/lib/spheres";
import { createAdminClient } from "@/lib/supabase/admin";

export type WelcomeState = { status: "idle" | "error"; message?: string; field?: "curation_spheres" };

/** Where the member goes after the questions: invites land on Home with the welcome note. */
function after(fd: FormData) {
  return safeNext(String(fd.get("next") ?? ""), "/home");
}

/**
 * Saves the welcome answers. Every answer is kept (the admin sees the history); the monthly email follows
 * the latest answer. Members never read these rows back.
 */
export async function saveWelcome(_prev: WelcomeState, fd: FormData): Promise<WelcomeState> {
  const profile = await requireMember("/welcome");
  const contentTypes = pick(fd.getAll("content_types"), CONTENT_TYPES);
  const challenges = pick(fd.getAll("challenges"), SPHERES);
  const optIn = fd.get("curation") === "yes";
  const curationSpheres = optIn ? pick(fd.getAll("curation_spheres"), SPHERES) : [];
  if (optIn && !curationSpheres.length) return { status: "error", field: "curation_spheres", message: "err_pickSphere" };

  const admin = createAdminClient();
  const { error } = await admin.from("onboarding_responses").insert({
    user_id: profile.id,
    quiz_version: 2,
    content_types: contentTypes,
    challenges,
    faith_stage: one(fd.get("faith_stage"), FAITH_STAGES),
    daily_time: one(fd.get("daily_time"), DAILY_TIMES),
    study_with: pick(fd.getAll("study_with"), STUDY_WITH),
    curation_opt_in: optIn,
    curation_spheres: curationSpheres,
  });
  if (error) {
    console.error("saveWelcome failed", error.message);
    return { status: "error", message: "err_generic" };
  }
  await admin.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", profile.id);
  await setCuration(profile.id, optIn ? curationSpheres : null);
  revalidatePath("/", "layout");
  // The monthly picks come with the plan: someone who wants them sees the plan next (unless they already have it).
  if (optIn && planOpen(await getPlan()) && !(await memberPlan(profile.id))?.active) redirect(`/plan?next=${encodeURIComponent(after(fd))}`);
  redirect(after(fd));
}

/**
 * "Not now": goes on without answering. The first skip is kept in the history; Home keeps offering the
 * questions (never forcing them) until the member answers.
 */
export async function skipWelcome(fd: FormData) {
  const profile = await requireMember("/welcome");
  if (!profile.onboardedAt) {
    const admin = createAdminClient();
    const { count } = await admin.from("onboarding_responses").select("id", { count: "exact", head: true }).eq("user_id", profile.id);
    if (!count) await admin.from("onboarding_responses").insert({ user_id: profile.id, skipped: true });
  }
  redirect(after(fd));
}

/** Stops the monthly email from the profile page. */
export async function stopCuration() {
  const profile = await requireMember("/profile");
  await setCuration(profile.id, null);
  revalidatePath("/profile");
  redirect("/profile?notice=curation_off");
}

/** Subscribes with these spheres, or unsubscribes with null. */
async function setCuration(userId: string, spheres: string[] | null) {
  const admin = createAdminClient();
  if (spheres) {
    const { data: current } = await admin.from("curation_subscriptions").select("unsubscribed_at").eq("user_id", userId).maybeSingle();
    const again = current?.unsubscribed_at ? { subscribed_at: new Date().toISOString() } : {};
    await admin.from("curation_subscriptions").upsert({ user_id: userId, spheres, unsubscribed_at: null, ...again }, { onConflict: "user_id" });
  } else {
    await admin.from("curation_subscriptions").update({ unsubscribed_at: new Date().toISOString() }).eq("user_id", userId).is("unsubscribed_at", null);
  }
}
