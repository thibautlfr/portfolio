// Where a link leads, so the ones that leave the portfolio can say so.

/** True when the link leads off the site: another host, the site's own subdomains included
    (an experiment on trinity.thibaut-lefrancois.com is not the portfolio). Paths, anchors and
    mailto links stay on the site. */
export function isExternal(href: string, site: URL): boolean {
  const url = new URL(href, site);
  return (url.protocol === "http:" || url.protocol === "https:") && url.hostname !== site.hostname;
}
