// Identity and contact: one typed object read by pages, the footer, the legal
// notice and structured data. Edit facts here, never in components.
import avatar from "@/assets/images/avatar.png";
import portrait from "@/assets/images/portrait.jpg";

interface Social {
  label: string;
  url: string;
}

const socials: readonly Social[] = [
  { label: "LinkedIn", url: "https://linkedin.com/in/thibaut-lefrancois" },
  { label: "GitHub", url: "https://github.com/thibautlfr" },
  { label: "X", url: "https://x.com/thibautlfr" },
  { label: "Instagram", url: "https://www.instagram.com/thibautlfr/" },
];

export const profile = {
  name: "Thibaut Lefrançois",
  givenName: "Thibaut",
  familyName: "Lefrançois",
  role: "Freelance full-stack developer",
  positioning:
    "I build web platforms that run in production, and I sweat the parts people see. Kotlin on the server, TypeScript, Vue and WebGL in the browser.",
  email: "hello@thibaut-lefrancois.com",
  location: {
    city: "La Rochelle",
    region: "Nouvelle-Aquitaine",
    country: "France",
    coordinates: "46.16° N, 1.15° W",
  },
  mobility: "Remote across France, on-site in Bordeaux, Niort and around",
  languages: ["French", "English"],
  /** Published under public/cv/; the link stays hidden while this is undefined. */
  cvPath: "/cv/thibaut-lefrancois-cv.pdf" as string | undefined,
  stack: {
    languages: ["Kotlin", "Java", "TypeScript"],
    frontEnd: ["Vue 3", "Astro", "Three.js", "WebGL"],
    backEnd: ["Ktor", "PostgreSQL", "Temporal", "Docker", "Kubernetes"],
  },
  socials,
  portrait: {
    src: portrait,
    alt: "Black and white portrait of Thibaut Lefrançois, smiling, in a white shirt.",
  },
  avatar: {
    src: avatar,
    alt: "Drawn avatar of Thibaut with halftone hair and a pencil behind his ear.",
  },
  legal: {
    publisher: "Thibaut Lefrançois",
    host: {
      name: "GitHub, Inc.",
      address: "88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States",
      url: "https://github.com",
    },
  },
} as const;
