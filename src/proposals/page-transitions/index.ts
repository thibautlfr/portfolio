// Page transition proposals: on in `astro dev`, and in a production build made with
// PUBLIC_PROPOSALS=true (pnpm proposals), so they can be judged with the real CSS loading
// and the back-forward cache. The inline script and style carry their CSP hashes.
import { createHash } from "node:crypto";

import boot from "./boot.js?raw";
import styles from "./transitions.css?raw";

export const proposalsEnabled = import.meta.env.DEV || import.meta.env["PUBLIC_PROPOSALS"] === "true";

export const transitionBoot = boot;
export const transitionStyles = styles;

const sha256 = (source: string): `sha256-${string}` => `sha256-${createHash("sha256").update(source).digest("base64")}`;

export const transitionScriptHash = sha256(boot);
export const transitionStyleHash = sha256(styles);
