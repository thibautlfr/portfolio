import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Dev-only routes registered with injectRoute in astro.config.ts, which knip does not follow.
  entry: ["src/proposals/ascii/AsciiPage.astro"],
  // Imported from CSS (@import), which knip does not read.
  ignoreDependencies: ["@radix-ui/colors"],
  // Read by the Lighthouse CI command, not imported by code.
  ignore: ["lighthouserc.cjs"],
};

export default config;
