# Rotom Earpiece — Design Spec

Date: 2026-08-27

## Purpose

A web tool that helps a Pokémon Champions player during and around
competitive battles. V1 focuses on **real-time battle assistance**:
given what's known about your team and what's been revealed of the
opponent's, help figure out likely leads, likely opponent sets
(moveset/item/ability/SP spread), and damage calculations — while you
are actively playing a match. The app is built as a set of independent
tool tabs so it can grow additional sections (team building, scouting,
etc.) over time without restructuring what already exists.

## Design principle: tools first, predictions optional

Every tool must work standing alone with fully manual input. Predictive
features (lead suggestions, opponent set inference) are an *optional
layer* on top of the manual tools, never a requirement — a user can
always override or ignore a prediction and use a tool exactly as if it
were a plain calculator. Predictive logic is confined to the Battle
Tracker tab; the Damage Calculator and Team Builder tabs have zero
dependency on it.

## Goals (v1)

- Standalone Damage Calculator tab using Champions' actual mechanics
  (SP system, not EVs).
- Standalone Team Builder tab to create/save your own teams locally.
- Battle Tracker tab: team preview entry, lead prediction, and a live
  opponent "set inference" aid that narrows down likely sets as you
  observe things mid-battle, feeding the same damage-calc logic.
- All data client-side for v1: no accounts, no server-side persistence.

## Non-goals (v1)

- No automated battle-state capture (no OCR, no game API/log
  integration) — all battle-state input is manual.
- No accounts, cross-device sync, or persistent battle history.
- No team-preview lead-combination stats beyond simple usage-role
  heuristics (full co-occurrence/tournament-team analysis is a later
  enhancement, not v1).
- No mobile app — web only, but usable on a phone browser between
  turns.

## Architecture

**Static, client-heavy web app — no application backend in v1.**

- Frontend: a single-page app (component-routed tabs) built and hosted
  as static files in an **S3 bucket**, served via **CloudFront** for
  HTTPS and caching. There is no always-on server.
- Base game data (species, moves, abilities, items, natures, type
  chart, SP-system rules) is bundled directly into the frontend build,
  sourced from `otterlyclueless/pokemon-champions-data` (open JSON, CC
  BY 4.0). Treated as "good enough for v1, may have gaps" since it's a
  new community-maintained dataset — species entries can be manually
  overridden locally if errors are found, without waiting on upstream.
- Meta-set data (opponent usage stats: common movesets/items/abilities/
  SP-spreads per species) is produced by a small Node ETL script that:
  1. Scrapes/parses Pikalytics' markdown-formatted stats endpoints
     (`/ai/pokedex/[format]/[pokemon]`).
  2. Merges in manually curated overrides (for gaps, new metagame
     shifts Pikalytics hasn't caught up to, or corrections).
  3. Validates the output shape before publishing.
  4. Writes the result to S3 as a versioned file (e.g.
     `meta-sets-2026-08-27.json`) plus updates a `latest.json` pointer.
     If validation fails, the previous `latest.json` is left in place
     rather than overwritten with broken/empty data.
  - This script runs on a schedule via an **AWS Lambda function
    triggered by EventBridge Scheduler** (e.g. daily) — serverless, no
    continuously-running process.
- All app state during use (current battle tracker session, saved
  teams) lives in the browser (`localStorage` + in-memory), not on a
  server.

### Data access abstraction

All data reads — base game data and meta-sets — go through a single
`dataProvider` module (`getSpecies()`, `getMetaSets(species)`, etc.).
Today it resolves to bundled files / a `fetch()` against S3-hosted
JSON. This is the seam that lets the app expand later (see below)
without touching any UI or battle-logic code.

### Expansion path to a backend (later, not v1)

When features that need real server-side state arrive (accounts,
cross-device battle history, live-updating stats without a redeploy),
add **API Gateway + Lambda + DynamoDB** (still fully serverless) for
just those new features. The `dataProvider` module gains new methods
that call these endpoints; everything that's inherently static
(species data, meta-sets) keeps flowing through S3/CloudFront exactly
as before. This is additive — no rewrite of the existing tools.

## App structure (tabs)

1. **Damage Calculator** (standalone)
2. **Team Builder** (standalone)
3. **Battle Tracker** (standalone, live-battle assistant)

### Damage Calculator

Manual attacker/defender/move/field-condition inputs (species,
moveset, item, ability, SP spread, nature, weather/terrain/screens) →
damage range (%) and KO chance. Implemented as a pure function module
(`calculateDamage(attacker, defender, move, field) -> DamageResult`)
with zero dependency on battle-tracker state, so it can be:
- Used directly from its own tab.
- Reused by the Battle Tracker tab to score matchups, pre-filled with
  inferred or manually-entered opponent data.

The damage formula is **hand-written**, not sourced from an existing
library (no open-source calculator currently models Champions' SP
system or Omni Ring mechanics). It follows the same general shape as
mainline Pokémon damage formulas (power × atk/def ratio × modifiers ÷
50 + 2, STAB, type effectiveness, etc.) with the stat calculation
swapped to the SP model (66 total points, max 32/stat, per
`pokemon-champions-data`). Values should be spot-checked against an
existing Champions calculator (e.g. Porygon Labs) during implementation
to catch formula mistakes.

### Team Builder

Create/edit Pokémon (species, moveset, item, ability, SP spread,
nature) and group them into teams. Persisted to `localStorage` under a
"My Teams" list. No server persistence in v1.

### Battle Tracker

The live "in-ear" assistant, composed of:

- **Team Preview** — enter the opponent's revealed roster via
  autocomplete against the species dataset (prevents invalid/typo'd
  entries entirely, rather than validating after submission).
- **Lead Predictor** — ranks likely opponent leads using usage-role
  heuristics from the meta-set data (e.g. typical speed tier /
  support-vs-attacker role patterns), and suggests a counter-lead from
  your team based on type/speed matchups. A suggestion, not a
  requirement — you pick your own lead regardless.
- **Set Inference Engine** — for each opposing Pokémon, starts from its
  meta-set candidates (moveset/item/ability/SP-spread variants with
  usage %). As you log observations during the match (a move used, an
  item triggering, an ability revealed, a speed comparison), it
  eliminates incompatible candidates and re-ranks what remains by usage
  probability. Implemented as a **pure logic module**
  (`inferSets(species, evidenceLog) -> RankedCandidate[]`), independent
  of UI and independent of the Damage Calculator — it just produces
  candidate sets that get handed to the calculator like any manually
  entered set.
- **Live tracker view** — ties the above together: shows each opposing
  Pokémon's most-likely set with a confidence indicator, and damage
  ranges for your moves against it (via the Damage Calculator module).
  Every inferred field remains manually editable/overridable — if you
  *know* something the inference missed (e.g. you saw their item
  directly), you can lock it in and the calc uses your value instead.

## Data flow (typical battle)

1. Load a saved team from Team Builder (or enter one ad hoc).
2. Team Preview: enter opponent's revealed species.
3. Lead Predictor shows suggested leads for both sides.
4. Battle proceeds — user logs observations into the tracker as they
   happen (move used, item revealed, ability triggered, speed order).
5. Set Inference Engine re-ranks candidate sets after each observation.
6. Damage Calculator (embedded in the tracker) shows updated damage
   ranges against the current best-guess (or manually overridden) set.
7. All of the above lives in browser memory + `localStorage` for the
   duration of the session; nothing is sent to a server.

## Error handling

- Missing meta-set data for an obscure/new Pokémon → fall back to "no
  usage data available, base stats only" rather than failing.
- ETL job validates scraped output shape before publishing to S3; on
  failure, it leaves the last known-good `latest.json` in place instead
  of publishing broken/empty data.
- Base data gaps/inaccuracies (community-sourced dataset) are handled
  via local manual overrides per species, not blocked on upstream.
- Species/move entry in the UI is constrained to autocomplete against
  known data, preventing invalid input rather than validating it after
  the fact.

## Testing

- **Damage Calculator** and **Set Inference Engine** are pure functions
  — unit-tested directly with known inputs/outputs. Damage calc values
  spot-checked against an existing Champions damage calculator (e.g.
  Porygon Labs) to validate formula correctness.
- **ETL/scrape script** — tested against saved fixture snippets of
  Pikalytics markdown output, not live network calls, to keep tests
  fast and non-flaky.
- **UI** — lighter touch for v1; manual testing of the core Battle
  Tracker flow is acceptable to start.

## Open risks / unknowns

- `pokemon-champions-data` is new and community-maintained (3 commits,
  open issues asking for verification as of this writing) — expect to
  find and locally patch data errors.
- Pikalytics' markdown-formatted endpoints aren't a stable JSON API;
  the scrape/parse step in the ETL script is the most likely thing to
  break if their page format changes. The validate-before-publish step
  exists specifically to contain that risk.
- Team Preview mechanics are assumed to work like mainline VGC (both
  sides see the opponent's full roster before selecting leads) — worth
  confirming against actual Champions rules during implementation.
- The hand-written damage formula needs real-world validation against
  known-correct values before being trusted in a live match.
