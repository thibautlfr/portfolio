// Whether an English page offers its French version: once, to a visitor whose browser puts
// French first. The decision is kept apart from the DOM so it can be tested.

/** localStorage key set once the hint was dismissed or followed, or a French page was read. */
export const languageHintKey = "language-hint";

interface HintContext {
  /** navigator.languages, most preferred first. */
  languages: readonly string[];
  /** The stored answer, if any: once set, the hint never comes back. */
  answered: boolean;
  /** `?lang-hint` in the address: shows the hint whatever the browser says, to check it. */
  forced: boolean;
}

export function shouldOfferFrench({ languages, answered, forced }: HintContext): boolean {
  if (forced) return true;
  if (answered) return false;
  // Only the first choice counts: a visitor who reads French second chose English first.
  return languages[0]?.toLowerCase().split("-")[0] === "fr";
}
