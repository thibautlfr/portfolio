# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro 7, static output, deployed to GitHub Pages from `main`. TypeScript strict, native CSS with Radix Colors, no UI framework. Source: `docs/v2-planning-prompt.md` and the approved V2 plan.

## Users

- **Régie prospects**: ESN account managers, IT departments (DSI) and freelance recruiters looking for a full-stack developer for a mission. They scan fast, look for stack, seniority, location and availability, and want a CV and an email.
- **Direct clients**: startups and agencies who need a product built or a team reinforced. They look for proof of quality, taste and the ability to own a product end to end.

Both audiences carry equal weight. Each must understand within ten seconds who Thibaut is, what he does and how to reach him.

## Product Purpose

Personal portfolio of Thibaut Lefrançois, freelance full-stack developer. It converts the two audiences above into an email. It also shows the creative half of his work (Three.js, shaders, graphic design, painting, drawing) without letting it blur the professional offer. The site and its repository are themselves proof of competence: performance, accessibility, SEO and code quality are part of the pitch.

Success: a prospect sends an email to `hello@thibaut-lefrancois.com`.

## Positioning

A rigorous engineer with taste. The frame (layout, type, rhythm, structure) stays sober, precise and high-end. Colour and audacity come from the works: projects, posters, experiments, the hero shader. Three.js projects are presented from the engineering angle (API, typing, performance, constraints) so they read as credible to a CTO.

## Operating Context

- Based in La Rochelle, France. Remote across France, on-site in Bordeaux, Niort and around. Paris is negotiable case by case and is not written on the site.
- Contact is direct email only: no form, no booking widget.
- Content is English only. File names, folders and URL slugs are English.
- Content is added by dropping one file (plus colocated assets) per project, experiment, artwork or note.

## Capabilities and Constraints

- Pages: home (self-sufficient, rich), `/work/[slug]` case studies, `/notes` and `/notes/[slug]`, `/legal-notice/`, 404.
- Light theme only at launch. Tokens are semantic so a dark theme can be added later.
- Zero client JavaScript by default. One ambient WebGL2 shader in the hero, loaded after LCP, paused off-screen, frozen under reduced motion, with a pause control.
- Targets: Lighthouse 100 in all four categories on mobile, CLS 0, LCP under 1.5 s on simulated 4G, WCAG 2.2 AA.
- Fonts: OFL only, self-hosted.
- Analytics: Umami Cloud, cookieless.

## Brand Commitments

- Accent colour: Radix teal. Neutral: Radix sage (Radix's natural pairing).
- The user explicitly rejects the "AI landing page" look: gradient blobs, glassmorphism, generic bento, "Hi, I'm X 👋", decorative icons, Inter with Instrument Serif italic accents.
- Writing: no em dashes, no "it's not X, it's Y", no forced triads, no decorative emoji.
- Thibaut's own graphic language (from his posters): visible structural grids and hairlines, numbered annotations, mixed display faces, heavy expressive display type, halftone dot screens (from his drawn avatar).

## Evidence on Hand

- Portrait, black and white, studio, smiling (`~/Documents/assets/photo_real.jpg`).
- Drawn avatar with halftone hair (`~/Documents/assets/photo_draw.png`).
- Posters: Feel Your Boobs (Pink October, 2160×2700) and Save My Mind (2376×3360).
- Main projects: Youbook (client SaaS, booking platform for tourism, microservices, OCTO standard, embeddable widgets; no code, numbers or competitor names may be shown, wording under client validation), Steerkit (open source steering behaviors library, demos), Ocarina · Songs of Hyrule (playable ocarina in the browser), Ocean Heartbeat (Nuit de l'Info 2024, winner of the "On veut du gros pixel" challenge).
- Playground: Trinity (WebGL album flip), 3D Carousel (first shaders).
- Absent: project screenshots and videos, final project texts, testimonials, client logos, metrics. Do not invent any of them.

## Product Principles

1. Conversion first: who, what, where and how to contact must be readable before anything creative.
2. The frame is quiet, the works are loud.
3. Prove, never claim: show the work and the engineering, no hype words, no invented numbers.
4. Every rule that can be checked by a machine is checked by a machine.

## Accessibility & Inclusion

WCAG 2.2 AA minimum: full keyboard navigation, visible focus, skip link, landmarks, heading hierarchy, verified contrast, meaningful alt text, reduced motion respected, a pause control for any motion longer than five seconds.
