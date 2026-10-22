import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Dev-only entry knip does not follow: the media kit's script, which src/pages/[mediakit].astro
  // loads as it is from the dev server.
  entry: ["src/scripts/media-kit.ts"],
  // Imported from CSS (@import), which knip does not read.
  ignoreDependencies: ["@radix-ui/colors"],
  // Read by the Lighthouse CI command and by the media tooling (scenes load in /media-kit/), not imported by code.
  ignore: ["lighthouserc.cjs", "media/**"],
};

export default config;
