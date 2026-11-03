// Every piece of UI copy, in every language. English is the reference: a key missing or added
// in another language fails astro check. Content (projects, notes) and identity (profile.ts)
// are translated where they live, not here.
import type { Locale } from "./locales";

const en = {
  // Shared
  "site.skip": "Skip to content",
  "site.external": " (external site)",
  "site.viewLarger": "View larger:",
  "site.sections": "Sections",
  "site.breadcrumb": "Breadcrumb",
  "site.language": "Language",
  "footer.designSystem": "Design system",
  "footer.legalNotice": "Legal notice",

  // Facts, wherever a project is described
  "facts.context": "Context",
  "facts.client": "Client",
  "facts.role": "Role",
  "facts.stack": "Stack",
  "context.client": "Client work",
  "context.open-source": "Open source",
  "context.personal": "Side project",
  "context.hackathon": "Hackathon",
  "artwork.poster": "Poster",
  "artwork.painting": "Painting",
  "artwork.drawing": "Drawing",
  "artwork.illustration": "Illustration",

  // Home
  "home.description": "{role} based in {city}. {positioning}",
  "hero.shaderCaption": "I like it when the details are alive.",
  "hero.hintPointer": "Hover to check.",
  "hero.hintTouch": "Tap to check.",
  "hero.pause": "Pause animation",
  "hero.play": "Play animation",
  "hero.base": "Base",
  "hero.mobility": "Mobility",
  "hero.stack": "Stack",
  "work.title": "Selected work",
  "about.title": "About",
  "about.teamTitle": "Inside your team",
  "about.teamText":
    "Missions with product teams, directly or through ESNs. I join the team, its rituals and its codebase, and take features from the ticket to production.",
  "about.productTitle": "For your product",
  "about.productText":
    "Startups and agencies: a platform to build, a product to take to production, or a team to reinforce for a while.",
  "about.factsTitle": "Stack",
  "about.clientsTitle": "Clients and partners",
  "about.languages": "Languages",
  "about.frontEnd": "Front-end",
  "about.backEnd": "Back-end",
  "about.speaks": "Speaks",
  "about.cv": "Download my CV (PDF)",
  "testimonial.title": "Recommendation",
  "testimonial.source": "LinkedIn recommendation",
  "testimonial.translatedFrom": ", translated from {language}",
  "testimonial.readAll": "Read the full recommendation",
  "playground.title": "Playground",
  "artworks.title": "Off the clock",
  "artworks.more": "More on Instagram",
  "notes.title": "Notes",
  "notes.all": "All notes",
  "contact.title": "Have a project or a mission in mind?",
  "contact.socials": "Elsewhere online",
} as const;

export type UiKey = keyof typeof en;

export const uiKeys = Object.keys(en) as UiKey[];

// French typography: a narrow no-break space (U+202F) before ? ! : and ;
const fr: Record<UiKey, string> = {
  "site.skip": "Aller au contenu",
  "site.external": " (site externe)",
  "site.viewLarger": "Agrandir :",
  "site.sections": "Sections",
  "site.breadcrumb": "Fil d'Ariane",
  "site.language": "Langue",
  "footer.designSystem": "Design system",
  "footer.legalNotice": "Mentions légales",

  "facts.context": "Contexte",
  "facts.client": "Client",
  "facts.role": "Rôle",
  "facts.stack": "Stack",
  "context.client": "Projet client",
  "context.open-source": "Open source",
  "context.personal": "Projet personnel",
  "context.hackathon": "Hackathon",
  "artwork.poster": "Affiche",
  "artwork.painting": "Peinture",
  "artwork.drawing": "Dessin",
  "artwork.illustration": "Illustration",

  "home.description": "{role} basé à {city}. {positioning}",
  "hero.shaderCaption": "J'aime quand les détails sont vivants.",
  "hero.hintPointer": "Survolez pour voir.",
  "hero.hintTouch": "Touchez pour voir.",
  "hero.pause": "Mettre l'animation en pause",
  "hero.play": "Relancer l'animation",
  "hero.base": "Base",
  "hero.mobility": "Mobilité",
  "hero.stack": "Stack",
  "work.title": "Projets choisis",
  "about.title": "À propos",
  "about.teamTitle": "Dans votre équipe",
  "about.teamText":
    "Des missions avec des équipes produit, en direct ou via une ESN. Je rejoins l'équipe, ses rituels et son code, et je mène les fonctionnalités du ticket à la production.",
  "about.productTitle": "Pour votre produit",
  "about.productText":
    "Startups et agences : une plateforme à construire, un produit à mettre en production, ou une équipe à renforcer pour un temps.",
  "about.factsTitle": "Stack",
  "about.clientsTitle": "Clients et partenaires",
  "about.languages": "Langages",
  "about.frontEnd": "Front-end",
  "about.backEnd": "Back-end",
  "about.speaks": "Langues",
  "about.cv": "Télécharger mon CV (PDF)",
  "testimonial.title": "Recommandation",
  "testimonial.source": "Recommandation LinkedIn",
  "testimonial.translatedFrom": ", traduite de l'{language}",
  "testimonial.readAll": "Lire la recommandation en entier",
  "playground.title": "Playground",
  "artworks.title": "Hors du code",
  "artworks.more": "La suite sur Instagram",
  "notes.title": "Notes",
  "notes.all": "Toutes les notes",
  "contact.title": "Un projet ou une mission en tête ?",
  "contact.socials": "Ailleurs en ligne",
};

const dictionaries: Record<Locale, Record<UiKey, string>> = { en, fr };

/** The copy of one language, with {name} placeholders filled from `values`. */
export function useTranslations(locale: Locale) {
  const dictionary = dictionaries[locale];
  return (key: UiKey, values: Record<string, string> = {}) =>
    dictionary[key].replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}
