// The list of sections beside a case study or a note (SectionIndex) marks the section being read: the
// last one whose title has passed the upper third of the viewport, or the last one once the
// page is scrolled to its end, since a short closing section may never reach that line.
const READING_LINE = 1 / 3;

let unbind: (() => void) | undefined;

const bindSectionIndex = () => {
  const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-section-index] a")];
  const headings = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))));
  if (links.length === 0 || headings.includes(null)) return;

  let frame = 0;
  const update = () => {
    frame = 0;
    const line = innerHeight * READING_LINE;
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    let current = -1;
    headings.forEach((heading, index) => {
      if (heading && heading.getBoundingClientRect().top <= line) current = index;
    });
    if (atEnd) current = headings.length - 1;
    links.forEach((link, index) => {
      if (index === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  const schedule = () => {
    frame ||= requestAnimationFrame(update);
  };

  update();
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  unbind = () => {
    cancelAnimationFrame(frame);
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
    unbind = undefined;
  };
};

// A module runs once: the index swapped in by later navigations is bound after each swap, and
// released before the next one.
bindSectionIndex();
document.addEventListener("astro:after-swap", bindSectionIndex);
document.addEventListener("astro:before-swap", () => unbind?.());
