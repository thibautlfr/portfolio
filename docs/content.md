# Content

How to add and edit content. This file is the reference for people and for writing agents; the schemas themselves live in [`src/content.config.ts`](../src/content.config.ts), and the two must stay in sync.

## Add something in one minute

1. Copy the `_template` folder of the collection, for example `src/content/projects/_template/`.
2. Rename the copy to the entry's slug: English, kebab-case (`steerkit`, `ocean-heartbeat`). The folder name becomes the URL.
3. Fill the frontmatter (the template lists every field, optional ones commented out), drop the images and videos next to `index.mdx`, and set `draft: false`.
4. Run `pnpm dev`. A missing or invalid field stops the build with the entry and the field named, for example `projects → my-project … summary: Required`.

Templates are never published: folders starting with `_` are ignored by the loader.

## Shared fields

Every collection has these three, which drive the home page without touching code.

| Field      | Type    | Default | Purpose                                                                                             |
| ---------- | ------- | ------- | --------------------------------------------------------------------------------------------------- |
| `featured` | boolean | `false` | Shown on the home page.                                                                             |
| `order`    | integer | `100`   | Position on the home page, lowest first. Ties fall back to the slug. Use steps of 10 to leave room. |
| `draft`    | boolean | `false` | Never published, never listed. Templates start as drafts.                                           |

## Images and video

- Images sit next to the entry and are referenced with a relative path: `src: ./cover.png`. Every image is an object with `src` and `alt`, so none can ship without alternative text. Write `alt` for someone who cannot see it: what it shows, not "image of".
- Sources: PNG for flat artwork and screenshots, JPEG for photographs, SVG for vector placeholders. Up to 2400 px on the long side, sRGB. The build produces AVIF, WebP and every responsive size.
- Videos are short loops next to the entry (`preview: ./preview.mp4`): H.264, 720p, about 6 seconds, no audio, 1.5 MB at most. They play on hover or focus and never under reduced motion; the image is their poster.

## Projects

`src/content/projects/<slug>/index.mdx`, one case study page at `/work/<slug>/`.

| Field        | Type     | Required | Constraint and purpose                                                                                                                        |
| ------------ | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`      | string   | yes      | 60 characters at most.                                                                                                                        |
| `summary`    | string   | yes      | One sentence, 160 characters at most. Shown on the home row and used as the meta description.                                                 |
| `role`       | string   | yes      | Thibaut's role, for example `Full-stack developer`, `Author`.                                                                                 |
| `context`    | enum     | yes      | `client`, `open-source`, `personal` or `hackathon`.                                                                                           |
| `year`       | integer  | no       | Year of delivery. Leave it out rather than guess.                                                                                             |
| `stack`      | string[] | yes      | At least one item, most important first. Set in mono on the site.                                                                             |
| `cover`      | image    | no       | 16:10 works best; the page holds without it.                                                                                                  |
| `preview`    | video    | no       | A short loop, see above.                                                                                                                      |
| `links`      | list     | no       | `{ label, url, kind }` with `kind` one of `live`, `source`, `demo`, `article`. Client work may have none.                                     |
| `award`      | string   | no       | One line, for example `Winner, “On veut du gros pixel” challenge, Nuit de l'Info 2024`.                                                       |
| `schemaType` | enum     | no       | Structured data type: `CreativeWork` (default), `SoftwareSourceCode` (libraries), `WebApplication` (products), `VideoGame` (playable pieces). |
| `seo`        | object   | no       | `title` (60) and `description` (160) when the defaults from `title` and `summary` are not right for search.                                   |

**Body.** The case study is written for a technical reader (a CTO, a lead developer), in five sections with exactly these headings, in this order:

1. `## Context`: who it was for and the problem, in two or three sentences.
2. `## Constraints`: what made it hard (scale, deadlines, legacy, performance, confidentiality).
3. `## Approach`: the decisions and why they were taken.
4. `## Engineering notes`: the interesting technical detail (types, architecture, performance numbers that can be shared).
5. `## Outcome`: what shipped and what it changed. No invented metrics.

The body may use `<Figure>` and `<Video>` (Phase 3) for captioned media. Client work under NDA shows no code, no source links, no figures and no competitor names.

## Playground

`src/content/playground/<slug>/index.md`, frontmatter only; shown as a strip on the home page, no page of its own.

| Field         | Type   | Required | Constraint and purpose                                  |
| ------------- | ------ | -------- | ------------------------------------------------------- |
| `title`       | string | yes      | 60 characters at most.                                  |
| `description` | string | yes      | One line, 100 characters at most.                       |
| `url`         | URL    | no       | The live experiment. Without it the card is not a link. |
| `thumbnail`   | image  | yes      | 4:3.                                                    |
| `preview`     | video  | no       | A short loop, see above.                                |
| `date`        | date   | no       | `2026-10-17`. Used after `order` to sort.               |

## Artworks

`src/content/artworks/<slug>/index.md`, frontmatter only; the "Off the clock" section.

| Field         | Type    | Required | Constraint and purpose                             |
| ------------- | ------- | -------- | -------------------------------------------------- |
| `title`       | string  | yes      | 60 characters at most.                             |
| `kind`        | enum    | yes      | `poster`, `painting`, `drawing` or `illustration`. |
| `year`        | integer | no       |                                                    |
| `image`       | image   | yes      | Any ratio: artworks are shown at their own.        |
| `description` | string  | no       | One sentence, 160 characters at most.              |
| `url`         | URL     | no       | The Instagram post or the artwork elsewhere.       |

## Notes

`src/content/notes/<slug>/index.md` or `index.mdx`, one page at `/notes/<slug>/`, listed newest first and in the RSS feed.

| Field         | Type     | Required | Constraint and purpose                                                                        |
| ------------- | -------- | -------- | --------------------------------------------------------------------------------------------- |
| `title`       | string   | yes      | 90 characters at most.                                                                        |
| `description` | string   | yes      | 160 characters at most. Meta description and RSS summary.                                     |
| `pubDate`     | date     | yes      | `2026-10-17`.                                                                                 |
| `updatedDate` | date     | no       | Set when a note changes meaningfully.                                                         |
| `tags`        | string[] | no       | Lowercase. Used in structured data; there are no tag pages.                                   |
| `source`      | object   | no       | `{ platform, url }` with `platform` `x` or `linkedin`, when the note started as a post there. |
| `cover`       | image    | no       | Also used for the note's Open Graph image.                                                    |

## Identity

Name, role, positioning, email, location, stack, socials and legal facts live in [`src/data/profile.ts`](../src/data/profile.ts), typed and read everywhere else. The CV link appears once `cvPath` is set and the PDF is in `public/cv/`.

## Before launch

Placeholder copy uses lorem ipsum on purpose: the deploy job refuses to publish while `src/content` contains it.
