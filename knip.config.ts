import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Imported from CSS (@import), which knip does not read.
  ignoreDependencies: ["@radix-ui/colors"],
  // Read by the Lighthouse CI command, not imported by code.
  ignore: ["lighthouserc.cjs"],
};

export default config;
