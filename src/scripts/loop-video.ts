// Playground previews: a loop plays while its card is hovered or focused, and
// rewinds when left. Nothing plays on its own, so no pause control is needed
// (WCAG 2.2.2), and nothing plays at all under reduced motion.
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  for (const video of document.querySelectorAll<HTMLVideoElement>("[data-loop-video]")) {
    const card = video.closest("article") ?? video;
    const play = () => {
      video.preload = "auto";
      void video.play().catch(() => undefined);
    };
    const stop = () => {
      video.pause();
      video.currentTime = 0;
    };
    card.addEventListener("pointerenter", play);
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusin", play);
    card.addEventListener("focusout", stop);
  }
}
