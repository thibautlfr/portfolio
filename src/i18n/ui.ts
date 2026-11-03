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

  // Case study
  "work.titleSuffix": "case study",
  "work.next": "Next case study",
  "work.decisions": "Decisions",
  "work.figures": "Figures",
  "work.untranslated": "This case study is not translated yet: it reads in English.",

  // Notes
  "notes.description":
    "Short notes on web development, shaders and freelance work: experiments, things learned, and posts first shared on X and LinkedIn.",
  "notes.intro": "Experiments, things learned, and posts first shared on X and LinkedIn.",
  "note.published": "Published",
  "note.updated": "Updated",
  "note.source": "Originally posted on {platform}",
  "note.untranslated": "This note is not translated yet: it reads in English.",

  // Legal notice
  "legal.title": "Legal notice",
  "legal.description": "Publisher, hosting and personal data information for {name}'s website.",
  "legal.intro": "Who publishes this website, who hosts it, and what happens to your data.",
  "legal.publisher": "Publisher",
  "legal.name": "Name",
  "legal.individual": "{name}, individual",
  "legal.contact": "Contact",
  "legal.address":
    "In accordance with article 6-III-2 of French law no. 2004-575 of 21 June 2004 (LCEN), an individual publisher is not required to disclose their personal address. This information has been communicated to the hosting provider.",
  "legal.hosting": "Hosting",
  "legal.hostAddress": "Address",
  "legal.website": "Website",
  "legal.data": "Personal data",
  "legal.dataText":
    "This website sets no cookie, and stores nothing on your device unless you turn the count off. Audience is measured with Umami Cloud, run by Umami Software, Inc., with the data hosted in the European Union, in Frankfurt. Each visit records the page, the referring site, the browser, the operating system, the device type and the approximate location. Your IP address is used to tell visits apart and to find the country, and is not kept with the statistics. The figures are only read as totals, to know which pages are visited. They are not shared, and are kept for six months.",
  "legal.optOutBlock": "To opt out, block {domain}, as most content blockers do.",
  "legal.counted": "Visits from this browser are counted.",
  "legal.stop": "Stop counting them",
  "legal.stopped": "Visits from this browser are no longer counted.",
  "legal.resume": "Count them again",
  "legal.emails": "Emails you send are only used to answer you.",
  "legal.property": "Intellectual property",
  "legal.propertyText":
    "All content on this website (text, images, source code, graphic elements) is the property of {name} unless stated otherwise. Any reproduction without prior authorisation is prohibited.",
  "legal.law": "Applicable law",
  "legal.lawText":
    "This legal notice is governed by French law. In the event of a dispute, French courts have exclusive jurisdiction.",

  // The one-time hint towards the other language
  "hint.label": "Language",
  "hint.text": "This page is also in English.",
  "hint.link": "Read it in English",
  "hint.close": "Close",

  // Open Graph cards
  "og.caseStudy": "Case study",
  "og.note": "Note",
  "og.worksWith": "Works with",

  // The lens demo, in the note on the 3D carousel
  "lens.fallback": "The live lens needs JavaScript and WebGL.",
  "lens.uniforms": "The lens's uniforms",
  "lens.reset": "Back to the project's values",

  // Not found
  "notFound.title": "This page does not exist",
  "notFound.text":
    "It may have moved when the site was rebuilt. The home page has everything, and the email still works.",
  "notFound.home": "Back to the home page",
} as const;

export type UiKey = keyof typeof en;

export const uiKeys = Object.keys(en) as UiKey[];

// French typography: a narrow no-break space (U+202F) before ? ! : and ;
const fr: Record<UiKey, string> = {
  "site.skip": "Aller au contenu",
  "site.external": " (site externe)",
  "site.viewLarger": "Agrandir\u202f:",
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
    "Startups et agences\u202f: une plateforme à construire, un produit à mettre en production, ou une équipe à renforcer pour un temps.",
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
  "contact.title": "Un projet ou une mission en tête\u202f?",
  "contact.socials": "Ailleurs en ligne",

  "work.titleSuffix": "étude de cas",
  "work.next": "Étude de cas suivante",
  "work.decisions": "Décisions",
  "work.figures": "Chiffres",
  "work.untranslated": "Cette étude de cas n'est pas encore traduite\u202f: elle est en anglais.",

  "notes.description":
    "Des notes courtes sur le développement web, les shaders et le freelance\u202f: des expériences, des choses apprises, et des posts d'abord publiés sur X et LinkedIn.",
  "notes.intro": "Des expériences, des choses apprises, et des posts d'abord publiés sur X et LinkedIn.",
  "note.published": "Publiée le",
  "note.updated": "Mise à jour le",
  "note.source": "Publiée d'abord sur {platform}",
  "note.untranslated": "Cette note n'est pas encore traduite\u202f: elle est en anglais.",

  "legal.title": "Mentions légales",
  "legal.description": "L'éditeur, l'hébergeur et les données personnelles du site de {name}.",
  "legal.intro": "Qui publie ce site, qui l'héberge, et ce que deviennent vos données.",
  "legal.publisher": "Éditeur",
  "legal.name": "Nom",
  "legal.individual": "{name}, personne physique",
  "legal.contact": "Contact",
  "legal.address":
    "Conformément à l'article 6-III-2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), un éditeur personne physique peut ne pas rendre publique son adresse personnelle. Elle a été communiquée à l'hébergeur.",
  "legal.hosting": "Hébergement",
  "legal.hostAddress": "Adresse",
  "legal.website": "Site",
  "legal.data": "Données personnelles",
  "legal.dataText":
    "Ce site ne dépose aucun cookie et n'enregistre rien sur votre appareil, sauf si vous désactivez la mesure d'audience. L'audience est mesurée avec Umami Cloud, édité par Umami Software, Inc., les données étant hébergées dans l'Union européenne, à Francfort. Chaque visite enregistre la page, le site d'origine, le navigateur, le système d'exploitation, le type d'appareil et la localisation approximative. Votre adresse IP sert à distinguer les visites et à trouver le pays, et n'est pas conservée avec les statistiques. Les chiffres ne sont lus qu'en totaux, pour savoir quelles pages sont visitées. Ils ne sont pas partagés et sont conservés six mois.",
  "legal.optOutBlock": "Pour ne pas être compté, bloquez {domain}, comme le font la plupart des bloqueurs de contenu.",
  "legal.counted": "Les visites depuis ce navigateur sont comptées.",
  "legal.stop": "Ne plus les compter",
  "legal.stopped": "Les visites depuis ce navigateur ne sont plus comptées.",
  "legal.resume": "Les compter à nouveau",
  "legal.emails": "Les emails que vous envoyez servent uniquement à vous répondre.",
  "legal.property": "Propriété intellectuelle",
  "legal.propertyText":
    "Tout le contenu de ce site (textes, images, code source, éléments graphiques) appartient à {name}, sauf mention contraire. Toute reproduction sans autorisation préalable est interdite.",
  "legal.law": "Droit applicable",
  "legal.lawText":
    "Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français sont seuls compétents.",

  "hint.label": "Langue",
  "hint.text": "Cette page existe aussi en français.",
  "hint.link": "La lire en français",
  "hint.close": "Fermer",

  "og.caseStudy": "Étude de cas",
  "og.note": "Note",
  "og.worksWith": "Travaille avec",

  "lens.fallback": "La lentille en direct a besoin de JavaScript et de WebGL.",
  "lens.uniforms": "Les uniforms de la lentille",
  "lens.reset": "Revenir aux valeurs du projet",

  "notFound.title": "Cette page n'existe pas",
  "notFound.text":
    "Elle a peut-être changé d'adresse quand le site a été refait. L'accueil a tout, et l'email fonctionne toujours.",
  "notFound.home": "Retour à l'accueil",
};

const dictionaries: Record<Locale, Record<UiKey, string>> = { en, fr };

/** The copy of one language, with {name} placeholders filled from `values`. */
export function useTranslations(locale: Locale) {
  const dictionary = dictionaries[locale];
  return (key: UiKey, values: Record<string, string> = {}) =>
    dictionary[key].replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}
