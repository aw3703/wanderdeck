# WanderDeck 🧭

> **Interactive Collaborative Expedition Studio & AI Audio Field Guide**  
> Built and deployed natively on [DeepSpace](https://docs.deep.space).

Live Application: [https://wanderdeck.app.space](https://wanderdeck.app.space)  
GitHub Repository: [https://github.com/aw3703/wanderdeck](https://github.com/aw3703/wanderdeck)

---

## Overview

**WanderDeck** transforms static travel plans and itineraries into living, synchronized expedition decks. Designed for explorers, trek leaders, field scientists, and backcountry teams, WanderDeck pairs real-time collaborative state with automated encyclopedic cultural intelligence, live atmospheric telemetry, voice-narrated audio field guides, and an AI route strategist.

Whether mapping the glacier lagoons of Iceland's south coast or charting historic shitamachi alleyways in Tokyo, expedition teams share live waypoints, synchronized gear checklists, and real-time field logbooks.

---

## Key Features

- **Real-Time Expedition Studio (`/home`)**:
  - Collaborative expedition decks backed by DeepSpace's `RecordRoom` Durable Object.
  - Multi-user presence indicator displaying active explorers in real time (`usePresence`).
  - Seamless dual-path data lifecycle: pre-seeds flagship expeditions with zero friction while supporting granular real-time mutations.
- **Automated Waypoint Enrichment**:
  - **Live Weather Telemetry**: Queries OpenWeatherMap to deliver current temperature, apparent temperature, humidity, and wind conditions for route waypoints.
  - **Encyclopedic Cultural Context**: Pulls Wikipedia summaries, descriptions, and verified URLs for geographical landmarks.
  - **AI Audio Field Guides**: Synthesizes spoken-word field guide narratives using OpenAI Speech TTS with in-app audio scrubbing, speed multipliers, and playback controls.
- **AI Field Strategist (Claude)**:
  - Context-aware expedition advisory drawer powered by Anthropic's `claude-haiku-4-5`.
  - Analyzes terrain, weather telemetry, gear lists, and waypoints to offer tactical advice, hazard alerts, pack recommendations, and photo timings.
- **Full Expedition Generator**:
  - One-click expedition planning: specify destination, duration, and expedition style to receive a complete structured itinerary with verified coordinates and gear checklists.
- **Vintage Travel Poster Art**:
  - Generates bespoke retro silkscreen expedition posters using Google Gemini image models.
- **Collaborative Gear Checklist**:
  - Live shared gear tracking with categorical filtering (Technical Gear, Safety / First Aid, Docs & Permits, Provisions).
- **Synchronized Field Logbook**:
  - Real-time observation logging and hazard alert broadcasting with instant collaborator sync.

---

## DeepSpace Integrations Used

WanderDeck utilizes **five** platform integrations configured under developer billing (`src/integrations.ts`):

| Integration | Endpoint | Role in WanderDeck |
|---|---|---|
| **OpenWeatherMap** | `openweathermap/current` | Real-time weather telemetry (temp, feels-like, wind, humidity) for every waypoint. |
| **Wikipedia** | `wikipedia/get-page-summary` | Curated encyclopedic briefings, descriptions, and landmark history. |
| **Anthropic** | `anthropic/chat-completion` (`claude-haiku-4-5`) | Conversational Field Strategist drawer & full expedition itinerary generator. |
| **OpenAI Speech** | `speech/text-to-speech` (`tts-1`) | Spoken-word MP3 audio narration generation for field waypoints. |
| **Google Gemini** | `gemini/generate-image` | Vintage expedition travel poster generation for deck covers. |

---

## Architecture & Platform Primitives

WanderDeck strictly aligns with DeepSpace's architectural philosophy:

1. **Storage & Multi-Tenancy**:
   - Collections defined declaratively with `CollectionSchema`:
     - `expeditions`: Master expedition dossier, status, date windows, cover imagery.
     - `waypoints`: Route stops, coordinates, weather cache, wiki summary, audio guide URL.
     - `checklists`: Team pack list, category classifications, completion states.
     - `fieldnotes`: Collaborative team observations, hazard alerts, insider tips.
   - Schemas are wired directly into the app's `RecordRoom` Durable Object via `src/schemas.ts`.
2. **Static Prerender Contract**:
   - The landing page (`/`, `src/pages/index.tsx`) strictly adheres to DeepSpace's static contract (`data-testid="static-landing"`), making zero auth API calls and initiating zero WebSockets on initial load for optimal SEO and instant Time to Interactive.
   - Dynamic application state mounts securely within the `(app)/` route boundary (`src/pages/(app)/home.tsx`).
3. **Privileged Server Actions**:
   - Complex workflows requiring multi-API orchestration (`enrichWaypoint`, `askStrategist`, `generateExpedition`, `generatePoster`, `seedSampleData`) run as worker server actions in `src/actions/index.ts`.
   - Actions utilize `createActionTools` with `tools.integration` and `tools.create` to ensure API keys and credentials never leak to the client browser.
4. **Dual-Tier Client Seeding & Mutations**:
   - If an unauthenticated scout visits the studio, client-side mutations immediately populate curated flagship expeditions (Iceland South Coast & Tokyo Heritage Trails) directly via WebSocket into `RecordRoom`, providing full interactivity without an upfront sign-in barrier.

---

## Verification & Test Suite

WanderDeck includes comprehensive test suites across unit, smoke, API, and end-to-end user flows:

```bash
# 1. Type check and unit tests
npm run validate

# 2. Production bundling & prerender check
npm run build

# 3. Playwright Smoke tests (Static contract, SEO, 404 handling)
npx deepspace test run smoke

# 4. Playwright API tests (Auth worker proxy, WebSocket endpoints)
npx deepspace test run api

# 5. Playwright E2E tests (Navigation, waypoints, checklist, strategist)
npx deepspace test run e2e
```

All suites execute cleanly against the local workerd/Vite server and in automated CI pipelines.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to DeepSpace
npx deepspace deploy
```

---

## Technical Tradeoffs & Design Decisions

1. **Structured Waypoint Enrichment vs. Streaming LLM**:
   - *Tradeoff*: Rather than streaming generic conversational text, we structured waypoint enrichment into deterministic, modular chunks (Wikipedia JSON, OpenWeatherMap telemetry, and OpenAI audio guide MP3).
   - *Why*: In backcountry or mobile environments, quick scannability of temperature, wind speed, and offline-playable audio guides provides vastly superior utility over parsing lengthy chat walls.
2. **Client-Side Mutation Fallback vs. Mandatory Signup**:
   - *Tradeoff*: Permitting unauthenticated `viewer` write access on public demo decks versus locking all writes behind auth.
   - *Why*: Frictionless evaluation. Anyone visiting the deployed URL can immediately interact with waypoints, toggle gear checkboxes, and test the UI without having to create an account first.
3. **Static Landing Separation (`/` vs `/home`)**:
   - *Tradeoff*: Hosting the landing page outside the authenticated app provider tree.
   - *Why*: Guarantees zero WebSocket connections and zero auth proxy round-trips on initial landing, satisfying DeepSpace's strict static performance contract and SEO guidelines.
