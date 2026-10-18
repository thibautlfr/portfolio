// Page transition proposals: on in `astro dev`, and in a production build made with
// PUBLIC_PROPOSALS=true (pnpm proposals), so they can be judged with the real CSS loading.
import boot from "./boot.js?raw";
import styles from "./transitions.css?raw";

export const proposalsEnabled = import.meta.env.DEV || import.meta.env["PUBLIC_PROPOSALS"] === "true";

export const transitionBoot = boot;
export const transitionStyles = styles;
