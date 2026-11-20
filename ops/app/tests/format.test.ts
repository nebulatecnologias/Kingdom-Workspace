import { describe, expect, it } from "vitest";
import { addDays, dayKey, fmtDuration, mondayOf, periodOf, toIso } from "@/lib/format";

describe("dates in Africa/Maputo", () => {
  it("keys a late-evening UTC instant to the next Maputo day", () => {
    expect(dayKey("2026-11-19T22:30:00Z")).toBe("2026-11-20");
  });
  it("finds the Monday of the week", () => {
    expect(mondayOf("2026-11-19")).toBe("2026-11-16");
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });
  it("turns Maputo wall-clock time into an instant", () => {
    expect(toIso("2026-11-19", "10:30")).toBe("2026-11-19T08:30:00.000Z");
  });
  it("groups by period of the day", () => {
    expect(periodOf("2026-11-19T08:30:00Z")).toBe("morning");
    expect(periodOf("2026-11-19T12:00:00Z")).toBe("afternoon");
    expect(fmtDuration(90)).toBe("1 h 30");
  });
});

describe("money and spans (#17 #28)", async () => {
  const { fmtMoney, fmtSpan } = await import("@/lib/format");
  it("groups every amount the same way", () => {
    expect(fmtMoney(800000)).toBe("8\u00a0000\u00a0MZN");
    expect(fmtMoney(1500000)).toBe("15\u00a0000\u00a0MZN");
  });
  it("says when a meeting ends on another day", () => {
    expect(fmtSpan("2026-11-20T21:30:00Z", "2026-11-21T00:30:00Z")).toBe("23:30–02:30 (sáb)");
    expect(fmtSpan("2026-11-20T08:00:00Z", "2026-11-20T09:00:00Z")).toBe("10:00–11:00");
  });
});
