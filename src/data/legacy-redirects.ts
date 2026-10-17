// URLs of the V1 site that no longer exist in V2. They are sent to the home
// page so links shared or indexed before the rebuild do not end on a 404.
// When a V2 page takes over an old article, point its entry at that page.
// /rss.xml and /legal-notice keep their URL in V2 and are not listed here.
export const legacyRedirects: Record<string, string> = {
  "/about": "/",
  "/projects": "/",
  "/labs": "/",
  "/blog": "/",
  "/blog/first-steps-glsl-shaders-threejs": "/",
  "/blog/first-steps-glsl-shaders-threejs/fr": "/",
  "/blog/why-i-chose-astro-for-my-portfolio": "/",
  "/blog/why-i-chose-astro-for-my-portfolio/fr": "/",
};
