# GlobalVox RSVP Calling Campaign System

A Vercel-ready, full-stack application for the GlobalVox event team to upload invitee lists, launch RSVP campaigns, execute AI voice call simulations at scale, and track detailed attendance outcomes.

---

## 🚀 How to Run the Application Locally

1. **Navigate to the application folder**:
   ```bash
   cd rsvp-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000).

5. **Deploy to Vercel**:
   Import `rsvp-app` into Vercel or run `npx vercel` — zero configuration required.

---

## 🏗️ Architecture & Design Overview

- **Frontend & Server Routes**: Built using Next.js (App Router), TypeScript, and Tailwind CSS.
- **Data Domain**:
  - `Invitee`: Master directory with format validation.
  - `Campaign`: Campaign metadata.
  - `CampaignInvitee`: **Snapshot protection layer** capturing master invitees at campaign creation.
  - `CallAttempt`: Historical call log tracking latency, carrier errors, raw response JSON, and AI transcripts.
- **Calling Service Simulator (`/api/calling-service`)**:
  - Simulates external AI calling providers with realistic carrier delays, error rates (busy, unreachable, timeout), and RSVP outcomes.

---

## 💡 Important Technical Decisions

1. **Snapshotting Master Lists**:
   Campaigns copy master invitee records into `CampaignInvitee` at launch. Edits to master lists later will never alter an active campaign in progress.

2. **Serverless Execution Strategy for High Scale (100k+ invitees)**:
   - Vercel serverless functions have execution timeout limits (~10s on free tiers).
   - Rather than executing 100k calls in a single HTTP request, the UI uses **client-orchestrated chunked batch processing** (bounded concurrency: 3).
   - *Production Recommendation*: At true 100k+ scale, use message queues (e.g., Upstash QStash, BullMQ) and background worker pools with Server-Sent Events (SSE) or WebSockets for live status updates.

3. **Resilience & Retry Strategy**:
   - Every call attempt is wrapped in exception handling with timeout bounds.
   - On failure (carrier error, busy line), the attempt count increments, error details are saved in `CallAttempt`, and status is set to `pending` until max retries (3) are reached, after which it transitions to `failed`.

---

## 🤖 AI Usage Section

- **AI Tools Used**: Antigravity Assistant (Google DeepMind Team).
- **What AI was used for**: Architectural design, domain model drafting, Next.js API route construction, simulated dialogue generation, and component layout.
- **One useful contribution from AI**: Designing the snapshot model (`CampaignInvitee`) to decouple active campaigns from master list mutations.
- **One situation where AI output was verified/modified**: Modified Next.js 15 route parameters from synchronous objects `{ params: { id } }` to async promises `Promise<{ id: string }>` to satisfy strict TypeScript build rules.

---

## 🔮 What Would Be Improved with More Time

1. **Persistent Database**: Upgrade from memory store to Neon Postgres + Prisma ORM.
2. **Audio Waveform Preview**: Include audio playback controls for simulated voice recordings.
3. **Automated Retry Schedule**: Configure exponential backoff timers (e.g. retry failed calls after 30 minutes).
