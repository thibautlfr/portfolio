// Images that can be seen larger (ZoomMedia) open in a modal <dialog> the size of the window,
// at the largest width built for them. The dialog brings what a viewer needs: focus moves into
// it and stays there, Escape closes it, the page behind is inert. The images of the page form
// one series: Previous and Next, the arrow keys or a swipe go from one to the next, around the
// end. A click anywhere else closes it, and focus returns to the image last shown.
const SWIPE = 48;

interface Viewer {
  dialog: HTMLDialogElement;
  image: HTMLImageElement;
  caption: HTMLElement;
  count: HTMLElement;
  status: HTMLElement;
}

let viewer: Viewer | undefined;
let series: HTMLElement[] = [];
let index = 0;

const show = ({ dialog, image, caption, count, status }: Viewer) => {
  const trigger = series[index];
  if (!trigger) return;
  const thumbnail = trigger.querySelector("img");
  const { viewerSrc = "", viewerSrcset, viewerCaption = "" } = trigger.dataset;
  // The thumbnail, already loaded, holds the place until the larger image has arrived.
  // Without it, the previous image would stay on screen under the new caption until the next one
  // arrives: the frame stays empty instead.
  image.toggleAttribute("data-loading", !thumbnail?.currentSrc);
  image.removeAttribute("srcset");
  image.src = thumbnail?.currentSrc || viewerSrc;
  image.alt = thumbnail?.alt ?? "";
  if (viewerSrcset) {
    image.sizes = "100vw";
    image.srcset = viewerSrcset;
  } else {
    image.src = viewerSrc;
  }
  const position = `${index + 1} / ${series.length}`;
  caption.textContent = viewerCaption;
  count.textContent = position;
  // Read aloud when the image changes, not when the viewer opens on it.
  status.textContent = dialog.open ? `${position}: ${image.alt}` : "";
};

const step = (parts: Viewer, by: number) => {
  if (series.length < 2) return;
  index = (index + by + series.length) % series.length;
  show(parts);
};

const build = (): Viewer => {
  const dialog = document.createElement("dialog");
  dialog.className = "viewer";
  dialog.setAttribute("aria-label", "Image viewer");
  dialog.innerHTML =
    '<img class="viewer-image" alt="" decoding="async" draggable="false" />' +
    '<div class="viewer-bar"><span></span>' +
    '<span class="visually-hidden" aria-live="polite"></span>' +
    '<span class="viewer-controls"><span class="viewer-count" aria-hidden="true"></span>' +
    '<button type="button" class="viewer-control" data-viewer-step="-1">Previous</button>' +
    '<button type="button" class="viewer-control" data-viewer-step="1">Next</button>' +
    '<button type="button" class="viewer-control" autofocus>Close</button></span></div>';
  const [caption, status] = dialog.querySelectorAll<HTMLElement>(".viewer-bar > span");
  const parts: Viewer = {
    dialog,
    image: dialog.querySelector("img") as HTMLImageElement,
    caption: caption as HTMLElement,
    status: status as HTMLElement,
    count: dialog.querySelector(".viewer-count") as HTMLElement,
  };

  let start: { x: number; y: number } | undefined;
  let swiped = false;
  dialog.addEventListener("pointerdown", (event) => {
    start = { x: event.clientX, y: event.clientY };
    swiped = false;
  });
  dialog.addEventListener("pointerup", (event) => {
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
      swiped = true;
      step(parts, dx < 0 ? 1 : -1);
    }
    start = undefined;
  });
  dialog.addEventListener("click", (event) => {
    // A drag with the mouse ends in a click: it was a swipe, not a request to close.
    if (swiped) return;
    const control = (event.target as Element).closest<HTMLElement>("[data-viewer-step]");
    if (control) step(parts, Number(control.dataset.viewerStep));
    else dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") step(parts, 1);
    else if (event.key === "ArrowLeft") step(parts, -1);
  });
  parts.image.addEventListener("load", () => parts.image.removeAttribute("data-loading"));
  dialog.addEventListener("close", () => series[index]?.focus());
  document.body.append(dialog);
  return parts;
};

const openViewer = (trigger: HTMLElement) => {
  // The router swaps the body on every navigation, and the viewer with it.
  if (!viewer?.dialog.isConnected) viewer = build();
  series = [...document.querySelectorAll<HTMLElement>("main [data-viewer-src]")];
  index = Math.max(0, series.indexOf(trigger));
  viewer.dialog.toggleAttribute("data-viewer-many", series.length > 1);
  show(viewer);
  viewer.dialog.showModal();
};

document.addEventListener("click", (event) => {
  const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-viewer-src]");
  if (trigger) openViewer(trigger);
});
document.addEventListener("astro:before-swap", () => viewer?.dialog.close());
