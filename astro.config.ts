import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import type { AstroIntegration } from "astro";
import { defineConfig, envField, fontProviders } from "astro/config";

import { legacyRedirects } from "./src/data/legacy-redirects";

// Built by scripts/fonts.sh: instanced and subset, see docs/architecture.md#fonts.
const fontFile = (name: string) => `./src/assets/fonts/${name}.woff2`;

// Design proposals under review (src/proposals): routes that exist in `astro dev`, and in a
// build made with PUBLIC_PROPOSALS=true (pnpm proposals) to judge them on the real output.
const proposals: AstroIntegration = {
  name: "proposals",
  hooks: {
    "astro:config:setup": ({ command, injectRoute }) => {
      if (command !== "dev" && process.env["PUBLIC_PROPOSALS"] !== "true") return;
      injectRoute({ pattern: "/proposals/ascii", entrypoint: "./src/proposals/ascii/AsciiPage.astro" });
    },
  },
};

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://thibaut-lefrancois.com",
  // GitHub Pages serves folders and redirects /page to /page/: canonical URLs match that.
  trailingSlash: "always",
  // About 4 KB of CSS gzipped in all: inlining it removes the render-blocking request.
  build: { format: "directory", inlineStylesheets: "always" },
  // Scoped styles through a class rather than a data attribute on every element: shorter HTML.
  scopedStyleStrategy: "class",
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
  integrations: [
    mdx(),
    sitemap({
      // Redirect pages and the 404 are not content.
      filter: (page) =>
        !page.endsWith("/404/") && !Object.keys(legacyRedirects).some((path) => page.endsWith(`${path}/`)),
    }),
    proposals,
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
      // Body text: preloaded on every page and swapped in. display: optional kept the fallback
      // (Arial) on most visits, since the file rarely arrived within its 100ms window.
      options: { variants: [{ src: [fontFile("stack-sans-text")], weight: "400 500", style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Fragment Mono",
      cssVariable: "--font-fragment-mono",
      fallbacks: ["monospace"],
      // Swapped in like the text: Courier New, the fallback, is too thin to stand in for it.
      options: { variants: [{ src: [fontFile("fragment-mono")], weight: 400, style: "normal" }] },
    },
  ],
});
