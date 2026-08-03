# Design System — "Cognitive Energy"

Identical visual language to the companion Next.js build — same tokens, same component behavior — re-expressed as a plain CSS file (`client/src/index.css`) consumed via Tailwind v4's `@theme inline`, since there's no framework-level theme API here.

## Colours

**Brand core**: deep navy (`--color-brand-navy`), electric blue (`--color-brand-blue`, primary action colour), violet (`--color-brand-violet`), aqua (`--color-brand-aqua`), warm orange (`--color-brand-orange`, reserved for gamification/streak moments).

**Skill colours** (fixed mapping, `client/src/config/brand.ts`): Mental Math = blue, Memory = violet, Focus = green, Logic = orange, Observation = cyan, Critical Thinking = red/coral.

**Semantic**: success/warning/error/info, each with a paired `-surface` background token.

**Surfaces**: `--color-surface` (page), `--color-surface-raised` (cards), `--color-surface-sunken` (recessed sections).

Contrast note: when placing skill-coloured text on the brand gradient (e.g. the challenge share card), wrap it in a solid light pill rather than colouring the text directly — some skill colours (blue) wash out against the blue-violet gradient otherwise (see `ShareResultCard`).

## Typography

- **Display**: Space Grotesk (headings, weights 500–700), loaded via a Google Fonts `<link>` in `index.html` (a Vite SPA has no `next/font`-equivalent build-time font optimisation, so this is a standard `<link rel="stylesheet">` with `preconnect` hints).
- **Body**: Inter, weights 400–700, tabular figures enabled for aligned numbers in scores/prices.

## Components

`client/src/components/ui/`: `Button` + `LinkButton` (a `react-router-dom` `Link` styled with the same `cva` variants as `Button`, replacing the Next version's Radix `Slot`-based `asChild` pattern), `Card`, `Badge`, `Accordion`/`Tabs` (Radix primitives), `Input`/`Textarea`/`Label`/`FieldError`, `Alert`, `ProgressBar`.

Domain components live alongside their domain (`components/marketing`, `components/course`, `components/challenge`, `components/checkout`), matching the Next.js sibling's architecture.

### New in this build: `QueryStates`

Because data now arrives over the network via TanStack Query instead of resolving before render (as Next's server components do), every data-dependent page needs explicit loading/error/empty handling. `components/shared/QueryStates.tsx` provides `LoadingState`, `ErrorState` (with a retry button wired to `refetch()`), and `EmptyState` — used consistently across the curriculum browser, pricing, blog, FAQ and checkout.

## Icons

Lucide React. This build pins an earlier Lucide version (`0.469.x`) than the Next.js sibling, which still includes the classic brand/social icons (Facebook, Twitter, LinkedIn) removed in Lucide 1.x — so `ShareButtons` uses real brand icons here rather than the text-abbreviation fallback the sibling repo needed.

## Motion

Framer Motion, same restraint as the sibling build: `Reveal` (`components/shared/Reveal.tsx`) skips its scroll-triggered animation entirely under `prefers-reduced-motion` via `useReducedMotion()`, rather than merely shortening the duration.

## Accessibility

Same bar as the Next.js sibling: visible focus states, skip-to-content link, Radix-driven keyboard support for accordions, `aria-live` countdowns in the challenge timer, `role="progressbar"` with `aria-valuenow` on score bars, colour never used as the only signal (difficulty/skill badges always pair colour with text).

## Responsive rules

Mobile-first; a persistent mobile sticky CTA (`MobileStickyCta`) appears below the `lg:` breakpoint, with `pb-20 lg:pb-0` reserved on the main content area so it never overlaps page content.

## Theming

Light is the polished default; dark exists via `:root[data-theme="dark"]` plus a `prefers-color-scheme` fallback, applied pre-hydration by an inline script in `index.html` (the SPA equivalent of the Next version's `beforeInteractive` script) to avoid a flash of the wrong theme.
