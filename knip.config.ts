import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Imported from CSS (@import), which knip does not read.
  ignoreDependencies: ["@radix-ui/colors"],
};

export default config;
