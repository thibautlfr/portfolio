// Display formatting shared by pages, feeds and structured data.
import type { Locale } from "@/i18n/locales";

/** "Hackathon, 2024": the context, named in the page's language, then the year when known. */
export function formatContext(label: string, year?: number): string {
  return year ? `${label}, ${year}` : label;
}

interface Client {
  name: string;
  group?: string | undefined;
}

/** "Raccourci Agency, Groupe Yoni": the company, then the group it belongs to. */
export function formatClient(client: Client): string {
  return client.group ? `${client.name}, ${client.group}` : client.name;
}

const dateFormats = {
  en: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
  fr: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
} satisfies Record<Locale, Intl.DateTimeFormat>;

/** "17 October 2026", "17 octobre 2026": content dates are calendar days, so UTC avoids an off-by-one. */
export function formatDate(date: Date, locale: Locale = "en"): string {
  return dateFormats[locale].format(date);
}

/** ISO calendar day, for <time datetime> and structured data. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "thibautlfr" from "https://www.instagram.com/thibautlfr/": the handle is the last path segment. */
export function formatHandle(url: string): string {
  return new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "";
}

export interface Segment {
  text: string;
  code: boolean;
}

/** Splits a line of frontmatter on backticks, so identifiers in it can be set as code. */
export function splitCode(line: string): Segment[] {
  return line
    .split("`")
    .map((text, index) => ({ text, code: index % 2 === 1 }))
    .filter((segment) => segment.text !== "");
}
