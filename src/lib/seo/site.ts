// Site-wide structured data: the author every page points to by @id.
import { getImage } from "astro:assets";

import { profile } from "@/data/profile";

import { person } from "./json-ld";

export async function author(site: URL) {
  const portrait = await getImage({ src: profile.portrait.src, width: 800, format: "jpeg" });
  return person({
    name: profile.name,
    givenName: profile.givenName,
    familyName: profile.familyName,
    role: profile.role,
    email: profile.email,
    image: new URL(portrait.src, site).href,
    url: site.href,
    city: profile.location.city,
    region: profile.location.region,
    country: profile.location.country,
    languages: profile.languages,
    knowsAbout: Object.values(profile.stack).flat(),
    sameAs: profile.socials.map((social) => social.url),
  });
}
