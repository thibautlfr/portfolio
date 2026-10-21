# Design system

The reference for the visual identity: what the site uses, under which names, and how to carry it onto other media. Why it looks this way is in [`direction.md`](direction.md). The tokens live in [`src/styles/tokens/`](../../src/styles/tokens/); this file describes them and must follow them.

## Principles

1. **The sheet is the layout.** White cells bounded by hairlines on a sage ground. Structure is drawn by the content's own edges, never by a decorative grid.
2. **The frame is quiet, the works are loud.** Type, colour and space stay sober; colour comes from the shader, the project visuals and the posters.
3. **Engineering first.** Data is set as data (mono, tabular figures), facts come before adjectives, nothing is claimed that is not shown.
4. **One continuous motion.** The hero shader moves; everything else answers the visitor briefly and stops.
5. **Accessible by construction.** Every colour pair is checked against WCAG 2.2 AA, every motion respects reduced motion, every image carries its alt text.

## Colour

Two levels: Radix primitives (`--sage-*`, `--teal-*`) are only read by `tokens/color.css`; everything else uses the roles below.

| Token                   | Value   | Hex     | Use                                                 |
| ----------------------- | ------- | ------- | --------------------------------------------------- |
| `--color-ground`        | sage-2  | #f7f9f8 | Page background, between sheets                     |
| `--color-surface`       | white   | #ffffff | Cells                                               |
| `--color-text`          | sage-12 | #1a211e | Text, titles, the wordmark                          |
| `--color-text-muted`    | sage-11 | #5f6563 | Labels, captions, dates                             |
| `--color-line`          | sage-7  | #cbcfcd | Hairlines (decorative)                              |
| `--color-accent`        | teal-9  | #12a594 | Underlines, award frames, hovered image frames      |
| `--color-accent-text`   | teal-12 | #0d3d38 | Teal text at body size                              |
| `--color-link`          | teal-11 | #008573 | Links on white cells only                           |
| `--color-focus`         | teal-11 | #008573 | Focus ring, 2px, 2px offset                         |
| `--color-selection`     | teal-4  | #ccf3ea | Text selection                                      |
| `--color-shader-ground` | ink     | #091213 | The shader's darkest ink and still-frame background |

Rules: teal-11 never sets body text on sage (4.47:1) and never sits on a tinted ground; nothing white goes on teal-9 (3.07:1); focus rings use teal-11, not teal-7. All measured pairs are in [`direction.md`](direction.md#colour).

The shader carries its own palette, outside the tokens: ink #091213, teal-12 #0d3d38, teal-9 #12a594, coral #f2785c, ivory #f5ede0.

## Type

| Token             | Face                | Weight     | Use                                                                   |
| ----------------- | ------------------- | ---------- | --------------------------------------------------------------------- |
| `--font-wordmark` | Archivo, width 125% | 800        | The name, and only the name                                           |
| `--font-title`    | Stack Sans Headline | 700        | Titles, project names, the footer email on inner pages                |
| `--font-text`     | Stack Sans Text     | 300 to 600 | Everything else; case study and note bodies at 300, their bold at 600 |
| `--font-code`     | System monospace    | 400        | Code: SF Mono, Menlo, Consolas, the faces code is read in             |
| `--font-email`    | Stack Sans Notch    | 700        | The email address, at display size                                    |
| `--font-data`     | Fragment Mono       | 400        | Coordinates, dates, handles, figures                                  |

Scale (fluid between 320 and 1440 px): `--font-size-step-minus-1` 13 to 14 px, `step-0` 16 to 17 px, `step-1` 18 to 21 px, `step-2` 22 to 28 px, `step-3` 28 to 44 px, `step-4` 32 to 56 px (a note's title), `step-5` 40 to 96 px. The email is fitted to the width of its own cell (a size container), so it stays on one line at every width: up to `step-2` in the hero, up to `step-5` in the contact section, where it is the display line and the question above it is a `step-2` title. `step-minus-1` in muted grey is for labels, captions and metadata (dates, kinds, handles); a sentence meant to be read, such as a note or experiment description, is at `step-0`, in grey when it sits under a title. Line heights: `tight` 0.9 (wordmark, h1), `title` 1.05, `lede` 1.45, `text` 1.5. Letter spacing: `wordmark` -0.03em, `title` -0.015em.

Loading: the files are instanced and subset by `scripts/fonts.sh` (66 KB in all). Every face uses `font-display: swap`. Body text is preloaded on every page, the wordmark and the email on the home page, Headline on inner pages; the mono swaps in when it arrives.

## Space and layout

| Token                       | Value                                                                           |
| --------------------------- | ------------------------------------------------------------------------------- |
| `--space-1` to `--space-24` | 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6 rem (the number is the multiple of 0.25rem) |
| `--layout-columns`          | 12 from 60rem; one column below                                                 |
| `--layout-gutter`           | 0.75 to 2 rem                                                                   |
| `--layout-measure`          | 36rem, the longest line of running text                                         |
| `--layout-measure-wide`     | 44rem, case study bodies beside their section titles                            |
| `--border-hairline`         | 1px solid line                                                                  |
| `--hero-shader-height`      | 15 to 22 rem                                                                    |
| `--trail-clearance`         | The gutter plus 4rem: where anchors land below the pinned breadcrumb trail      |

The one breakpoint is 60rem. Sheets are separated by `--space-12`.

On inner pages the breadcrumb trail is pinned one gutter below the top of the viewport, on one line (the current page gives way with an ellipsis). A band of ground above it hides the page scrolling under it, so the gutter stays empty and the trail never moves.

## Motion

| Token              | Value                          | Use                                       |
| ------------------ | ------------------------------ | ----------------------------------------- |
| `--duration-quick` | 140ms (0 under reduced motion) | Colour feedback                           |
| `--duration-draw`  | 360ms (0 under reduced motion) | A link's line being drawn                 |
| `--duration-fade`  | 400ms (0 under reduced motion) | The shader fading in over its still frame |
| `--duration-page`  | 650ms (0 under reduced motion) | Page transitions                          |
| `--ease-snap`      | cubic-bezier(0.2, 0, 0, 1)     | Feedback                                  |
| `--ease-out`       | cubic-bezier(0.16, 1, 0.3, 1)  | Movement: fast start, long settle         |

Links are ruled by a 1px teal line at rest. On hover or focus a 2px line is drawn over it from the left, and runs out to the right when the pointer leaves (the email: 2px, then 4px). Project and note titles have no line at rest. A card that leads somewhere (a project row, an experiment with a link, a note, the next case study) is clickable all over: its title stays the link's name, hovering any part of it draws the title's line, and the focus ring frames the whole card, inside its hairlines. A project row or an experiment also turns its image frame teal at the same pace and plays its preview loop. Running text in case studies and notes keeps a plain underline, which skips descenders and does not move under a reader.

Data in mono that a visitor points at resolves like a reading: the social handles and the hero coordinates scramble for 420ms, each character through others of its own kind (digits through digits), then settle from left to right. Punctuation and symbols hold still. Only there, only with a mouse, never under reduced motion: it is a signature, and repeated everywhere it would become a tic.

Page transitions are View Transitions run by Astro's `ClientRouter`, in the sheet style: the next page slides up over the current one, which lifts and darkens slightly, and going back runs it in reverse; rows and notes rise in on scroll with CSS scroll-driven animations. Both are off under reduced motion and absent where unsupported. A breadcrumb that leads back to the page the visitor came from acts as the browser's back button, so that page returns scrolled to where it was left.

## Components

| Component      | Role                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `Sheet`        | A block of cells: draws the top and left hairlines                                                |
| `Cell`         | One cell: right and bottom hairlines, white surface, `span` out of 12, `flush` for media          |
| `SectionTitle` | The title cell of a section, with an optional aside link                                          |
| `FactList`     | Term and value pairs; `data` values set in mono, lists shown as a `TagList`                       |
| `TagList`      | Technologies as small tags framed by a hairline, in the text face                                 |
| `Media`        | Images as AVIF with a hairline frame and an optional ratio                                        |
| `LoopMedia`    | A `Media` with an optional preview loop over it, played by an ancestor's hover or focus           |
| `ZoomMedia`    | A `Media` that opens larger in the viewer: a sheet of ground over the page, Close or Escape       |
| `ScrambleText` | Mono data that scrambles when an ancestor is pointed at; the real text stays readable             |
| `EmailLink`    | The email in Notch, fitted to its cell, on one line at every width                                |
| `Breadcrumbs`  | The way back home from inner pages: the sheet's first cell, pinned one gutter below the top       |
| `CodeText`     | A line of frontmatter where backticks mark identifiers, set as inline code                        |
| `ProjectBrief` | A case study's opening: its decisions and its measured figures, in two cells                      |
| `ArticleBody`  | The body of a case study or a note, ruled like a specification, with its `SectionIndex` beside it |
| `SectionIndex` | The body's sections, numbered like their titles, kept in view beside it; marks the one being read |
| `LensDemo`     | The 3D carousel's shader, live on an ink cell, with its two uniforms on sliders under it          |

Code is the one exception to the site's palette: blocks use VS Code's default dark theme (Dark+) in the system's monospace, so any developer reads them as in their editor. Inline code is a small cell of the sheet: the sage ground, a hairline, square corners. Running text in case studies and notes is set at 300, so that its few bold phrases (600) carry.

A case study page opens on its title block and cover, then its decisions and figures (`ProjectBrief`). The measured figures are framed as small cells of the sheet, in mono. Images, videos and code blocks in the body take the width of the text. The body is ruled like a specification: each section numbered 01 to 05, its title in a narrow column beside the text, a hairline between sections, and the sections listed again on the right (`SectionIndex`) on wide screens.

A note uses the same body (`ArticleBody`): the text in the same columns, its `##` headings numbered and set beside it, the index shown once it has two sections. Its title block holds the title at `step-4`, a sentence rather than a name, then the dates as facts and the link to the original post. On wide screens it takes the body's columns: the title runs across the section titles and the text, and the dates sit at its foot over the list of sections.

The development page `/styleguide/` shows every token and base component.

## Images

Project visuals at 16:10, experiments at 4:3, the portrait square and in black and white, artworks at their own ratio. Every image sits in its cell with a hairline frame; the frame turns teal on hover in project rows, linked experiments and on images that open larger. A case study's cover and gallery and the figures of a body open in a viewer: a sheet of ground that slides up over the page like a new page, the image at the largest width built for it, its caption under it, with the count in mono, Previous, Next and Close. The images of the page form one series: the buttons, the arrow keys or a swipe go from one to the next, around the end. A click anywhere else or Escape closes it. The home page has none: the viewer's markup, styles and script would push its HTML past the first round trip on 4G and cost about 150 ms of LCP.

Every project media sits in the site's frame, but not every one wears its art direction. The cover is how a project is recognised on the home page, so it shows the project as it is; the preview loop and the body media explain how it works, so they are drawn in the site's own language. A cover that is only a title card in the site's style makes every project look like a product of the same range.

- **The cover and the gallery**: the real thing, captured and set in the sheet: a white cell with a hairline on the sage ground. The cover carries a row in mono with real data (the address, the viewport), never decoration; the gallery's images, shown at a quarter of the page, carry none. A game shows its title screen, a site its first viewport, a product its main screen. A library with no face of its own other than its API keeps a title card (the project's mark redrawn like the site's favicon, a dark square and a light sign; the name in Headline; what it is; a row of facts): Steerkit is the reference.
- **The preview loop and the body media**, for Thibaut's own code: a few use cases, one page each, a heading cell (number, title, the call in mono) over an ink cell where the project's real code runs, in the shader's palette (teal for the many, ivory for the one in focus, coral for what acts on it). Pages change by sliding up, as the site's do. The loop opens and closes on the cover, its poster, so it starts on hover without a jump. Ocarina and Steerkit are the references.
- **Client work**: the same captures for the cover, the gallery and the loop, within what the client allows.

Both are composed on `/media-kit/` (see [`architecture.md`](../architecture.md#project-media)). The checklist below applies to them as to any surface.

## The shader

The domain warp from the V1 hero: five colours folding, pulled toward a slow wandering point that the cursor replaces. WebGL2, one fullscreen triangle, 2.6 KB gzipped. It starts after the largest paint and a short idle wait, half a second at most (two seconds after load at most, for pages opened in a background tab, which report no largest paint), pauses off-screen and in hidden tabs, has a pause button, and gives way to its still frame under reduced motion, Save-Data, without WebGL2 or without a GPU (a software renderer would block the main thread on every frame).

## Anti AI-look checklist

Before shipping any new surface, check that it has none of: gradient blobs, mesh or aurora backgrounds; glassmorphism; a generic bento grid; "Hi, I'm X" or decorative emoji; decorative icons; a grotesk title with an italic serif accent word; a kicker above a heading; stat counters, logo marquees or fake terminals; mono used as a costume; shadows. In copy: no em dash, no "it's not X, it's Y", no forced triads, no "passionate", "seamless", "elevate".

## Outside the web

- **Colours**: the hex values above. Print: start from them and proof; sage-2 and white are close enough to need a visible hairline (#cbcfcd) between them.
- **Type**: the same five faces, all SIL Open Font License, so they can be installed for documents, slides and print. Full families: Archivo, Stack Sans (Text, Headline, Notch), Fragment Mono on Google Fonts or Fontsource. Set the name in Archivo 800 at width 125%, and only the name.
- **Monogram**: TL in the wordmark face, light on ink (`public/favicon.svg`), for avatars and small marks.
- **Layout**: the sheet translates directly to slides and documents: white cells, 1px sage hairlines, titles in Headline, data in mono. The Open Graph template in `src/lib/og.ts` is a ready example at 1200 × 630.
