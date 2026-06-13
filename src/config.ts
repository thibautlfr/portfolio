import type { UIKey } from "@i18n/ui";

export const navLinks: { key: UIKey; href: string }[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.projects", href: "/projects" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.about", href: "/about" },
  { key: "nav.contact", href: "/contact" },
];

export const socials = [
  { label: "GitHub", href: "https://github.com/thibautlfr" },
  { label: "LinkedIn", href: "https://linkedin.com/in/thibaut-lefrancois" },
  { label: "Figma", href: "https://www.figma.com/@thibautlfr" },
  { label: "Twitter", href: "https://x.com/thibautlfr" },
] as const;
