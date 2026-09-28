/** The six spheres of Christian life: welcome questionnaire, monthly curation and product tags. */
export const SPHERES = ["peace_rest", "prayer_intimacy", "family_relationships", "money_stewardship", "purpose_calling", "growth_transformation"] as const;
export type Sphere = (typeof SPHERES)[number];
export const isSphere = (v: unknown): v is Sphere => SPHERES.includes(v as Sphere);

/** Kinds of content the member can say they want (question 1). */
export const CONTENT_TYPES = ["colouring", "books", "guides", "kits", "courses", "audio"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export const isContentType = (v: unknown): v is ContentType => CONTENT_TYPES.includes(v as ContentType);

/** Where the member is in their walk with God (question 3). */
export const FAITH_STAGES = ["exploring", "new", "growing", "mature"] as const;
/** Time they usually set aside with God each day (question 4). */
export const DAILY_TIMES = ["lt10", "10_30", "30_60", "gt60"] as const;
/** Who they use the resources with (question 5). */
export const STUDY_WITH = ["alone", "spouse", "children", "group", "ministry"] as const;

/** One valid value of a single-choice field, or null. */
export function one<T extends string>(value: FormDataEntryValue | null, allowed: readonly T[]): T | null {
  return allowed.includes(String(value ?? "") as T) ? (String(value) as T) : null;
}

/** Distinct valid values of a repeated form field, in the canonical order. */
export function pick<T extends string>(values: FormDataEntryValue[], allowed: readonly T[]): T[] {
  const given = new Set(values.map(String));
  return allowed.filter((v) => given.has(v));
}
