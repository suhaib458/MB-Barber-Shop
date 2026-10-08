import { describe, expect, it } from "vitest";
import {
  formatTime,
  generateReference,
  getTimeSlots,
  isOpenInAmman,
  normalizeJordanPhone,
} from "@/lib/booking";
describe("booking business rules", () => {
  it("normalizes valid Jordanian mobile numbers", () => {
    expect(normalizeJordanPhone("0792398952")).toBe("+962792398952");
    expect(normalizeJordanPhone("+962 79 239 8952")).toBe("+962792398952");
  });
  it("rejects unsupported phone formats", () =>
    expect(normalizeJordanPhone("0712345678")).toBeNull());
  it("builds the full 30-minute business-day schedule", () => {
    const slots = getTimeSlots();
    expect(slots).toHaveLength(24);
    expect(slots[0]).toBe("11:00");
    expect(slots.at(-1)).toBe("22:30");
  });
  it("generates a public-safe reference", () =>
    expect(generateReference(new Date("2026-02-01"), () => 0)).toBe(
      "MB-2026-0000",
    ));
  it("calculates business hours in Asia/Amman", () => {
    expect(isOpenInAmman(new Date("2026-01-01T09:00:00Z"))).toBe(true);
    expect(isOpenInAmman(new Date("2026-01-01T22:00:00Z"))).toBe(false);
  });
  it("formats time for display", () =>
    expect(formatTime("17:00", "en")).toContain("5:00"));
});
