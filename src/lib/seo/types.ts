import type { Locale } from "@/i18n/locales";

/** Per-page search and sharing metadata, rendered by SeoHead. */
export interface Seo {
  title: string;
  description: string;
  /** Path of the Open Graph image, from /og/. Defaults to the home image. */
  ogImage?: string;
  type?: "website" | "article";
  noindex?: boolean;
  /** The languages the page exists in, linked to each other. Defaults to English only. */
  locales?: readonly Locale[];
  /** Structured data objects, one <script type="application/ld+json"> each. */
  jsonLd?: object[];
}
