// Videos sit next to their entry and are named in frontmatter by a relative
// path (preview: ./preview.mp4). Vite only fingerprints files it imports, so
// every colocated video is imported here and looked up by path.
const videos = import.meta.glob<string>("/src/content/**/*.{mp4,webm}", {
  query: "?url",
  import: "default",
  eager: true,
});

export function resolveVideo(collection: string, entryId: string, path: string): string {
  const key = `/src/content/${collection}/${entryId}/${path.replace(/^\.\//, "")}`;
  const url = videos[key];
  if (!url) throw new Error(`Video not found for ${collection}/${entryId}: ${path}`);
  return url;
}
