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
