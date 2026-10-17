# Portfolio

Personal portfolio of Thibaut Lefrançois, built with [Astro](https://astro.build). Version 2 is in progress.

## Getting started

Requires **Node >= 22.12.0** and **pnpm**.

```bash
pnpm install    # Install dependencies
pnpm dev        # Dev server at localhost:4321
pnpm build      # Production build to ./dist/
pnpm preview    # Preview the production build
```

## Deployment

Every push to `main` builds the site and publishes `dist/` to the `gh-pages` branch through GitHub Actions (`.github/workflows/deploy.yml`). The custom domain is set in `public/CNAME`.
