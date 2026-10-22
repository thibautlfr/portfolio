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

/** A client or partner, named in a row under the About offers. Worded so it stays true once
    the work is over. */
interface Collaboration {
  name: string;
  url: string;
  /** Under the name: what Thibaut does there, a few words. */
  credit: string;
  /** The group it belongs to, or what it is (llms.txt). */
  detail?: string;
}

const collaborations = {
  raccourci: {
    name: "Raccourci Agency",
    url: "https://www.raccourci.fr",
    credit: "Youbook, for Groupe Yoni's tourism software",
    detail: "Groupe Yoni",
  },
  areti: {
    name: "Areti",
    url: "https://areti.fr/approche",
    credit: "Development partner of the studio",
    detail: "a creative and technical studio",
  },
} satisfies Record<string, Collaboration>;

export const profile = {
  name: "Thibaut Lefrançois",
  givenName: "Thibaut",
  familyName: "Lefrançois",
  role: "Freelance full-stack developer",
  positioning:
    "I build web platforms that run in production, and I sweat the parts people see. Java/Kotlin on the server, TypeScript, Vue and React in the browser.",
  email: "hello@thibaut-lefrancois.com",
  location: {
    city: "La Rochelle",
    region: "Nouvelle-Aquitaine",
    country: "France",
    coordinates: "46.16° N, 1.15° W",
  },
  /** Shown above the email in the hero; leave it undefined when not taking missions. */
  availability: "Available for missions now" as string | undefined,
  mobility: "Remote across France, on-site in Bordeaux, La Rochelle, Niort and around",
  languages: ["French", "English"],
  /** Published under public/cv/; the link stays hidden while this is undefined. */
  cvPath: "/cv/thibaut-lefrancois-cv.pdf" as string | undefined,
  stack: {
    languages: ["Kotlin", "Java", "TypeScript"],
    frontEnd: ["Vue", "React", "Astro", "Angular", "Three.js", "WebGL"],
    backEnd: ["Ktor", "Spring Boot", "PostgreSQL", "Temporal", "Docker", "Kubernetes"],
  },
  socials,
  collaborations,
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
