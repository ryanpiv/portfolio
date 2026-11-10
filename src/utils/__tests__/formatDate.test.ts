import { formatMonthYear } from "@utils/formatDate";

describe("formatMonthYear", () => {
  it("formats an ISO timestamp as short month + year", () => {
    expect(formatMonthYear("2024-03-09T10:00:00Z")).toBe("Mar 2024");
  });
});
