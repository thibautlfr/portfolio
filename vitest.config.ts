/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // Vitest hands back an empty string for stylesheets: the design system tests read the
    // tokens and Radix's colours as text.
    css: { include: [/src\/styles\/tokens\/.*\.css/, /@radix-ui\/colors\/.*\.css/] },
  },
});
