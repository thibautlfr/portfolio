const withSlash = (path: string) => (path.endsWith("/") ? path : `${path}/`);

/**
 * The direction of a page transition when one page sits above the other in the site's tree:
 * going up to a parent ("/notes/" from "/notes/some-note/", or the home page from anywhere)
 * is a step back, going down to a child a step forward, whatever the history says. Pages
 * that are not in line (two notes, a case study and the legal notice) return undefined and
 * keep the history's direction.
 */
export function hierarchyDirection(from: string, to: string): "forward" | "back" | undefined {
  const [a, b] = [withSlash(from), withSlash(to)];
  if (a === b) return undefined;
  if (a.startsWith(b)) return "back";
  if (b.startsWith(a)) return "forward";
  return undefined;
}
