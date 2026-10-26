// Preview loops (LoopMedia): a loop plays from its start while its card, the nearest ancestor
// marked data-loop-video-trigger, is hovered with a mouse or focused from the keyboard, and shows
// once it actually plays. Nothing plays on its own, so no pause control is needed (WCAG 2.2.2),
// and nothing plays at all under reduced motion. A touch screen has no hover: a tap while
// scrolling would start a loop that nothing stops, so touch and taps leave the cover alone.
const bindLoopVideos = () => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const video of document.querySelectorAll<HTMLVideoElement>("[data-loop-video]")) {
    const card = video.closest("[data-loop-video-trigger]") ?? video;
    const play = () => {
      video.preload = "auto";
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    };
    // The frame stays where it stopped while the loop fades out; play() rewinds it.
    const stop = () => {
      video.pause();
      video.classList.remove("is-playing");
    };
    video.addEventListener("playing", () => video.classList.add("is-playing"));
    card.addEventListener("pointerenter", (event) => {
      if (event instanceof PointerEvent && event.pointerType === "mouse") play();
    });
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusin", (event) => {
      if (event.target instanceof Element && event.target.matches(":focus-visible")) play();
    });
    card.addEventListener("focusout", stop);
  }
};

// A module runs once: the cards swapped in by later navigations are bound after each swap.
bindLoopVideos();
document.addEventListener("astro:after-swap", bindLoopVideos);
