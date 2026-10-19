import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Dev-only entries knip does not follow: a route registered with injectRoute in astro.config.ts,
  // and the media kit's script, which src/pages/[mediakit].astro loads as it is from the dev server.
  entry: ["src/proposals/ascii/AsciiPage.astro", "src/scripts/media-kit.ts"],
  // Imported from CSS (@import), which knip does not read.
  ignoreDependencies: ["@radix-ui/colors"],
  // Read by the Lighthouse CI command and by the media tooling (scenes load in /media-kit/), not imported by code.
  ignore: ["lighthouserc.cjs", "media/**"],
};

export default config;
