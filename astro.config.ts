import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, envField, fontProviders } from "astro/config";

import { legacyRedirects } from "./src/data/legacy-redirects";

// Built by scripts/fonts.sh: instanced and subset, see docs/architecture.md#fonts.
const fontFile = (name: string) => `./src/assets/fonts/${name}.woff2`;

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://thibaut-lefrancois.com",
  // GitHub Pages serves folders and redirects /page to /page/: canonical URLs match that.
  trailingSlash: "always",
  // About 4 KB of CSS gzipped in all: inlining it removes the render-blocking request.
  build: { format: "directory", inlineStylesheets: "always" },
  redirects: legacyRedirects,
  vite: {
    // The hero shader is built as one standalone ES module (see Hero.astro), loaded by an
    // inline boot step: no script request competes with the first paint.
    worker: { format: "es" },
  },
  env: {
    schema: {
      // Umami Cloud site id; analytics stay off when it is not set (local builds, forks).
      PUBLIC_UMAMI_WEBSITE_ID: envField.string({ context: "client", access: "public", optional: true }),
    },
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        "connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev",
        "base-uri 'self'",
        "form-action 'none'",
        "object-src 'none'",
      ],
      scriptDirective: { resources: ["'self'", "https://cloud.umami.is"] },
      // Inline style attributes (cell spans, image ratios) carry no script and are allowed;
      // style elements stay limited to Astro's generated hashes.
      styleDirective: { resources: ["'self'", { resource: "'unsafe-inline'", kind: "attribute" }] },
    },
  },
  integrations: [
    mdx(),
    sitemap({
      // Redirect pages and the 404 are not content.
      filter: (page) =>
        !page.endsWith("/404/") && !Object.keys(legacyRedirects).some((path) => page.endsWith(`${path}/`)),
    }),
  ],
  // The overlay sits on top of the sheets; Astro check and the CI cover what it reports.
  devToolbar: { enabled: false },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Archivo Wordmark",
      cssVariable: "--font-archivo-wordmark",
      fallbacks: ["sans-serif"],
      options: { variants: [{ src: [fontFile("archivo-wordmark")], weight: 800, style: "normal", stretch: "125%" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Stack Sans Notch Email",
      cssVariable: "--font-stack-sans-notch",
      fallbacks: ["sans-serif"],
      options: { variants: [{ src: [fontFile("stack-sans-notch-email")], weight: 700, style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Stack Sans Headline",
      cssVariable: "--font-stack-sans-headline",
      fallbacks: ["sans-serif"],
      options: { variants: [{ src: [fontFile("stack-sans-headline")], weight: 700, style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Stack Sans Text",
      cssVariable: "--font-stack-sans-text",
      fallbacks: ["sans-serif"],
      // Body text: never preloaded and never swapped in late, so it cannot delay the first
      // paint nor move the layout. A slow first visit shows the metric-matched fallback.
      options: {
        variants: [{ src: [fontFile("stack-sans-text")], weight: "400 500", style: "normal", display: "optional" }],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Fragment Mono",
      cssVariable: "--font-fragment-mono",
      fallbacks: ["monospace"],
      // Data only: a system monospace is fine when the file is late, and never swaps in later.
      options: { variants: [{ src: [fontFile("fragment-mono")], weight: 400, style: "normal", display: "optional" }] },
    },
  ],
});
