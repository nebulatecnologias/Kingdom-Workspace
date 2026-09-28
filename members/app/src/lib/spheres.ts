/** The six spheres of Christian life: welcome questionnaire, monthly curation and product tags. */
export const SPHERES = ["peace_rest", "prayer_intimacy", "family_relationships", "money_stewardship", "purpose_calling", "growth_transformation"] as const;
export type Sphere = (typeof SPHERES)[number];
export const isSphere = (v: unknown): v is Sphere => SPHERES.includes(v as Sphere);

/** Kinds of content the member can say they want (question 1). */
export const CONTENT_TYPES = ["colouring", "books", "guides", "kits", "courses", "audio"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];
export const isContentType = (v: unknown): v is ContentType => CONTENT_TYPES.includes(v as ContentType);

/** Distinct valid values of a repeated form field, in the canonical order. */
export function pick<T extends string>(values: FormDataEntryValue[], allowed: readonly T[]): T[] {
  const given = new Set(values.map(String));
  return allowed.filter((v) => given.has(v));
}
