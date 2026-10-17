// The hero shader's boot step is inlined in the page (see boot-inline.js). Its CSP hash
// must reach the <head>, which renders before the hero: pages pass it to BaseLayout.
import { createHash } from "node:crypto";

import bootSource from "./boot-inline.js?raw";

export const heroBootScript = bootSource;
export const heroBootScriptHash: `sha256-${string}` = `sha256-${createHash("sha256").update(bootSource).digest("base64")}`;
