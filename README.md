# Portfolio

Personal portfolio of Thibaut Lefrançois, built with [Astro](https://astro.build). Version 2 is in progress.

## Getting started

Requires **Node >= 22.22.0** and **pnpm**.

```bash
pnpm install    # Install dependencies
pnpm dev        # Dev server at localhost:4321
pnpm build      # Production build to ./dist/
pnpm preview    # Preview the production build
```

## Deployment

Every pull request and push runs `pnpm verify` and a build through GitHub Actions (`.github/workflows/ci.yml`). Pushes to `main` then publish `dist/` to the `gh-pages` branch. The custom domain is set in `public/CNAME`.
