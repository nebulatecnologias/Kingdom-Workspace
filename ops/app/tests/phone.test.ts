import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/lib/phone";

describe("phone numbers", () => {
  it("normalises Mozambican numbers", () => {
    expect(normalizePhone("84 123 4567")).toEqual({ ok: true, value: "+258 84 123 4567" });
    expect(normalizePhone("+258841234567")).toEqual({ ok: true, value: "+258 84 123 4567" });
    expect(normalizePhone("00258 84-123-4567")).toEqual({ ok: true, value: "+258 84 123 4567" });
  });
  it("keeps other countries and empties", () => {
    expect(normalizePhone("+351 912 345 678")).toEqual({ ok: true, value: "+351912345678" });
    expect(normalizePhone("")).toEqual({ ok: true, value: null });
  });
  it("rejects text and short numbers", () => {
    expect(normalizePhone("abc").ok).toBe(false);
    expect(normalizePhone("12345").ok).toBe(false);
  });
});
