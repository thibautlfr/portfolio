# Architecture

How the V2 site is organised and the conventions every change follows. Read this before adding code; read [`content.md`](content.md) before adding content.

## Stack

Astro 7, static output, deployed to GitHub Pages from `main`. TypeScript strict. Native CSS on Radix Colors, no CSS framework, no UI framework. Every dependency is listed with its reason in the [dependencies table](#dependencies).

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
│   └── BaseLayout.astro      # Document shell: head, skip link, main, footer (no header by design)
├── components/
│   ├── seo/                  # SeoHead, JsonLd
│   ├── site/                 # SiteFooter, SkipLink
│   ├── ui/                   # Small shared pieces: Sheet, Cell, TextLink, Media, FactList
│   ├── home/                 # One component per home section: Hero, WorkSection, ProjectRow, AboutSection, PlaygroundSection, ArtworkSection, NotesSection, ContactSection
│   ├── project/              # Case study parts: ProjectHeader, ProjectFacts, ProjectPager
│   ├── note/                 # NoteHeader, NoteListItem
│   └── mdx/                  # Components available inside MDX bodies: Figure, Video
├── lib/                      # Plain TypeScript, no Astro imports where avoidable, unit tested
│   ├── content.ts            # Queries: draft filtering, featured and order sorting, in one place
│   ├── media.ts              # Resolves colocated videos to built URLs
│   ├── seo/json-ld.ts        # Builders for ProfilePage, Person, projects, notes, BreadcrumbList
│   └── format.ts             # Dates
├── scripts/                  # Client-side behaviour, one folder or module per feature
│   ├── hero-shader/          # boot-inline.js (inlined, decides when), boot.ts (its CSP hash), index.ts, renderer.ts, warp.frag
│   └── loop-video.ts         # Playground previews: play on hover or focus
├── styles/
│   ├── global.css            # Layer order and imports, nothing else
│   ├── tokens/               # color, typography, space, layout, motion
│   ├── base/                 # reset, elements, prose
│   └── utilities.css         # visually-hidden, and nothing else unless it earns its place
└── pages/
    ├── index.astro
    ├── 404.astro
    ├── legal-notice.astro
    ├── work/[slug].astro
    ├── notes/index.astro
    ├── notes/[slug].astro
    ├── rss.xml.ts, robots.txt.ts, llms.txt.ts
    └── og/[...path].png.ts   # Open Graph images, rendered at build time
```

Outside `src/`: `astro.config.ts`, `public/` (CNAME, `.nojekyll`, the CV under `public/cv/`), `docs/`, `.github/workflows/`.

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

## Fonts

Five OFL faces (see [`design/direction.md`](design/direction.md)). The upstream files are variable and much heavier than what the site uses, so they are instanced and subset once with fonttools and committed to `src/assets/fonts/`:

- Archivo, weight 800 and width 125%, subset to the glyphs of the name.
- Stack Sans Notch, weight 700, subset to the glyphs of the email address.
- Stack Sans Headline (700) and Text (400 to 500), Latin subset.
- Fragment Mono, Latin subset.

`scripts/fonts.sh` documents and reruns the process (`uvx --from fonttools`, no project dependency). Astro's Fonts API serves them through the local provider, generates metric-adjusted fallbacks, and preloads only the wordmark.

## Client JavaScript

Zero by default. Each script is isolated, justified here, and loaded as late as possible.

| Script        | Why                                   | Loaded                                                                                                                      | Budget     |
| ------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `hero-shader` | The signature domain warp             | Boot step inlined in the page (no request, hashed in the CSP); the module (2.3 KB) after `load`, the largest paint and idle | 6 KB gzip  |
| `loop-video`  | Playground previews on hover or focus | Deferred module                                                                                                             | 1 KB gzip  |
| Umami         | Cookieless analytics                  | `defer`, third party                                                                                                        | about 2 KB |

Page transitions use native cross-document View Transitions (CSS only). Scroll reveals use CSS scroll-driven animations behind `@supports`.

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

CI (`.github/workflows/ci.yml`) runs `verify`, then `build`, then Lighthouse CI with budgets on every pull request and push. The deploy job runs on `main` only, after the same checks, and refuses to ship if `src/content` still contains lorem ipsum.

## Dependencies

| Package                                                                                                                                                                                                                                                       | Why                                                       | Ships to the client |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------- |
| `astro`                                                                                                                                                                                                                                                       | Framework                                                 | no                  |
| `@radix-ui/colors`                                                                                                                                                                                                                                            | Colour scales behind the tokens                           | CSS only            |
| `@astrojs/mdx`                                                                                                                                                                                                                                                | `Figure` and `Video` inside case studies                  | no                  |
| `@astrojs/sitemap`, `@astrojs/rss`                                                                                                                                                                                                                            | Official, small                                           | no                  |
| `satori`, `@resvg/resvg-js`                                                                                                                                                                                                                                   | Open Graph images at build time                           | no                  |
| Dev: `typescript`, `@astrojs/check`, `prettier`, `prettier-plugin-astro`, `eslint`, `typescript-eslint`, `eslint-plugin-astro`, `stylelint`, `stylelint-config-standard`, `postcss-html`, `stylelint-declaration-strict-value`, `knip`, `vitest`, `@lhci/cli` | Each one makes a rule of this file checkable by a machine | no                  |

Not used on purpose: Tailwind (the tokens are the system), GSAP (CSS covers the motion), Three.js or OGL (one fullscreen triangle in raw WebGL2), Astro's `ClientRouter` (native View Transitions cost no JavaScript and keep the CSP strict), any UI framework.

## Git

Work happens on `v2`, one branch per phase (`v2-foundations`, `v2-content`, ...) merged through a pull request; the pull request is the validation point. Small commits in English, conventional prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
