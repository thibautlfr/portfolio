import { defineConfig, fontProviders } from "astro/config";

// Built by scripts/fonts.sh: instanced and subset, see docs/architecture.md#fonts.
const fontFile = (name: string) => `./src/assets/fonts/${name}.woff2`;

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://thibaut-lefrancois.com",
  // GitHub Pages serves folders and redirects /page to /page/: canonical URLs match that.
  trailingSlash: "always",
  build: { format: "directory" },
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
      options: { variants: [{ src: [fontFile("stack-sans-text")], weight: "400 500", style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Fragment Mono",
      cssVariable: "--font-fragment-mono",
      fallbacks: ["monospace"],
      options: { variants: [{ src: [fontFile("fragment-mono")], weight: 400, style: "normal" }] },
    },
  ],
});
