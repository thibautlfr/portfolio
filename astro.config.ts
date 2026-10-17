import { defineConfig } from "astro/config";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://thibaut-lefrancois.com",
  // GitHub Pages serves folders and redirects /page to /page/: canonical URLs match that.
  trailingSlash: "always",
  build: { format: "directory" },
});
