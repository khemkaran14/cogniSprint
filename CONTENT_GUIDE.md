# Content Guide

Same editorial rules as the companion Next.js build — this governs any copy for CogniSprint regardless of which repo it lives in.

## Tone

Intelligent, energetic, premium, optimistic, modern, trustworthy. Scientific without being clinical. Playful without being childish. Concrete claims over adjectives — "365 daily 15-minute sessions" beats "a transformative journey."

## Claim restrictions (hard rules)

Never state or imply:

- A guaranteed IQ increase or change in intelligence-test scores
- "Become a genius," "double your intelligence," "permanent cognitive transformation"
- Scientific claims without a citation you can stand behind
- Guaranteed academic, professional or exam outcomes
- Medical claims (preventing dementia, curing memory loss, treating any condition)
- Fake user counts, testimonials, ratings, or countdown timers without a real scheduled end date

Any page presenting the challenge result must include a line stating it's a practice snapshot, not a diagnostic or intelligence assessment — see `ResultsScreen` for the reference implementation.

The full educational disclaimer text lives in `client/src/config/brand.ts` (`educationalDisclaimer`) and renders in the footer and `/legal/disclaimer`. Link to it rather than restating a different version elsewhere.

## Skill categories

Defined once in `client/src/config/brand.ts`, consumed everywhere (hero, skill grid, curriculum filters, challenge steps): Mental Math (blue), Memory (violet), Focus (green), Logical Reasoning (orange), Observation (cyan), Critical Thinking (red/coral). Don't invent new skill names in copy without adding them there first.

## Content that lives in MongoDB vs. in code

Unlike the Next.js sibling (where curriculum/FAQ/blog are TypeScript config), **this build stores curriculum modules, FAQ items and blog articles in MongoDB** (`server/src/models/`), seeded from `server/src/seed/data.ts`. When editing this content:

1. Edit `server/src/seed/data.ts` (the source of truth for what a fresh install seeds).
2. Re-run `npm run seed` in `server/` — it upserts by unique key (`slug`/`code`), so re-running is safe and won't duplicate records.
3. For a live/production database, either edit the seed data and re-run the seed script, or (once an admin panel exists — see "What's not built yet") edit directly via that interface.

Brand copy, navigation structure and the free challenge's question bank remain in `client/src/config/`/`client/src/content/` since they're identity/presentation, not editable content.

## Exercise format

Each curriculum module (`Module` documents) needs: title, description, skills, lesson count, exercise count, difficulty, estimated minutes, whether a preview is available, and which programme phase it belongs to. The free challenge's individual exercises (`client/src/content/challengeQuestions.ts`) need: skill, prompt, correct answer, and (for critical-thinking items) an explanation.

## Difficulty rules

Progressive across the module sequence — first modules beginner, later modules intermediate/advanced. A whole module can be primarily one level; don't force an even split within every module.

## Editorial checklist

Before publishing any new page or seed content update:

- [ ] No claim from the "never state" list appears anywhere on the page
- [ ] Any score/result display includes the "practice snapshot, not diagnostic" note
- [ ] Skill names match `skillCategories` in `config/brand.ts` exactly
- [ ] No invented statistics, testimonials, or user counts
- [ ] Numbers shown on marketing pages (lesson/exercise counts) are computed from the live `/api/curriculum` response, not hand-typed, so they can't drift from what's actually seeded
- [ ] Reading level appropriate for a broad audience (10+ to working professionals)
