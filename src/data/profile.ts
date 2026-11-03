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

/** Words a client or partner wrote about the work, published with their agreement. Never
    paraphrased, never invented; a translation stays as close to the original as English allows. */
export interface Testimonial {
  /** One string per paragraph. */
  quote: readonly string[];
  /** The display line on the home page: one whole sentence of the quote, never cut. */
  pull: string;
  author: string;
  /** The author's public profile, linked from their name. */
  authorUrl?: string;
  /** The author's role at the time, for example "CTO". */
  role: string;
  /** The language it was written in, when the quote is a translation. */
  translatedFrom?: string;
}

/** A client or partner, named in a row under the About offers. Worded so it stays true once
    the work is over. */
interface Collaboration {
  name: string;
  url: string;
  /** Under the name: what Thibaut does there, a few words. */
  credit: string;
  /** The group it belongs to, or what it is (llms.txt). */
  detail?: string;
  testimonial?: Testimonial;
}

const collaborations: Readonly<Record<string, Collaboration>> = {
  raccourci: {
    name: "Raccourci Agency",
    url: "https://www.raccourci.fr",
    credit: "Youbook, for Groupe Yoni's tourism software",
    detail: "Groupe Yoni",
    // LinkedIn recommendation of 2026-11-02, translated from French.
    testimonial: {
      quote: [
        "As CTO, I place great importance on a developer's ability to take on complex architecture problems while keeping a sense of the product. During his work-study years, Thibaut went well beyond our expectations on both counts.",
        "He played a decisive role in building the sales funnel of our product YouBook. It is a critical project, on which he brilliantly handled workflow orchestration with Temporal.io to make stock deduction across several third-party APIs reliable in parallel, while keeping the front end flawlessly responsive with Server-Sent Events (SSE).",
        "Thibaut shows a technical maturity that is rare for a work-study profile: rigorous about good practices, autonomous, and with an excellent team spirit. He is a solid asset for any tech team, and I recommend him without the slightest hesitation for his future professional challenges.",
      ],
      pull: "He played a decisive role in building the sales funnel of our product YouBook.",
      author: "Nicolas Péridont",
      authorUrl: "https://www.linkedin.com/in/nicolas-p%C3%A9ridont-27297452/",
      role: "CTO",
      translatedFrom: "French",
    },
  },
  areti: {
    name: "Areti",
    url: "https://areti.fr/approche",
    credit: "Development partner of the studio",
    detail: "a creative and technical studio",
  },
};

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
