/** "2024-03-09T10:00:00Z" → "Mar 2024". */
export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}
