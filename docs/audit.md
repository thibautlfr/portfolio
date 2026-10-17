# Audit

Performance, accessibility and SEO audit of the V2 site (Phase 5), on the production build served locally. Placeholder content; rerun after the real texts and visuals land.

## Lighthouse

Lighthouse 12 through Lighthouse CI, mobile emulation (Moto G Power class, simulated slow 4G), three runs per page. `pnpm lighthouse` reruns it; CI runs the same assertions on every pull request.

| Page             | Performance | Accessibility | Best practices | SEO | LCP    | CLS | TBT  |
| ---------------- | ----------- | ------------- | -------------- | --- | ------ | --- | ---- |
| `/`              | 100         | 100           | 100            | 100 | 1.43 s | 0   | 0 ms |
| `/work/youbook/` | 100         | 100           | 100            | 100 | 1.20 s | 0   | 0 ms |
| `/notes/`        | 100         | 100           | 100            | 100 | 1.20 s | 0   | 0 ms |

Weight transferred on the home page: 92 KB in all, of which 61 KB of fonts, 11 KB of HTML (CSS inlined), 7 KB for the portrait and 2.7 KB of JavaScript (the shader, loaded after the largest paint).

## What the audit changed

| Finding                             | Cause                                                                                               | Fix                                                                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home CLS 0.018                      | Body text, mono and wordmark swapped in after the first paint and reflowed the hero                 | Body text and mono use `font-display: optional` and are not preloaded; the wordmark and the email (2 KB each) are preloaded on the home page, Headline on inner pages               |
| Home LCP 1.66 s                     | External CSS blocked the first paint; the shader's boot script and the still frame competed with it | CSS inlined (4 KB gzipped in all); the boot step is inlined and hashed in the CSP, so no script is requested before the largest paint; the still frame loads lazily at low priority |
| Home LCP on mobile was the portrait | The portrait cell was half the width                                                                | The portrait column is two fifths wide, so the pitch text, painted with the first frame, is the largest element                                                                     |
| `/notes/` heading order             | Note titles were `h3` directly under the `h1`                                                       | `NoteListItem` takes a heading level: `h2` on the notes page, `h3` in the home section                                                                                              |
| SVG placeholders 404                | The image service tried to convert SVG to AVIF                                                      | `Media` keeps SVG as SVG and serves every raster as AVIF                                                                                                                            |
| Fragment Mono 22 KB                 | Latin subset for a face that only sets data                                                         | Subset to ASCII and the degree sign: 17 KB                                                                                                                                          |

## Accessibility

- **axe-core 4** with the WCAG 2.0, 2.1 and 2.2 A and AA tags plus best practices, at 1440 px and 375 px, on the home page, a case study, the notes index, a note, the legal notice and the 404: no violation, nothing left for manual review.
- **Keyboard**: real Tab presses through each page. The skip link comes first, the order follows the reading order, every focused element shows the teal-11 focus ring, and the shader's pause button is reachable as soon as the shader runs.
- **Motion**: under `prefers-reduced-motion` the shader never loads (the still frame stays), playground previews never play, scroll reveals and view transitions are off.
- **Contrast**: every text and focus pair is listed with its ratio in [`design/direction.md`](design/direction.md#colour); axe's contrast check passes on every page.
- **Still to do by hand before launch**: a VoiceOver pass on the final content, and a check of the real alt texts.

## Shader lifecycle

Measured in headless Chrome on the production build:

| Case                             | Shader module requested                            | Live            | CLS |
| -------------------------------- | -------------------------------------------------- | --------------- | --- |
| Default                          | after load, the largest paint, one second and idle | yes             | 0   |
| `prefers-reduced-motion: reduce` | never                                              | no, still frame | 0   |
| WebGL disabled                   | requested, then gives up                           | no, still frame | 0   |

## SEO and structured data

Every page has a title, a description, a canonical URL, Open Graph and Twitter tags and an Open Graph image. JSON-LD: `ProfilePage` and `Person` on the home page, the project's `schemaType` and a `BreadcrumbList` on case studies, `BlogPosting` and a `BreadcrumbList` on notes. The sitemap lists the ten content URLs and leaves out the 404 and the V1 redirect pages. `robots.txt`, `rss.xml` and `llms.txt` are generated from the content.

To run once the site is online: Google's Rich Results Test on the home page, a case study and a note, and the W3C feed validator on `/rss.xml`.
