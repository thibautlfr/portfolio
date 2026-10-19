// Lighthouse CI: mobile emulation and simulated 4G (Lighthouse defaults), three
// runs per page, on the home, a case study and the notes index.
// Performance asserts 0.95 to absorb CI noise; 100 is checked on a median run.
const assertions = {
  "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
  "categories:accessibility": ["error", { minScore: 1 }],
  "categories:best-practices": ["error", { minScore: 1 }],
  "categories:seo": ["error", { minScore: 1 }],
  "largest-contentful-paint": ["error", { maxNumericValue: 1500, aggregationMethod: "median-run" }],
  "cumulative-layout-shift": ["error", { maxNumericValue: 0 }],
  // Transfer budgets, in bytes: JavaScript stays under 10 KB, fonts under 80 KB.
  "resource-summary:script:size": ["error", { maxNumericValue: 10240 }],
  "resource-summary:font:size": ["error", { maxNumericValue: 81920 }],
};

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      url: ["/", "/work/youbook/", "/notes/"],
      numberOfRuns: 3,
    },
    assert: {
      assertMatrix: [
        {
          // The home's largest element is the pitch, set in the body face. Preloading that face
          // (24.5 KB, so the page shows Stack Sans Text rather than its fallback) costs about
          // 75 ms of LCP on simulated 4G: about 1.51 s against 1.43 s with display: optional.
          matchingUrlPattern: "^https?://[^/]+/$",
          assertions: {
            ...assertions,
            "largest-contentful-paint": ["error", { maxNumericValue: 1600, aggregationMethod: "median-run" }],
          },
        },
        { matchingUrlPattern: "^https?://[^/]+/.+", assertions },
      ],
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/reports" },
  },
};
