# Content

How to add and edit content. This file is the reference for people and for writing agents; the schemas themselves live in [`src/content.config.ts`](../src/content.config.ts), and the two must stay in sync.

## Add something in one minute

1. Copy the `_template` folder of the collection, for example `src/content/projects/_template/`.
2. Rename the copy to the entry's slug: English, kebab-case (`steerkit`, `ocean-heartbeat`). The folder name becomes the URL.
3. Fill the frontmatter (the template lists every field, optional ones commented out), drop the images and videos next to `index.mdx`, set `draft: false`, and `featured: true` if it belongs on the home page.
4. Run `pnpm dev`. A missing or invalid field stops the build with the entry and the field named:

   ```
   [InvalidContentEntryDataError] projects → my-project data does not match collection schema.
     role: Required
   ```

Templates are never published: folders starting with `_` are ignored by the loader.

## Shared fields

Every collection has these three, which drive the home page without touching code.

| Field      | Type    | Default | Purpose                                                                                             |
| ---------- | ------- | ------- | --------------------------------------------------------------------------------------------------- |
| `featured` | boolean | `false` | Shown on the home page. Every published project and note has its own page either way.               |
| `order`    | integer | `100`   | Position on the home page, lowest first. Ties fall back to the slug. Use steps of 10 to leave room. |
| `draft`    | boolean | `false` | Never published, never listed. Templates start as drafts.                                           |

## Images and video

- Images sit next to the entry and are referenced with a relative path: `src: ./cover.png`. Every image is an object with `src` and `alt`, so none can ship without alternative text. Write `alt` for someone who cannot see it: what it shows, not "image of".
- Sources: PNG for flat artwork and screenshots, JPEG for photographs, SVG for vector placeholders. Up to 2400 px on the long side, sRGB. The build produces AVIF in every responsive size.
- Videos are short loops next to the entry (`preview: ./preview.mp4`): H.264, 720p, about 6 seconds, no audio, 1.5 MB at most. They play on hover or focus and never under reduced motion; the image is their poster.

## Projects

`src/content/projects/<slug>/index.mdx`, one case study page at `/work/<slug>/`.

| Field        | Type     | Required | Constraint and purpose                                                                                                                                            |
| ------------ | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`      | string   | yes      | 60 characters at most.                                                                                                                                            |
| `summary`    | string   | yes      | One sentence, 160 characters at most. Shown on the home row and used as the meta description.                                                                     |
| `role`       | string   | yes      | Thibaut's role, for example `Full-stack developer`, `Author`.                                                                                                     |
| `context`    | enum     | yes      | `client`, `open-source`, `personal` or `hackathon`.                                                                                                               |
| `client`     | object   | no       | `{ name, url, group }` for client work the client agreed to be named for: shown as a fact, and as the producer in structured data. `group` is the parent company. |
| `year`       | integer  | no       | Year of delivery. Leave it out rather than guess.                                                                                                                 |
| `stack`      | string[] | yes      | At least one item, most important first. Set in mono on the site.                                                                                                 |
| `cover`      | image    | no       | PNG or JPEG, 16:10 works best; the page holds without it. The SVG covers in the repository are placeholders.                                                      |
| `gallery`    | list     | no       | One or two more images, `{ src, alt }` each, shown under the cover on the case study page only (the home row keeps the cover). 16:10, like the cover.             |
| `preview`    | video    | no       | A short loop, see above.                                                                                                                                          |
| `links`      | list     | no       | `{ label, url, kind }`: `label` is the link text shown (free text), with `kind` one of `live`, `source`, `demo`, `article`. Client work may have none.            |
| `award`      | string   | no       | One line, for example `Prizewinner, “On veut du gros pixel” challenge, Nuit de l'Info 2024`.                                                                      |
| `decisions`  | string[] | no       | 2 to 4 lines of 140 characters at most: the opening of the page, see [The opening](#the-opening).                                                                 |
| `figures`    | object   | no       | `{ items, source }`: 2 to 4 `{ value, label }` (value 12 characters, label 110) and where they come from, see [The opening](#the-opening).                        |
| `schemaType` | enum     | no       | Structured data type: `CreativeWork` (default), `SoftwareSourceCode` (libraries), `WebApplication` (products), `VideoGame` (playable pieces).                     |
| `seo`        | object   | no       | `title` (60) and `description` (160) when the defaults from `title` and `summary` are not right for search.                                                       |

### Writing a case study

The body is read by a technical reader (a CTO, a lead developer) deciding whether to trust Thibaut with their own project. The header above it already gives the title, the summary, the facts and the cover, so the body never repeats them. It has five sections, with exactly these headings, in this order:

| Section                | Answers                                                                                                                                                                   | Length     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `## Context`           | Who it was for, the problem, where the project came from.                                                                                                                 | 60 to 120  |
| `## Constraints`       | What made it hard: scale, performance, deadlines, legacy, confidentiality, or a rule set on purpose. Each one with the reason it mattered. A short list is fine here.     | 60 to 150  |
| `## Approach`          | The decisions, each with the option it beat and why. The heart of the page.                                                                                               | 200 to 350 |
| `## Engineering notes` | One or two details worth a lead developer's time, told as a problem, what was found and the fix, with numbers when they can be shared.                                    | 150 to 350 |
| `## Outcome`           | What shipped, who uses it, what it changed. When there is no metric, say what exists: versions, a production use, a prize. Mention what comes next only if it is planned. | 50 to 120  |

Lengths are in words. A featured case study runs 600 to 1,100 words; a hackathon or a small project can stay near 400, with the five headings kept.

On the page, the sections are numbered 01 to 05, each title in a narrow column beside its text and listed again beside the body on wide screens and at its head on narrow ones, so a reader can go straight to Approach.

#### The opening

Between the header and the body, two blocks let a reader judge the project in thirty seconds. Both are optional; either one takes the full width alone, and without them the page goes straight to the body.

- `decisions`: two to four of the choices told in Approach, one line each, with the reason in the same line: "Every behavior writes into an `out` vector passed last, so nothing is allocated per call." Every project has some, client work included, as long as no internal name or figure slips in. Backticks set an identifier as code.
- `figures`: two to four measured values from Engineering notes or Outcome, each `value` short and set in mono (`0.7 ms`, `4.1 kB`, `18`), each `label` saying what was measured and against what. `source` gives where they come from and the conditions ("Node 26 on an M1 Pro, from the repository's benchmark"). The rules of **Numbers** below apply. Leave the block out rather than fill it: client work has it only with figures the client published or approved, a hackathon rarely does, and a personal project often needs its figures measured first.

**Voice.** First person singular, sober: "I extracted the module", not "the module was extracted", and "we" only for a team, saying who did what. Past tense for what was done, present tense for what the work does. Short paragraphs, facts before adjectives. The writing rules of [`CLAUDE.md`](../CLAUDE.md) and the anti AI-look checklist of [`design/system.md`](design/system.md) apply: no em dash, no "it's not X, it's Y", no forced triads, no rhetorical question, no one-line moral to close a section.

**Bold.** The body is set light, so bold carries: one or two phrases per section, the ones a reader skimming the page should catch (a decision, a constraint, a measured result). A phrase, never a whole paragraph, and never a label at the start of one.

**Decisions.** A decision is written as what was chosen, against what, and why: "Behaviors write into an `out` vector passed last instead of returning a new one, so a crowd of a thousand agents never wakes the garbage collector up." Without its reason, it is a feature list.

**Numbers.** Every figure comes from a source that can be pointed to (a benchmark, a test, analytics, the client) and carries its conditions: "1,000 boids on an M1 Pro: 12 ms per frame scanning the whole crowd, 0.7 ms with the grid." Leave out vanity numbers, such as stars or downloads in the first days of a release, and never round a figure to make it sound better.

**Code.** For open-source and personal work, or written for the page in client work (see **By context**), and only where it shows what prose cannot, such as the shape of an API. Two blocks at most, about 15 lines each, with a language tag. A case study is not documentation: link to the documentation instead.

**Media.** One to three `Figure` or `Video` in the body, in Approach or Engineering notes, next to the paragraph they illustrate. The caption adds a fact instead of naming the picture: "arrive(), with a 120 px slowing radius", not "Screenshot of the demo".

**Links.** In the body, link the first mention of a reference worth following: a paper, a standard, a library the work is compared with. The project's own links (live, source, demo) go in the frontmatter `links`, not in the text.

**How it was built.** Leave out the tools used to write the code, coding agents included: the page is about the decisions and the result.

**By context.**

- `client`: the client is named only with their agreement, in the `client` field. The page never shows the client's code, source links, internal names (services, people, the client's own customers) or competitor names. It can show code written for the page on a public standard, to explain a principle; figures the client or its customers published, with the link; and the architecture at the level of its components. A page that holds only that can be published before the client has read it; figures the client has not published, and anything else, wait for their approval.
- `open-source`: link the source and the demos; code is welcome within the limits above.
- `hackathon`: the time box is the first constraint. Say what Thibaut built and what the team did; the prize goes in `award`.
- `personal`: say what the project explores and why it exists.

### Media in the body

The body is MDX and can show captioned media next to the text. Import the files placed in the entry's folder, then use the two components, which are available without importing them:

```mdx
import pipeline from "./pipeline.png";
import demo from "./demo.mp4";

<Figure
  src={pipeline}
  alt="Diagram of the ingestion pipeline: each provider mapped to one OCTO schema."
  caption="Providers are normalised before anything else reads them."
/>

<Video
  src={demo}
  label="An agent arriving on the cursor and slowing down."
  caption="arrive(), with a 120 px slowing radius."
/>
```

A live demo, such as the 3D carousel's lens on its note, is a component of its own in `src/components/demos/`, imported in the MDX body of the one entry it belongs to (`import LensDemo from "@/components/demos/LensDemo.astro"`). It runs the project's own code, draws only when the reader acts on it, and says what it needs when it cannot run. It takes a `label` and a `caption`, as a `Video` does. Its script is listed in [`architecture.md`](architecture.md#client-javascript).

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

### Writing a note

A note tells one thing worth knowing: a technical finding (a bug and its cause, an API detail, a measured number), a decision and the option it beat, or what happened behind a project (a personal piece, a shader, a poster, a work in progress). It is written for a developer who arrived looking for that answer, and stays readable by someone deciding whether to work with Thibaut: the first one leaves with the answer, the second sees how Thibaut reasons.

The page shows the title, the date and the source link above the body. The `description` appears only in lists, search results and the feed, so the body can open on the point directly, without restating the title.

**Length.** 150 to 1,200 words, set by the subject: a finding can hold in 200 words, a decision or the story behind a project in 600 to 1,000. The note stops when the point is made, with no closing summary.

**Shape.** No fixed headings. The first paragraph says what the note is about and why it matters, before any background. Under about 500 words, no headings at all; above, `##` headings only where a reader would want to jump, each one saying what its part says rather than labelling it ("Background", "Conclusion").

**Voice.** First person singular, conversational: the way Thibaut would explain it to a colleague, with freer sentences than a case study and a dry joke when one comes on its own. An opinion is given as an opinion, and a wrong turn taken along the way can be told. Facts still come before adjectives. The writing rules of [`CLAUDE.md`](../CLAUDE.md) and the anti AI-look checklist of [`design/system.md`](design/system.md) apply as they do to a case study: no em dash, no "it's not X, it's Y", no forced triads, no rhetorical question, no one-line moral to close.

**Title and description.** The title says what the reader learns or what happened, plainly rather than cleverly: "Why the hero shader stays still on software renderers" rather than "The GPU that was not there". The `description` gives the answer in one or two sentences; it is the meta description and the RSS summary.

**Numbers, code and media.** As in a case study: every figure has a source and its conditions, and is never rounded to sound better. Code is welcome where it shows the problem or the fix, in short blocks with a language tag. A note drawn from client work shows no code and no figures, and names the client only with their agreement. An `index.mdx` note can use `Figure` and `Video` (see [Media in the body](#media-in-the-body)).

**Links.** Link the first mention of a reference worth following, and the case study (`/work/<slug>/`) when the note comes from a project that has one.

**Tags.** Two to four, lowercase, the words a reader would search for: `webgl`, `css`, `astro`.

**Source.** When a note grows out of an X or LinkedIn post, set `source` and develop the post: add the context, the example, the code or the figure that a post could not carry. The post is the starting point, not the text.

**Dates.** `pubDate` is the day the note is published, not the day of the work it tells about. `updatedDate` marks a change of substance, such as a corrected figure or a new part, never a typo.

**How it was built.** Leave out the tools used to write the code, coding agents included.

## Identity

Name, role, positioning, email, location, stack, socials, collaborations and legal facts live in [`src/data/profile.ts`](../src/data/profile.ts), typed and read everywhere else. The CV link appears once `cvPath` is set and the PDF is in `public/cv/`. `availability` is shown in the hero above the email; set it to `undefined` when not taking missions. `collaborations` are the clients and partners named in a row under the About offers (the name as a link, then `credit`; `detail` is used in `llms.txt`). Word them so they stay true once the work is over, and name a company only with its agreement.

## Before launch

Placeholder copy uses lorem ipsum on purpose: the deploy job refuses to publish while `src/content` contains it.
