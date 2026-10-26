// The sheet transition follows the site's tree rather than the history: the breadcrumb up to
// the notes from a note reached from the home page lifts the note off, as a step back should,
// and the browser's forward button down to a note slides it in. Pages that are not in line keep
// the router's direction. The router keeps one document, so one listener serves every page.
import { hierarchyDirection } from "@/lib/transition-direction";

document.addEventListener("astro:before-preparation", (event) => {
  const direction = hierarchyDirection(event.from.pathname, event.to.pathname);
  if (direction) event.direction = direction;
});
