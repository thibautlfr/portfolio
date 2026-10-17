# thibaut-lefrancois.com

Portfolio of Thibaut Lefrançois, freelance full-stack developer. A static [Astro](https://astro.build) site: the case studies, notes, playground and posters are content files; the site around them is a small, typed, tested codebase built to score 100 on Lighthouse and to read well.

## Getting started

Requires **Node >= 22.22.0** and **pnpm**.

```bash
pnpm install       # Install dependencies
pnpm dev           # Dev server at localhost:4321 (the styleguide is at /styleguide/)
pnpm build         # Production build to ./dist/
pnpm preview       # Serve the production build
pnpm verify        # Format, lint, CSS lint, dead code, type check, tests
pnpm lighthouse    # Mobile Lighthouse with the CI budgets (after pnpm build)
```

## Add a project in one minute

1. Copy `src/content/projects/_template/` to `src/content/projects/<slug>/` (English, kebab-case: the folder name is the URL).
2. Fill the frontmatter of `index.mdx`, drop the cover image next to it, and set `draft: false`.
3. Run `pnpm dev`: the project is on the home page and at `/work/<slug>/`. A missing or invalid field stops the build and names it.

Experiments, artworks and notes work the same way, each with its own `_template`. Every field is documented in [`docs/content.md`](docs/content.md). Name, email, location and socials live in [`src/data/profile.ts`](src/data/profile.ts).

## How it is built

```
src/
├── content.config.ts   # Content schemas (Zod)
├── content/            # One folder per entry, assets beside it
├── data/               # Profile and V1 redirects
├── components/         # Small single-purpose components: ui/, home/, project/, note/, seo/, site/, mdx/
├── layouts/            # BaseLayout: head, skip link, main, footer
├── lib/                # Plain TypeScript, unit tested: content queries, formatting, JSON-LD, OG images
├── scripts/            # Client code: the hero shader (WebGL2) and playground previews
├── styles/             # Tokens, reset, base and prose styles, in cascade layers
└── pages/              # Routes, RSS, robots.txt, llms.txt, Open Graph images
```

- **Zero JavaScript by default.** The only scripts are the hero shader (2.3 KB gzipped, loaded after the largest paint, never under reduced motion) and the playground previews (only on pages that have one).
- **CSS from tokens only.** Radix sage and teal behind semantic tokens; Stylelint rejects raw values outside `src/styles/tokens/`.
- **Self-hosted, subset fonts**, rebuilt by `scripts/fonts.sh`.
- **SEO**: per-page metadata, JSON-LD, sitemap, RSS, `llms.txt`, Open Graph images rendered at build time.
- **Security**: a Content Security Policy with hashed inline scripts and styles.

The details and the conventions are in [`docs/architecture.md`](docs/architecture.md), the visual system in [`docs/design/`](docs/design/), the latest audit in [`docs/audit.md`](docs/audit.md).

## Quality gates

Every pull request runs `pnpm verify`, the build, and Lighthouse CI on the home page, a case study and the notes index: 100 in accessibility, best practices and SEO, 0.95 or more in performance, LCP under 1.5 s, CLS 0, and JavaScript and font byte budgets.

## Deployment

GitHub Actions (`.github/workflows/ci.yml`) publishes `dist/` to the `gh-pages` branch on every push to `main`, after the same checks, and refuses to publish placeholder copy. The custom domain is set in `public/CNAME`; `public/.nojekyll` keeps GitHub Pages from running Jekyll. Analytics (Umami, cookieless) turn on when the repository variable `UMAMI_WEBSITE_ID` is set.
