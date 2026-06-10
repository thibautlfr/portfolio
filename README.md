# Portfolio — thibautlfr

Personal portfolio built with Astro 6, Tailwind CSS v4, and GSAP animations.

## Tech Stack

- **Astro 6** — Static site generation with MDX content collections
- **Tailwind CSS v4** — Utility-first styling via Vite plugin
- **GSAP** — Menu and page transition animations
- **MDX** — Project pages and blog posts
- **Prettier** — Code formatting (with Astro and Tailwind plugins)

## Project Structure

```text
src/
├── components/       # Astro components (Header, Menu, ProjectCard, etc.)
├── content/
│   ├── blog/         # Blog posts (.mdx)
│   └── projects/     # Project pages (.mdx)
├── layouts/          # BaseLayout
├── pages/            # Routes (index, projects, blog, about, contact)
├── styles/           # Global CSS (Tailwind v4)
└── config.ts         # Navigation links and socials
```

## Getting Started

Requires **Node >= 22.12.0** and **pnpm**.

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server at localhost:4321
pnpm build            # Production build to ./dist/
pnpm preview          # Preview production build
pnpm format           # Format code with Prettier
```

## Content

Content collections are defined in `src/content.config.ts`:

- **Projects** — `src/content/projects/*.mdx` (title, description, date, status, stack, optional repository/live links)
- **Blog** — `src/content/blog/*.mdx` (title, description, date, tags, optional project reference, draft flag)

## License

MIT
