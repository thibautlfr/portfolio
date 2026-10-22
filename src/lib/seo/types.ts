/** Per-page search and sharing metadata, rendered by SeoHead. */
export interface Seo {
  title: string;
  description: string;
  /** Path of the Open Graph image, from /og/. Defaults to the home image. */
  ogImage?: string;
  type?: "website" | "article";
  noindex?: boolean;
  /** Structured data objects, one <script type="application/ld+json"> each. */
  jsonLd?: object[];
}
