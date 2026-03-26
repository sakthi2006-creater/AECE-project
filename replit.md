# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This project is **AECE — Autonomous Ethical Cognition Engine**, a real-time AI-powered ethical decision system with a futuristic Jarvis-style dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (with WebSocket via `ws` package)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI API via Replit AI Integrations (gpt-5.2)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (ethical evaluation engine + WebSocket)
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── ethical-engine.ts   # AI reasoning + fallback scoring
│   │       │   ├── websocket.ts        # WebSocket server (broadcasts real-time updates)
│   │       │   └── logger.ts
│   │       └── routes/
│   │           ├── evaluate.ts         # POST /evaluate-action
│   │           ├── scenarios.ts        # POST /generate-scenario
│   │           ├── history.ts          # GET /history, POST /feedback
│   │           ├── weights.ts          # GET/PUT /weights
│   │           └── governance.ts       # GET /system-status, POST /override
│   └── aece/               # React + Vite frontend (Jarvis-style dark UI)
│       └── src/
│           ├── pages/
│           │   ├── Dashboard.tsx       # Main dashboard with score gauge
│           │   ├── ScenarioInput.tsx   # Evaluation terminal
│           │   ├── History.tsx         # Audit log
│           │   └── Governance.tsx      # Framework weights + override
│           ├── components/
│           │   ├── Layout.tsx          # Sidebar nav with WebSocket status
│           │   ├── ReasoningChart.tsx  # Ethical framework bar/radar chart
│           │   └── ui/
│           │       ├── ThreeBackground.tsx   # Three.js particle field (CSS fallback)
│           │       ├── ScoreGauge.tsx         # Circular ethical score gauge
│           │       ├── CyberCard.tsx          # Glassmorphism card
│           │       └── NeonButton.tsx         # Neon glowing button
│           └── hooks/
│               └── use-websocket.ts    # WS connection + query invalidation
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── decisions.ts    # decisions + feedback tables
│           └── weights.ts      # ethical_weights table
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## AECE API Endpoints

All prefixed with `/api`:
- `POST /evaluate-action` — Evaluate ethical scenario (uses OpenAI LLM with fallback)
- `POST /generate-scenario` — Auto-generate a robot ethical scenario
- `GET /history` — Get decision history (supports limit, offset, decision filter)
- `POST /feedback` — Submit approve/reject feedback on a decision
- `GET /system-status` — System health and statistics
- `GET /weights` — Get current ethical framework weights
- `PUT /weights` — Update framework weights
- `POST /override` — Manual governance override of a decision

WebSocket: `/ws` — broadcasts `new_decision`, `decision_override`, `system_update` events

## Ethical Scoring

Uses multi-framework evaluation:
- **Utilitarian** (25%) — maximize net benefit
- **Deontological** (25%) — respect duties and rights
- **Virtue** (20%) — moral character
- **Care** (15%) — relationships and interdependence
- **Context** (15%) — situational factors

Decision thresholds:
- 80–100 → APPROVED (neon green)
- 50–79 → CONDITIONAL (neon cyan)
- 20–49 → FLAGGED (orange)
- 0–19 → BLOCKED (pulsing red)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Development Commands

- `pnpm --filter @workspace/api-server run dev` — start API server
- `pnpm --filter @workspace/aece run dev` — start frontend
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from spec
- `pnpm --filter @workspace/db run push` — push database schema changes
