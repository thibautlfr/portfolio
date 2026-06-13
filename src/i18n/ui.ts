export const languages = { fr: "Français", en: "English" } as const;
export const defaultLang = "fr" as const;

export const ui = {
  fr: {
    // Navigation
    "nav.home": "ACCUEIL",
    "nav.projects": "PROJETS",
    "nav.blog": "BLOG",
    "nav.about": "À PROPOS",
    "nav.contact": "CONTACT",

    // Menu
    "menu.label": "Menu",
    "menu.socials": "Réseaux",
    "menu.opensNewTab": "(s'ouvre dans un nouvel onglet)",

    // Layout
    "skip.toContent": "Aller au contenu",
    "site.defaultTitle": "Thibaut LEFRANCOIS - portfolio",
    "site.defaultDescription":
      "Portfolio de Thibaut LEFRANCOIS, développeur web full-stack.",

    // Blog
    "blog.draft": "brouillon",
    "blog.pageTitle": "Blog — Thibaut LEFRANCOIS",
    "blog.title": "Blog",

    // Projects
    "projects.pageTitle": "Projets — Thibaut LEFRANCOIS",
    "projects.title": "Projets",
    "project.wip": "en cours",
    "project.date": "Date",
    "project.description": "Description",
    "project.stack": "Stack",
    "project.demo": "Démo",
    "project.coverAlt": "Cover du projet",

    // Table of contents
    "toc.title": "Sommaire",
    "toc.aria": "Table des matières",

    // Language switcher
    "switcher.label": "English",
    "switcher.opensNewTab": "Passer en anglais",

    // Fallback notice (content not yet translated)
    "content.frenchOnly": "Cet article n'est disponible qu'en français.",
    "content.frenchOnlyProject": "Ce projet n'est disponible qu'en français.",
    "content.frenchOnlyBadge": "FR",
  },
  en: {
    // Navigation
    "nav.home": "HOME",
    "nav.projects": "PROJECTS",
    "nav.blog": "BLOG",
    "nav.about": "ABOUT",
    "nav.contact": "CONTACT",

    // Menu
    "menu.label": "Menu",
    "menu.socials": "Socials",
    "menu.opensNewTab": "(opens in a new tab)",

    // Layout
    "skip.toContent": "Skip to content",
    "site.defaultTitle": "Thibaut LEFRANCOIS - portfolio",
    "site.defaultDescription":
      "Portfolio of Thibaut LEFRANCOIS, full-stack web developer.",

    // Blog
    "blog.draft": "draft",
    "blog.pageTitle": "Blog — Thibaut LEFRANCOIS",
    "blog.title": "Blog",

    // Projects
    "projects.pageTitle": "Projects — Thibaut LEFRANCOIS",
    "projects.title": "Projects",
    "project.wip": "in progress",
    "project.date": "Date",
    "project.description": "Description",
    "project.stack": "Stack",
    "project.demo": "Demo",
    "project.coverAlt": "Project cover",

    // Table of contents
    "toc.title": "Contents",
    "toc.aria": "Table of contents",

    // Language switcher
    "switcher.label": "Français",
    "switcher.opensNewTab": "Switch to French",

    // Fallback notice (content not yet translated)
    "content.frenchOnly": "This article is only available in French.",
    "content.frenchOnlyProject": "This project is only available in French.",
    "content.frenchOnlyBadge": "FR",
  },
} as const;

export type Locale = keyof typeof ui;
export type UIKey = keyof (typeof ui)[typeof defaultLang];
