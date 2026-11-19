"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string };

const schema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(120),
  job_title: z.string().trim().max(120),
  phone_whatsapp: z.string().trim().max(40),
  role: z.enum(["admin", "member"]).optional(),
  active: z.enum(["on"]).optional(),
});

/** Members edit their own name and contact; admins also role and activation (enforced again in SQL). */
export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const me = await requireMember();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Escreva pelo menos o nome." };
  const d = parsed.data;
  if (d.id !== me.id && me.role !== "admin") return { error: "Só um admin pode editar outras pessoas." };
  const patch: Record<string, unknown> = { full_name: d.full_name, job_title: d.job_title || null, phone_whatsapp: d.phone_whatsapp || null };
  if (me.role === "admin" && d.id !== me.id) {
    patch.role = d.role ?? "member";
    patch.active = d.active === "on";
  }
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(patch).eq("id", d.id);
  if (error) return { error: "Não foi possível guardar." };
  revalidatePath("/", "layout");
  redirect("/team");
}
