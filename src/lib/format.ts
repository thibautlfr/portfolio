// Display formatting shared by pages, feeds and structured data.

const contextLabels = {
  client: "Client work",
  "open-source": "Open source",
  personal: "Side project",
  hackathon: "Hackathon",
} as const;

export type ProjectContext = keyof typeof contextLabels;

export function formatContext(context: ProjectContext, year?: number): string {
  return year ? `${contextLabels[context]}, ${year}` : contextLabels[context];
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "17 October 2026": content dates are calendar days, so UTC avoids an off-by-one. */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** ISO calendar day, for <time datetime> and structured data. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "thibautlfr" from "https://www.instagram.com/thibautlfr/": the handle is the last path segment. */
export function formatHandle(url: string): string {
  return new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "";
}
