# Architecture

How the V2 site is organised and the conventions every change follows. Read this before adding code; read [`content.md`](content.md) before adding content, and [`design/system.md`](design/system.md) before touching the visuals.

## Stack

Astro 7, static output, deployed to GitHub Pages from `main`. TypeScript strict. Native CSS on Radix Colors, no CSS framework, no UI framework. Page transitions run through Astro's `ClientRouter`, so navigation between pages stays in one document. Every dependency is listed with its reason in the [dependencies table](#dependencies).

## Source tree

```
src/
├── content.config.ts         # Collection schemas: the single source of truth for content shape
├── content/                  # One folder per entry, its assets beside it
│   ├── projects/<slug>/      # index.mdx, cover, preview video
│   │   └── _template/        # Copy this folder to add a project (ignored by the loader)
│   ├── playground/<slug>/    # index.md, thumbnail, preview video
│   ├── artworks/<slug>/      # index.md, image
│   └── notes/<slug>/         # index.mdx and any assets
├── data/
│   ├── profile.ts            # Identity, contact, location, socials, stack, legal: typed, read by pages and JSON-LD
│   └── legacy-redirects.ts   # V1 URLs sent to the home page (read by astro.config.ts)
├── assets/
│   ├── fonts/                # Instanced and subset woff2 files (see Fonts)
│   └── images/               # Site-level images: portrait, avatar, static shader frame
├── layouts/
│   └── BaseLayout.astro      # Document shell: head, skip link, main, footer (no header by design; inner pages pin their breadcrumbs)
├── components/
│   ├── seo/                  # SeoHead, JsonLd
│   ├── site/                 # SiteFooter, SkipLink
│   ├── ui/                   # Small shared pieces: Sheet, Cell, Media, LoopMedia, ZoomMedia, ScrambleText, FactList, TagList, CodeText, ArticleBody, SectionIndex
│   ├── home/                 # One component per home section: Hero, WorkSection, ProjectRow, AboutSection, PlaygroundSection, ArtworkSection, NotesSection, ContactSection
│   ├── project/              # Case study parts: ProjectBrief (decisions and figures)
│   ├── note/                 # NoteListItem
│   ├── mdx/                  # Components available inside MDX bodies: Figure, Video
│   └── demos/                # Live demos, each imported by the one entry it belongs to: LensDemo
├── lib/                      # Plain TypeScript, no Astro imports where avoidable, unit tested
│   ├── content.ts            # Queries: draft filtering, featured and order sorting, in one place
│   ├── media.ts              # Resolves colocated videos to built URLs
│   ├── seo/json-ld.ts        # Builders for ProfilePage, Person, projects, notes, BreadcrumbList
│   └── format.ts             # Dates
├── scripts/                  # Client-side behaviour, one folder or module per feature
│   ├── hero-shader/          # boot-inline.js (inlined, decides when), index.ts, renderer.ts, warp.frag
│   ├── loop-video.ts         # Project and playground previews: play on hover or focus
│   ├── scramble.ts           # Mono data resolves when pointed at (handles, coordinates)
│   ├── lens-demo/            # The 3D carousel's fragment shader, live, its uniforms on sliders
│   ├── back-link.ts          # A breadcrumb back to the previous page acts as history.back()
│   ├── image-viewer.ts       # Case study covers, gallery and body figures open larger in a dialog
│   ├── analytics-opt-out.ts  # The legal notice's switch that stops Umami for this browser
│   └── section-index.ts      # The list of sections beside a long read marks the one being read
├── styles/
│   ├── global.css            # Layer order and imports, nothing else
│   ├── tokens/               # color, typography, space, layout, motion
│   ├── base/                 # reset, elements, prose, transitions
│   └── utilities.css         # visually-hidden and the card link, nothing else unless it earns its place
└── pages/
    ├── index.astro
    ├── 404.astro
    ├── legal-notice.astro
    ├── [styleguide].astro    # Tokens and components, dev only
    ├── [mediakit].astro      # Composition page for project media, dev only (see Project media)
    ├── work/[slug].astro
    ├── notes/index.astro
    ├── notes/[slug].astro
    ├── rss.xml.ts, robots.txt.ts, llms.txt.ts
    └── og/[...path].png.ts   # Open Graph images, rendered at build time
```

`src/proposals/` holds design proposals under review: the dynamic ASCII hero (`/proposals/ascii/`). It exists under `astro dev`, and in a production build made with `pnpm proposals` (`PUBLIC_PROPOSALS=true`, served on port 4322). The pages are registered by an integration in `astro.config.ts`. A normal build contains none of it. The folder is emptied once a proposal is chosen and built properly. **Before launch (the merge of `v2` into `main`), the ASCII proposal and all of its plumbing must be removed**: the folder, the integration in `astro.config.ts`, the `proposals` script in `package.json`, the entry in `knip.config.ts` and this paragraph.

Outside `src/`: `astro.config.ts`, `public/` (CNAME, `.nojekyll`, the CV under `public/cv/`), `media/` (see [Project media](#project-media)), `docs/`, `.github/workflows/`.

## Conventions

**Naming.** English everywhere. Components in PascalCase, one per file. TypeScript modules, folders, routes and slugs in kebab-case. The `@/*` alias points to `src/*`.

**Components.** Small and single-purpose, with an exported `interface Props`. A component never holds copy or data: pages compose components and pass UI copy, content comes from collections, identity from `profile.ts`. Any logic beyond a `map` or a simple condition moves to `src/lib`, where it is tested.

**Content, presentation, behaviour.** Content in `src/content` and `src/data`; presentation in `.astro` components and CSS; behaviour in `src/scripts`. Scripts find their elements through `data-*` attributes, never through class names. Component variants go through custom properties (for example `--cell-span`), not modifier soup.

**Comments** explain why, never what. No dead code: knip runs in CI.

## CSS

- Global styles live in cascade layers: `@layer reset, tokens, base, layout, utilities;`.
- Component styles are Astro scoped styles, unlayered, so they win over the base on purpose.
- Two token levels. Radix primitives (`--teal-9`) are only read by the token files. Everything else uses semantic tokens: `--color-text`, `--color-surface`, `--color-line`, `--font-title`, `--step-3`, `--space-4`, `--duration-quick`, `--ease-snap`. Names are chosen to be extracted as they are into a design system.
- No raw values: Stylelint with `declaration-strict-value` rejects literal colours, font sizes, spacing, durations and z-indexes outside `src/styles/tokens/`.
- Light theme only; `color-scheme: light`. A dark theme is one more token file.
- Code blocks use Shiki's `dark-plus` theme (`astro.config.ts`), VS Code's default dark theme, in the system's monospace (`--font-code`): the one place the site does not set its own colours, so a developer reads the code at a glance.

## Fonts

Five OFL faces (see [`design/direction.md`](design/direction.md)). The upstream files are variable and much heavier than what the site uses, so they are instanced and subset once with fonttools and committed to `src/assets/fonts/`:

- Archivo, weight 800 and width 125%, subset to the glyphs of the name.
- Stack Sans Notch, weight 700, subset to the glyphs of the email address.
- Stack Sans Headline (700) and Text (300 to 600: light for running text, 600 for its bold), Latin subset.
- Fragment Mono, Latin subset.

`scripts/fonts.sh` documents and reruns the process (`uvx --from fonttools`, no project dependency). Astro's Fonts API serves them through the local provider, generates metric-adjusted fallbacks, and preloads the faces of the first viewport: body text everywhere, the wordmark and the email on the home page, Headline on inner pages. Every face swaps in: `font-display: optional` was tried for body text and mono and kept Arial and Courier New on screen on most visits.

## Client JavaScript

As little as possible. Each script is isolated, justified here, and loaded as late as possible.

| Script              | Why                                          | Loaded                                                                                                   | Budget      |
| ------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| `ClientRouter`      | Page transitions that do not flash           | Module on every page (5.7 KB)                                                                            | 6 KB gzip   |
| `hero-shader`       | The signature domain warp                    | Boot step inlined in the page (no request); the module (2.6 KB) after `load`, the largest paint and idle | 6 KB gzip   |
| `loop-video`        | Project and playground previews on hover     | Module, on pages with a preview                                                                          | 1 KB gzip   |
| `scramble`          | Handles and coordinates resolve on hover     | Module, home page                                                                                        | 1 KB gzip   |
| `back-link`         | A breadcrumb back restores the previous page | Module                                                                                                   | 1 KB gzip   |
| `image-viewer`      | Project images seen larger                   | Inlined, case studies and notes with figures (1 KB); the large image on opening                          | 1.5 KB gzip |
| `section-index`     | The section being read, beside a long read   | Module, case studies and notes with sections                                                             | 1 KB gzip   |
| `lens-demo`         | The shader a note explains, to play with     | Module, on that note only; WebGL starts when the demo nears the viewport (2.4 KB, shader included)       | 3 KB gzip   |
| `analytics-opt-out` | Stop Umami for this browser                  | Inlined by the build, legal notice only (0.4 KB)                                                         | 1 KB gzip   |
| Umami               | Cookieless analytics                         | `defer`, third party; counts visits on the production domain only (`data-domains`)                       | 2.3 KB      |

**Page transitions.** Astro's `ClientRouter` fetches the next page and swaps it into the current document inside a View Transition. Native cross-document View Transitions were tried first and dropped: Vivaldi showed a flash on every click, which same-document transitions do not have. The cost is the router's script and the loss of the Content Security Policy, which Astro does not support with the `ClientRouter`; for a static site with no form, account or user content, the policy protected little. The animation itself, the sheet, is in `src/styles/base/transitions.css`: the next page slides up over the current one, and going back lifts it off. View transitions are judged on a production build (`pnpm build && pnpm preview`): in dev, Vite re-injects every page's styles with JavaScript after the first render, which makes them flash.

**Scripts under the router.** A bundled module runs once per visit, not once per page. A script that binds to elements of the page binds again after `astro:after-swap` (or `astro:page-load`), and a script that keeps running stops on `astro:before-swap`: the hero shader disposes of its WebGL context there. Inline scripts run again on every page that contains them.

Scroll reveals use CSS scroll-driven animations behind `@supports`.

## Project media

Covers, preview loops, body figures and playground thumbnails are drawn in the site's art direction (see [`design/system.md`](design/system.md#images)), on one development page, `/media-kit/` (`src/pages/[mediakit].astro` and `src/scripts/media-kit.ts`). It reads the real tokens, fonts and components, so a piece of media cannot drift from the site. Like `/styleguide/`, it exists only under `astro dev`; its script is loaded as it is from the dev server, so a build carries nothing of it.

The page composes one piece at the ratio of its `ratio` parameter, filling the window, in one of two ways:

- `src`: a capture (image or video) set in the sheet, a white cell with a hairline on the ground, with optional `data` items in mono under it.
- `scene`: a scene module, a plain ES module that receives the canvas, the colour roles, the shader's palette (`src/scripts/hero-shader/palette.ts`), the font stacks and the type scale, and draws the piece at any time `t`. Opened without `render`, it plays live.

Each entry's sources live in `media/<slug>/`: `media.mjs`, the recipe (captures to take, outputs to write next to the entry), and its scenes. A scene imports the project's own published package from a CDN at a pinned version, never from `package.json`. The rendering itself (headless Chrome through `playwright-core`, then ffmpeg) runs from a personal Claude Code skill outside the repository, so it adds no dependency here; it reads the specs of [`content.md`](content.md#images-and-video) at every run. `media/` is formatted and linted with the rest, and ignored by knip.

## Tooling

| Script                         | Runs                                              |
| ------------------------------ | ------------------------------------------------- |
| `pnpm format` / `format:check` | Prettier with the Astro plugin                    |
| `pnpm lint`                    | ESLint: typescript-eslint and eslint-plugin-astro |
| `pnpm lint:css`                | Stylelint, including the no-raw-value rule        |
| `pnpm lint:unused`             | knip: unused files, exports and dependencies      |
| `pnpm check`                   | `astro check`, zero errors and zero warnings      |
| `pnpm test`                    | Vitest on `src/lib`                               |
| `pnpm verify`                  | All of the above, in CI order                     |

eslint-plugin-jsx-a11y is left out: it does not support ESLint 10, which eslint-plugin-astro requires. Accessibility is enforced by Lighthouse CI on every pull request and by the axe audit of Phase 5.

CI (`.github/workflows/ci.yml`) runs `verify`, then `build`, then Lighthouse CI with budgets on every pull request and on every push to `main`. The deploy job runs on a push to `main` only, after the same checks, and refuses to ship if `src/content` still contains lorem ipsum. A ruleset protects `main` and `v2`: changes land through a pull request whose `verify` check passed, with no force push and no deletion.

## Dependencies

| Package                                                                                                                                                                                                                                                       | Why                                                       | Ships to the client |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------- |
| `astro`                                                                                                                                                                                                                                                       | Framework                                                 | no                  |
| `@radix-ui/colors`                                                                                                                                                                                                                                            | Colour scales behind the tokens                           | CSS only            |
| `@astrojs/mdx`                                                                                                                                                                                                                                                | `Figure` and `Video` inside case studies                  | no                  |
| `@astrojs/sitemap`, `@astrojs/rss`                                                                                                                                                                                                                            | Official, small                                           | no                  |
| `satori`, `@resvg/resvg-js`                                                                                                                                                                                                                                   | Open Graph images at build time                           | no                  |
| Dev: `typescript`, `@astrojs/check`, `prettier`, `prettier-plugin-astro`, `eslint`, `typescript-eslint`, `eslint-plugin-astro`, `stylelint`, `stylelint-config-standard`, `postcss-html`, `stylelint-declaration-strict-value`, `knip`, `vitest`, `@lhci/cli` | Each one makes a rule of this file checkable by a machine | no                  |

Not used on purpose: Tailwind (the tokens are the system), GSAP (CSS covers the motion), Three.js or OGL (one fullscreen triangle in raw WebGL2), any UI framework.

## Git

Work happens on `v2`, one branch per phase (`v2-foundations`, `v2-content`, ...) merged through a pull request; the pull request is the validation point. Small commits in English, conventional prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
