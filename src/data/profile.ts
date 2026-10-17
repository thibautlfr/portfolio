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
];

export const profile = {
  name: "Thibaut Lefrançois",
  givenName: "Thibaut",
  familyName: "Lefrançois",
  role: "Freelance full-stack developer",
  positioning:
    "I build web platforms that run in production, and I sweat the parts people see. TypeScript end to end, WebGL when it earns its place.",
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
  cvPath: undefined as string | undefined,
  stack: {
    languages: ["TypeScript", "JavaScript", "GLSL"],
    frontEnd: ["React", "Astro", "Three.js"],
    backEnd: ["Node.js", "PostgreSQL"],
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
