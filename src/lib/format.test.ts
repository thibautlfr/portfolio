import { describe, expect, it } from "vitest";

import { formatContext, formatDate, isoDate } from "./format";

describe("formatContext", () => {
  it("names the context and adds the year when known", () => {
    expect(formatContext("hackathon", 2024)).toBe("Hackathon, 2024");
    expect(formatContext("open-source")).toBe("Open source");
  });
});

describe("dates", () => {
  it("formats calendar days without shifting them across time zones", () => {
    const date = new Date("2026-10-01");
    expect(formatDate(date)).toBe("1 October 2026");
    expect(isoDate(date)).toBe("2026-10-01");
  });
});
