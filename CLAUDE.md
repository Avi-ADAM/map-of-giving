# מפת השפע (Map of Abundance)

A map where anyone can share free food or items they saw on the street ("a box of B-grade
vegetables next to the grocery on X street", "a sofa next to the bin on Y street"), and others can
report "still there" / "taken" / "not found" / "not in good condition". No sign-up required.

The site is built as a **rikma** (open fair-share partnership of developers and content reviewers)
on [1💗1](https://www.1lev1.com/), [project 89](https://www.1lev1.com/project/89). The footer links
to the rikma, its support page and the platform; URLs live in `src/lib/rikma.ts`. The logo source is
`design/logo-source.png`; web sizes are generated into `src/lib/assets/logo-96.png` and `static/`.
The repo folder is still named `map-of-giving` (the site's earlier working name).

## Who uses it — this drives every decision

- People with little money, often on **cheap, old phones with limited data**.
- Many are **not comfortable with technology**, some use screen readers or large fonts.
- Hebrew first (RTL), plus Arabic (RTL), Russian, English, French.

## Non-negotiables

- **Light**: no web fonts, no UI libraries, no images where emoji/CSS do. Leaflet is loaded lazily
  only when a map is on screen. Check client bundle size before adding a dependency.
- **Works without JS where possible**: pages are server-rendered, forms are SvelteKit form actions
  with `use:enhance`. The listing list is always rendered as the accessible alternative to the map.
- **Accessibility (WCAG 2.1 AA minimum, aim higher)**: labels on every input, error summary that
  receives focus, `role="status"` for async messages, 48px touch targets (`.btn`), visible focus
  ring, never color-only meaning, emoji always `aria-hidden` next to real text, logical CSS
  properties (`ms-`/`ps-`/`start`) so RTL works.
- **Plain language** in all copy. Short sentences. Gender-neutral plural in Hebrew ("לחצו").
- **No personal data**: anonymous users get a random `anon_id` cookie (hooks.server.ts) used only
  for rate limiting and report dedup. Never store IPs or reporter locations.

## Stack

SvelteKit 2 + Svelte 5 (runes) · TypeScript · Tailwind 4 · Drizzle ORM · Neon Postgres in
production, PGlite locally (`DATABASE_URL="pglite:./.data/pglite"`, migrations applied on startup)
· Paraglide (i18n, Hebrew is the base locale at `/`, others under `/en`, `/ar`, ...) · Leaflet +
OpenStreetMap tiles.

## Commands

- `npm run dev` — dev server (local PGlite DB, no setup)
- `npm run check` — svelte-check / TypeScript
- `npm run lint` / `npm run format`
- `npx vitest run --project server` — unit tests (the `client` project needs Playwright browsers)
- `npm run db:generate` — after changing `src/lib/server/db/schema.ts`, commit the SQL in `drizzle/`
- `npm run db:migrate` — apply migrations to the Neon database

## Conventions

- Domain constants (categories, report kinds, TTLs) live in `src/lib/domain.ts`. The schema imports
  it with a **relative path** because drizzle-kit doesn't understand `$lib`.
- Business rules (expiry, rate limits, when a listing is hidden) live in
  `src/lib/server/listings.ts`. Validation is pure and unit-tested in `src/lib/listing-validation.ts`.
- Hot spots (`/spots`, places where free things show up regularly) follow the same split:
  rules in `src/lib/server/spots.ts`, the "is it worth going" verdict and staleness in
  `src/lib/spot-rating.ts`, validation in `src/lib/spot-validation.ts`.
- Internal links: always `href('/path')` from `$lib/i18n` (adds the language prefix + base path).
- Every new UI string goes into **all five** files in `messages/`. Use `Intl` for dates, distances
  and numbers (`$lib/format.ts`) instead of hand-written plurals.
- Never send `anonId`/`userId` to the client; select `publicColumns` in `listings.ts`.
