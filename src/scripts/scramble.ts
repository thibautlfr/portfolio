// Data set in mono resolves when pointed at, like a reading settling: every character runs
// through others of its own kind (a digit through digits, a letter through letters), then they
// settle from left to right. Punctuation, symbols and spaces hold still, so the shape of the
// data stays readable, and the monospaced face keeps every width. It plays once per pointer
// entry and stops; never on touch, where a tap is a click, nor under reduced motion.
const DURATION = 420;
// Every character scrambles for this long before the first one settles.
const HOLD = 120;
// A new draw every few frames reads as characters changing, not as noise.
const STEP = 45;

const DIGITS = "0123456789";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = LOWER.toUpperCase();

const poolFor = (char: string, digitsOnly: boolean): string | undefined => {
  if (DIGITS.includes(char)) return DIGITS;
  if (digitsOnly) return undefined;
  if (LOWER.includes(char)) return LOWER;
  if (UPPER.includes(char)) return UPPER;
  return undefined;
};

const pick = (pool: string) => pool.charAt(Math.floor(Math.random() * pool.length));

const running = new WeakSet<HTMLElement>();

const scramble = (element: HTMLElement) => {
  if (running.has(element)) return;
  running.add(element);
  const text = element.dataset.scrambleText ?? (element.textContent ?? "").trim();
  element.dataset.scrambleText = text;
  const chars = [...text];
  const pools = chars.map((char) => poolFor(char, element.dataset.scramble === "digits"));
  const start = performance.now();
  let step = -1;

  const frame = (now: number) => {
    const elapsed = now - start;
    if (elapsed >= DURATION || !element.isConnected) {
      element.textContent = text;
      running.delete(element);
      return;
    }
    const current = Math.floor(elapsed / STEP);
    if (current !== step) {
      step = current;
      const settled = Math.floor((Math.max(0, elapsed - HOLD) / (DURATION - HOLD)) * chars.length);
      element.textContent = chars
        .map((char, index) => {
          const pool = pools[index];
          return index < settled || !pool ? char : pick(pool);
        })
        .join("");
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};

const bindScrambles = () => {
  for (const trigger of document.querySelectorAll<HTMLElement>("[data-scramble-trigger]")) {
    const targets = trigger.querySelectorAll<HTMLElement>("[data-scramble]");
    trigger.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      targets.forEach(scramble);
    });
  }
};

// A module runs once: the elements swapped in by later navigations are bound after each swap.
bindScrambles();
document.addEventListener("astro:after-swap", bindScrambles);
