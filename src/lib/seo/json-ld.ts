// Structured data builders (schema.org, JSON-LD). Pure functions: pages pass
// absolute URLs in, so the shapes can be unit tested.

interface PersonInput {
  name: string;
  givenName: string;
  familyName: string;
  role: string;
  email: string;
  image: string;
  url: string;
  city: string;
  region: string;
  country: string;
  languages: readonly string[];
  knowsAbout: readonly string[];
  sameAs: readonly string[];
}

export function person(input: PersonInput) {
  return {
    "@type": "Person",
    "@id": `${input.url}#person`,
    name: input.name,
    givenName: input.givenName,
    familyName: input.familyName,
    jobTitle: input.role,
    email: `mailto:${input.email}`,
    image: input.image,
    url: input.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.city,
      addressRegion: input.region,
      addressCountry: input.country,
    },
    knowsLanguage: input.languages,
    knowsAbout: input.knowsAbout,
    sameAs: input.sameAs,
  };
}

/** The home page: a profile page about the person. */
export function profilePage(personData: ReturnType<typeof person>) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: personData,
  };
}

interface WorkInput {
  type: "CreativeWork" | "SoftwareSourceCode" | "WebApplication" | "VideoGame";
  name: string;
  description: string;
  url: string;
  authorUrl: string;
  image?: string;
  year?: number;
  keywords: readonly string[];
  codeRepository?: string;
  /** The client the work was made for, and the group it belongs to. */
  producer?: { name: string; url?: string | undefined; group?: string | undefined };
}

function organization({ name, url, group }: NonNullable<WorkInput["producer"]>) {
  return {
    "@type": "Organization",
    name,
    ...(url && { url }),
    ...(group && { parentOrganization: { "@type": "Organization", name: group } }),
  };
}

export function work(input: WorkInput) {
  return {
    "@context": "https://schema.org",
    "@type": input.type,
    name: input.name,
    description: input.description,
    url: input.url,
    author: { "@id": `${input.authorUrl}#person` },
    keywords: input.keywords.join(", "),
    ...(input.image && { image: input.image }),
    ...(input.year && { dateCreated: String(input.year) }),
    ...(input.codeRepository && { codeRepository: input.codeRepository }),
    ...(input.producer && { producer: organization(input.producer) }),
    ...(input.type === "WebApplication" && { applicationCategory: "BusinessApplication" }),
  };
}

interface PostingInput {
  headline: string;
  description: string;
  url: string;
  authorUrl: string;
  datePublished: string;
  dateModified?: string;
  keywords: readonly string[];
  image?: string;
}

export function blogPosting(input: PostingInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    author: { "@id": `${input.authorUrl}#person` },
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    ...(input.keywords.length > 0 && { keywords: input.keywords.join(", ") }),
    ...(input.image && { image: input.image }),
  };
}

interface PageInput {
  name: string;
  description: string;
  url: string;
  authorUrl: string;
}

/** A page of the site that is neither a case study nor a note. */
export function webPage(input: PageInput) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: input.url,
    author: { "@id": `${input.authorUrl}#person` },
  };
}

export function breadcrumbs(items: readonly { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
