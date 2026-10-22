# Audit

Performance, accessibility and SEO audit of the V2 site, on the production build served locally, with the real content (22 October 2026, before the merge into `main`). The first audit ran on placeholder content in Phase 5; the findings it led to are kept below.

## Lighthouse

Lighthouse 12.6 through Lighthouse CI, mobile emulation (Moto G Power class, simulated slow 4G), three runs per page. `pnpm lighthouse` reruns it; CI runs the same assertions on every pull request.

| Page             | Performance | Accessibility | Best practices | SEO | LCP    | CLS | TBT  |
| ---------------- | ----------- | ------------- | -------------- | --- | ------ | --- | ---- |
| `/`              | 100         | 100           | 100            | 100 | 1.58 s | 0   | 0 ms |
| `/work/youbook/` | 100         | 100           | 100            | 100 | 1.43 s | 0   | 0 ms |
| `/notes/`        | 100         | 100           | 100            | 100 | 1.36 s | 0   | 0 ms |

Median of three runs. Every assertion of the CI passes (LCP under 2 s). **The home page is 80 ms over the 1.5 s target**: its largest paint is the pitch text, which waits on the first round trip of the HTML, now 13.9 KB gzipped (11 KB with placeholder content) because of the four project rows, against the 14.6 KB that fits in a first round trip on a fresh connection. Trimming the home page's markup (long cover alt texts, `srcset` lists) is the lever if the target must be met; it is not a blocker.

Weight transferred on the home page: 154 KB in all, of which 63 KB of fonts, 68 KB of images (the four covers and the still frame of the shader, loaded lazily), 14 KB of HTML (CSS inlined) and 9 KB of JavaScript (the router and the shader, loaded after the largest paint).

## What the audit changed

| Finding                                | Cause                                                                                               | Fix                                                                                                                                                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home CLS 0.018                         | Body text, mono and wordmark swapped in after the first paint and reflowed the hero                 | Every face swaps in (`font-display: optional` kept Arial and Courier New on screen on most visits); the faces of the first viewport are preloaded and their fallbacks are metric-adjusted, so the swap does not move the layout |
| Home LCP 1.66 s                        | External CSS blocked the first paint; the shader's boot script and the still frame competed with it | CSS inlined (4 KB gzipped in all); the boot step is inlined and minified, so no script is requested before the largest paint; the still frame loads lazily at low priority                                                      |
| Home LCP on mobile was the portrait    | The portrait cell was half the width                                                                | The portrait column is two fifths wide, so the pitch text, painted with the first frame, is the largest element                                                                                                                 |
| `/notes/` heading order                | Note titles were `h3` directly under the `h1`                                                       | `NoteListItem` takes a heading level: `h2` on the notes page, `h3` in the home section                                                                                                                                          |
| SVG placeholders 404                   | The image service tried to convert SVG to AVIF                                                      | `Media` keeps SVG as SVG and serves every raster as AVIF                                                                                                                                                                        |
| Inline `code` widened a note at 375 px | A long path in a sentence could not break                                                           | `overflow-wrap: anywhere` on inline code in `.prose`                                                                                                                                                                            |
| V1 article URLs ended on the home page | The redirects predated the notes                                                                    | `/blog/first-steps-glsl-shaders-threejs/` (and `/fr`) now lead to `/notes/first-steps-glsl-shaders-threejs/`                                                                                                                    |
| Fragment Mono 22 KB                    | Latin subset for a face that only sets data                                                         | Subset to ASCII and the degree sign: 17 KB                                                                                                                                                                                      |

## Accessibility

- **axe-core 4.10** with the WCAG 2.0, 2.1 and 2.2 A and AA tags plus best practices, at 1440 px and 375 px, on the home page, a case study, the notes index, a note, the legal notice and the 404: no violation. Only "needs review" items remain: the contrast of text over an image or the shader (axe cannot compute a background there; Lighthouse's own run scores 100) and the missing captions of the silent video loops in the two notes, which have no audio track to caption.
- **Overflow**: no page scrolls sideways at 375 px. The audit found one, a long path in an inline `code` of the Bowser Bros note, which widened that page by 3 px.
- **Keyboard**: real Tab presses through each page. The skip link comes first, the order follows the reading order, every focused element shows the teal-11 focus ring, and the shader's pause button is reachable as soon as the shader runs.
- **Motion**: under `prefers-reduced-motion` the shader never loads (the still frame stays), playground previews never play, scroll reveals and view transitions are off.
- **Contrast**: every text and focus pair is listed with its ratio in [`design/direction.md`](design/direction.md#colour); axe's contrast check passes on every page.
- **Still to do by hand**: a VoiceOver pass on the home page and a case study, a keyboard pass on the final content, and a check of the real alt texts.

## Shader lifecycle

Measured in headless Chrome on the production build:

| Case                              | Shader module requested                            | Live            | CLS |
| --------------------------------- | -------------------------------------------------- | --------------- | --- |
| Default                           | after load, the largest paint, one second and idle | yes             | 0   |
| `prefers-reduced-motion: reduce`  | never                                              | no, still frame | 0   |
| WebGL disabled                    | requested, then gives up                           | no, still frame | 0   |
| Software WebGL (no GPU, as in CI) | requested, then gives up                           | no, still frame | 0   |
| Page loaded in a background tab   | two seconds after load at most                     | yes             | 0   |

## SEO and structured data

Every page has a title, a description, a canonical URL, Open Graph and Twitter tags and an Open Graph image. JSON-LD: `ProfilePage` and `Person` on the home page, the project's `schemaType` and a `BreadcrumbList` on case studies, `BlogPosting` and a `BreadcrumbList` on notes. The sitemap lists the nine content URLs and leaves out the 404 and the V1 redirect pages. `robots.txt`, `rss.xml` and `llms.txt` are generated from the content.

To run once the site is online: Google's Rich Results Test on the home page, a case study and a note, and the W3C feed validator on `/rss.xml`.
