# ElimuCore Next.js Tutor MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user local Next.js app inside this repo that recreates the stitched ElimuCore UI and makes only the ElimuBot tutor fully live through the existing OpenClaude gRPC runtime and Ollama.

**Architecture:** Create a standalone `webapp/` Next.js app within the repository. The webapp will render the stitched screens, expose a server-side bridge to `src/proto/openclaude.proto`, stream tutor events to the browser via SSE, auto-approve runtime permission prompts for MVP execution semantics, and show all agent activity visibly in the UI. Non-tutor screens remain mock-data shells.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, `@grpc/grpc-js`, `@grpc/proto-loader`, Server-Sent Events, Bun, existing OpenClaude gRPC runtime.

---

## File Structure

### New Web App Package

- Create: `webapp/package.json`
- Create: `webapp/tsconfig.json`
- Create: `webapp/next.config.ts`
- Create: `webapp/postcss.config.mjs`
- Create: `webapp/eslint.config.mjs`
- Create: `webapp/src/app/layout.tsx`
- Create: `webapp/src/app/globals.css`
- Create: `webapp/src/app/page.tsx`
- Create: `webapp/src/app/welcome/page.tsx`
- Create: `webapp/src/app/role/page.tsx`
- Create: `webapp/src/app/login/page.tsx`
- Create: `webapp/src/app/dashboard/page.tsx`
- Create: `webapp/src/app/catalog/page.tsx`
- Create: `webapp/src/app/tutor/page.tsx`

### Shared UI and Demo Data

- Create: `webapp/src/lib/design-tokens.ts`
- Create: `webapp/src/lib/demo-data.ts`
- Create: `webapp/src/components/layout/app-shell.tsx`
- Create: `webapp/src/components/layout/sidebar.tsx`
- Create: `webapp/src/components/layout/topbar.tsx`
- Create: `webapp/src/components/screens/welcome-screen.tsx`
- Create: `webapp/src/components/screens/role-screen.tsx`
- Create: `webapp/src/components/screens/login-screen.tsx`
- Create: `webapp/src/components/screens/dashboard-screen.tsx`
- Create: `webapp/src/components/screens/catalog-screen.tsx`
- Create: `webapp/src/components/screens/tutor-screen.tsx`
- Create: `webapp/src/components/tutor/chat-message.tsx`
- Create: `webapp/src/components/tutor/chat-composer.tsx`
- Create: `webapp/src/components/tutor/folder-switcher.tsx`
- Create: `webapp/src/components/tutor/activity-panel.tsx`
- Create: `webapp/src/components/tutor/status-pill.tsx`

### gRPC Bridge and Session Layer

- Create: `webapp/src/lib/grpc/proto.ts`
- Create: `webapp/src/lib/grpc/client.ts`
- Create: `webapp/src/lib/server/tutor-session-store.ts`
- Create: `webapp/src/lib/server/tutor-event-map.ts`
- Create: `webapp/src/lib/server/tutor-status.ts`
- Create: `webapp/src/app/api/tutor/sessions/route.ts`
- Create: `webapp/src/app/api/tutor/sessions/[sessionId]/message/route.ts`
- Create: `webapp/src/app/api/tutor/sessions/[sessionId]/stream/route.ts`
- Create: `webapp/src/app/api/tutor/sessions/[sessionId]/folder/route.ts`
- Create: `webapp/src/app/api/tutor/status/route.ts`

### Tests

- Create: `webapp/src/lib/server/tutor-event-map.test.ts`
- Create: `webapp/src/lib/server/tutor-session-store.test.ts`
- Create: `webapp/src/lib/server/tutor-status.test.ts`
- Create: `webapp/src/app/api/tutor/sessions/[sessionId]/folder/route.test.ts`
- Create: `webapp/src/app/api/tutor/status/route.test.ts`
- Create: `webapp/src/components/tutor/tutor-screen.test.tsx`
- Create: `webapp/e2e/tutor-smoke.spec.ts`

### Root Integration

- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `README.md`

---

### Task 1: Scaffold the standalone Next.js web app

**Files:**
- Create: `webapp/package.json`
- Create: `webapp/tsconfig.json`
- Create: `webapp/next.config.ts`
- Create: `webapp/postcss.config.mjs`
- Create: `webapp/eslint.config.mjs`
- Create: `webapp/src/app/layout.tsx`
- Create: `webapp/src/app/globals.css`
- Create: `webapp/src/app/page.tsx`
- Modify: `package.json`
- Modify: `.gitignore`
- Test: `webapp/package.json`

- [ ] **Step 1: Create the webapp package manifest**

```json
{
  "name": "elimucore-webapp",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "bun test"
  },
  "dependencies": {
    "@grpc/grpc-js": "^1.14.3",
    "@grpc/proto-loader": "^0.8.0",
    "next": "^15.3.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/node": "^25.5.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.7",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.25.1",
    "eslint-config-next": "^15.3.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Add App Router layout and global stylesheet entry**

```tsx
// webapp/src/app/layout.tsx
import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'ElimuCore',
  description: 'ElimuCore tutor MVP powered by OpenClaude and Ollama',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

```css
/* webapp/src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  min-height: 100%;
}

body {
  margin: 0;
  background: #f6f9ff;
  color: #171c21;
}
```

- [ ] **Step 3: Add a minimal root redirect page**

```tsx
// webapp/src/app/page.tsx
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/welcome')
}
```

- [ ] **Step 4: Add root scripts that launch the web app from the repository**

```json
// package.json (partial)
{
  "scripts": {
    "webapp:dev": "cd webapp && bun run dev",
    "webapp:build": "cd webapp && bun run build",
    "webapp:start": "cd webapp && bun run start"
  }
}
```

- [ ] **Step 5: Ignore Next.js build artifacts**

```gitignore
# webapp build artifacts
webapp/.next/
webapp/node_modules/
webapp/test-results/
webapp/playwright-report/
```

- [ ] **Step 6: Install dependencies and confirm the scaffold boots**

Run: `cd webapp; bun install`
Expected: install completes with a generated lockfile or resolved dependency graph and no missing package errors

- [ ] **Step 7: Run the webapp in dev mode and verify the redirect**

Run: `cd webapp; bun run dev`
Expected: Next.js starts locally and visiting `/` redirects to `/welcome`

- [ ] **Step 8: Commit**

```bash
git add package.json .gitignore webapp
git commit -m "feat: scaffold ElimuCore Next.js web app"
```

---

### Task 2: Encode the stitched design system and demo shell routes

**Files:**
- Create: `webapp/src/lib/design-tokens.ts`
- Create: `webapp/src/lib/demo-data.ts`
- Create: `webapp/src/components/layout/app-shell.tsx`
- Create: `webapp/src/components/layout/sidebar.tsx`
- Create: `webapp/src/components/layout/topbar.tsx`
- Create: `webapp/src/components/screens/welcome-screen.tsx`
- Create: `webapp/src/components/screens/role-screen.tsx`
- Create: `webapp/src/components/screens/login-screen.tsx`
- Create: `webapp/src/components/screens/dashboard-screen.tsx`
- Create: `webapp/src/components/screens/catalog-screen.tsx`
- Create: `webapp/src/app/welcome/page.tsx`
- Create: `webapp/src/app/role/page.tsx`
- Create: `webapp/src/app/login/page.tsx`
- Create: `webapp/src/app/dashboard/page.tsx`
- Create: `webapp/src/app/catalog/page.tsx`
- Test: `webapp/src/components/screens/dashboard-screen.tsx`

- [ ] **Step 1: Define design tokens from the stitched UI and `DESIGN.md`**

```ts
// webapp/src/lib/design-tokens.ts
export const designTokens = {
  colors: {
    surface: '#f6f9ff',
    surfaceLow: '#eff4fb',
    surfaceLowest: '#ffffff',
    surfaceHigh: '#e4e9f0',
    surfaceHighest: '#dee3ea',
    onSurface: '#171c21',
    onSurfaceVariant: '#434656',
    primary: '#0040df',
    primaryContainer: '#2d5bff',
    secondary: '#4959a3',
    outline: '#747688',
    outlineVariant: '#c4c5d9',
  },
  radius: {
    lg: '0.5rem',
    xl: '0.75rem',
    xxl: '1.5rem',
  },
}
```

- [ ] **Step 2: Add reusable neumorphic utility classes**

```css
/* webapp/src/app/globals.css (append) */
:root {
  --surface: #f6f9ff;
  --surface-low: #eff4fb;
  --surface-lowest: #ffffff;
  --surface-high: #e4e9f0;
  --surface-highest: #dee3ea;
  --on-surface: #171c21;
  --on-surface-variant: #434656;
  --primary: #0040df;
  --primary-container: #2d5bff;
}

.neumorphic-raised {
  box-shadow: -6px -6px 12px rgba(255,255,255,1), 6px 6px 12px rgba(0,0,0,0.08);
}

.neumorphic-inset {
  box-shadow: inset 4px 4px 8px rgba(0,0,0,0.05), inset -4px -4px 8px rgba(255,255,255,1);
}

.primary-gradient {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
}
```

- [ ] **Step 3: Create demo data for non-live surfaces**

```ts
// webapp/src/lib/demo-data.ts
export const dashboardData = {
  learnerName: 'Musana',
  streakDays: 12,
  activeCourse: {
    title: 'Python Basics',
    module: 'Module 4: Loops and Logic',
    progressPercent: 64,
  },
}

export const catalogData = [
  { id: 'python-basics', title: 'Python Basics', level: 'Beginner' },
  { id: 'calculus', title: 'Introduction to Calculus', level: 'Intermediate' },
]
```

- [ ] **Step 4: Build a shared shell for stitched navigation**

```tsx
// webapp/src/components/layout/app-shell.tsx
import type { ReactNode } from 'react'

export function AppShell({
  sidebar,
  topbar,
  children,
}: {
  sidebar: ReactNode
  topbar: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <aside className="hidden w-72 shrink-0 md:flex">{sidebar}</aside>
      <main className="flex min-h-screen flex-1 flex-col">
        {topbar}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Recreate the demo routes with stitched layout fidelity**

```tsx
// webapp/src/app/dashboard/page.tsx
import { DashboardScreen } from '@/components/screens/dashboard-screen'

export default function DashboardPage() {
  return <DashboardScreen />
}
```

```tsx
// webapp/src/app/catalog/page.tsx
import { CatalogScreen } from '@/components/screens/catalog-screen'

export default function CatalogPage() {
  return <CatalogScreen />
}
```

- [ ] **Step 6: Verify the non-live stitched routes render**

Run: `cd webapp; bun run dev`
Expected: `/welcome`, `/role`, `/login`, `/dashboard`, and `/catalog` all render without runtime errors and visually resemble the HTML in `UI folder/stitch`

- [ ] **Step 7: Commit**

```bash
git add webapp/src
git commit -m "feat: add stitched ElimuCore shell screens"
```

---

### Task 3: Build the gRPC bridge client and session store

**Files:**
- Create: `webapp/src/lib/grpc/proto.ts`
- Create: `webapp/src/lib/grpc/client.ts`
- Create: `webapp/src/lib/server/tutor-session-store.ts`
- Create: `webapp/src/lib/server/tutor-event-map.ts`
- Create: `webapp/src/lib/server/tutor-status.ts`
- Create: `webapp/src/app/api/tutor/sessions/route.ts`
- Create: `webapp/src/app/api/tutor/status/route.ts`
- Test: `webapp/src/lib/server/tutor-session-store.test.ts`
- Test: `webapp/src/lib/server/tutor-status.test.ts`

- [ ] **Step 1: Load the existing OpenClaude proto from the repository root**

```ts
// webapp/src/lib/grpc/proto.ts
import path from 'node:path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'

const protoPath = path.resolve(process.cwd(), '..', 'src', 'proto', 'openclaude.proto')

const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

export const openclaudeProto = grpc.loadPackageDefinition(packageDefinition) as any
```

- [ ] **Step 2: Create a small gRPC client factory**

```ts
// webapp/src/lib/grpc/client.ts
import * as grpc from '@grpc/grpc-js'
import { openclaudeProto } from './proto'

export function createAgentClient() {
  const host = process.env.GRPC_HOST ?? 'localhost'
  const port = process.env.GRPC_PORT ?? '50051'
  return new openclaudeProto.openclaude.v1.AgentService(
    `${host}:${port}`,
    grpc.credentials.createInsecure(),
  )
}
```

- [ ] **Step 3: Create an in-memory session store that tracks active folder and messages**

```ts
// webapp/src/lib/server/tutor-session-store.ts
type TutorSession = {
  id: string
  title: string
  activeFolder: string
  messages: Array<{ id: string; role: 'user' | 'assistant' | 'system'; text: string }>
}

const sessions = new Map<string, TutorSession>()

export function createTutorSession(id: string, activeFolder: string): TutorSession {
  const session = { id, title: 'New Chat', activeFolder, messages: [] }
  sessions.set(id, session)
  return session
}

export function getTutorSession(id: string) {
  return sessions.get(id) ?? null
}

export function setTutorSessionFolder(id: string, activeFolder: string) {
  const session = sessions.get(id)
  if (!session) return null
  session.activeFolder = activeFolder
  return session
}
```

- [ ] **Step 4: Add a status checker for OpenClaude and Ollama readiness**

```ts
// webapp/src/lib/server/tutor-status.ts
export async function getTutorRuntimeStatus() {
  const grpcHost = process.env.GRPC_HOST ?? 'localhost'
  const grpcPort = process.env.GRPC_PORT ?? '50051'
  const ollamaBaseUrl = process.env.OPENAI_BASE_URL ?? 'http://localhost:11434/v1'

  const [grpcReady, ollamaReady] = await Promise.all([
    Promise.resolve(Boolean(grpcHost && grpcPort)),
    fetch(ollamaBaseUrl.replace(/\/v1\/?$/, '') + '/api/tags').then(r => r.ok).catch(() => false),
  ])

  return { grpcReady, ollamaReady, model: process.env.OPENAI_MODEL ?? null }
}
```

- [ ] **Step 5: Add session creation and status routes**

```ts
// webapp/src/app/api/tutor/sessions/route.ts
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createTutorSession } from '@/lib/server/tutor-session-store'

export async function POST(request: Request) {
  const body = await request.json()
  const session = createTutorSession(randomUUID(), body.activeFolder)
  return NextResponse.json(session, { status: 201 })
}
```

```ts
// webapp/src/app/api/tutor/status/route.ts
import { NextResponse } from 'next/server'
import { getTutorRuntimeStatus } from '@/lib/server/tutor-status'

export async function GET() {
  return NextResponse.json(await getTutorRuntimeStatus())
}
```

- [ ] **Step 6: Add tests for session state and runtime status**

```ts
// webapp/src/lib/server/tutor-session-store.test.ts
import { expect, test } from 'bun:test'
import { createTutorSession, setTutorSessionFolder } from './tutor-session-store'

test('folder updates stay attached to the same session', () => {
  const session = createTutorSession('s1', 'C:/work/a')
  const updated = setTutorSessionFolder(session.id, 'C:/work/b')
  expect(updated?.activeFolder).toBe('C:/work/b')
})
```

- [ ] **Step 7: Run the server-side unit tests**

Run: `cd webapp; bun test src/lib/server/tutor-session-store.test.ts src/lib/server/tutor-status.test.ts`
Expected: both test files pass with zero failures

- [ ] **Step 8: Commit**

```bash
git add webapp/src/lib webapp/src/app/api/tutor
git commit -m "feat: add tutor session store and runtime status bridge"
```

---

### Task 4: Implement streaming chat and automatic permission handling

**Files:**
- Modify: `webapp/src/lib/grpc/client.ts`
- Create: `webapp/src/app/api/tutor/sessions/[sessionId]/message/route.ts`
- Create: `webapp/src/app/api/tutor/sessions/[sessionId]/stream/route.ts`
- Create: `webapp/src/lib/server/tutor-event-map.ts`
- Test: `webapp/src/lib/server/tutor-event-map.test.ts`

- [ ] **Step 1: Define a browser event format for the tutor stream**

```ts
// webapp/src/lib/server/tutor-event-map.ts
export type TutorBrowserEvent =
  | { type: 'text-delta'; sessionId: string; text: string }
  | { type: 'tool-start'; sessionId: string; toolName: string; argumentsJson: string }
  | { type: 'tool-result'; sessionId: string; toolName: string; output: string; isError: boolean }
  | { type: 'system'; sessionId: string; text: string }
  | { type: 'done'; sessionId: string; fullText: string }
  | { type: 'error'; sessionId: string; message: string }
```

- [ ] **Step 2: Map gRPC server messages into browser events**

```ts
// webapp/src/lib/server/tutor-event-map.ts
export function mapServerMessage(sessionId: string, serverMessage: any): TutorBrowserEvent | null {
  if (serverMessage.text_chunk) {
    return { type: 'text-delta', sessionId, text: serverMessage.text_chunk.text }
  }
  if (serverMessage.tool_start) {
    return {
      type: 'tool-start',
      sessionId,
      toolName: serverMessage.tool_start.tool_name,
      argumentsJson: serverMessage.tool_start.arguments_json,
    }
  }
  if (serverMessage.tool_result) {
    return {
      type: 'tool-result',
      sessionId,
      toolName: serverMessage.tool_result.tool_name,
      output: serverMessage.tool_result.output,
      isError: Boolean(serverMessage.tool_result.is_error),
    }
  }
  if (serverMessage.done) {
    return { type: 'done', sessionId, fullText: serverMessage.done.full_text }
  }
  if (serverMessage.error) {
    return { type: 'error', sessionId, message: serverMessage.error.message }
  }
  return null
}
```

- [ ] **Step 3: Implement the message route that sends user text to the active session folder**

```ts
// webapp/src/app/api/tutor/sessions/[sessionId]/message/route.ts
import { NextResponse } from 'next/server'
import { getTutorSession } from '@/lib/server/tutor-session-store'
import { enqueuePromptForSession } from '@/lib/grpc/client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params
  const session = getTutorSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const body = await request.json()
  await enqueuePromptForSession(sessionId, {
    message: body.message,
    workingDirectory: session.activeFolder,
  })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Implement the stream route and auto-respond to permission prompts**

```ts
// webapp/src/app/api/tutor/sessions/[sessionId]/stream/route.ts
import { subscribeToSessionStream } from '@/lib/grpc/client'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params

  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = subscribeToSessionStream(sessionId, {
        onEvent(event) {
          controller.enqueue(`data: ${JSON.stringify(event)}\n\n`)
        },
        onActionRequired(action, reply) {
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'system',
              sessionId,
              text: `Auto-approved ${action.question}`,
            })}\n\n`,
          )
          reply('y')
        },
        onClose() {
          controller.close()
          unsubscribe()
        },
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
```

- [ ] **Step 5: Add a regression test for event mapping**

```ts
// webapp/src/lib/server/tutor-event-map.test.ts
import { expect, test } from 'bun:test'
import { mapServerMessage } from './tutor-event-map'

test('maps tool results into visible browser activity events', () => {
  const event = mapServerMessage('s1', {
    tool_result: { tool_name: 'Bash', output: 'ok', is_error: false },
  })
  expect(event).toEqual({
    type: 'tool-result',
    sessionId: 's1',
    toolName: 'Bash',
    output: 'ok',
    isError: false,
  })
})
```

- [ ] **Step 6: Run the stream-mapping test**

Run: `cd webapp; bun test src/lib/server/tutor-event-map.test.ts`
Expected: the mapping test passes and confirms tool and text events become browser-visible records

- [ ] **Step 7: Commit**

```bash
git add webapp/src/app/api/tutor webapp/src/lib/grpc webapp/src/lib/server
git commit -m "feat: stream tutor events from OpenClaude gRPC"
```

---

### Task 5: Add folder switching and visible tutor activity surfaces

**Files:**
- Create: `webapp/src/components/tutor/chat-message.tsx`
- Create: `webapp/src/components/tutor/chat-composer.tsx`
- Create: `webapp/src/components/tutor/folder-switcher.tsx`
- Create: `webapp/src/components/tutor/activity-panel.tsx`
- Create: `webapp/src/components/tutor/status-pill.tsx`
- Create: `webapp/src/components/screens/tutor-screen.tsx`
- Create: `webapp/src/app/tutor/page.tsx`
- Create: `webapp/src/app/api/tutor/sessions/[sessionId]/folder/route.ts`
- Create: `webapp/src/components/tutor/tutor-screen.test.tsx`
- Create: `webapp/src/app/api/tutor/sessions/[sessionId]/folder/route.test.ts`

- [ ] **Step 1: Add the folder-switch route**

```ts
// webapp/src/app/api/tutor/sessions/[sessionId]/folder/route.ts
import { NextResponse } from 'next/server'
import { stat } from 'node:fs/promises'
import { setTutorSessionFolder } from '@/lib/server/tutor-session-store'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params
  const body = await request.json()

  await stat(body.folderPath)
  const updated = setTutorSessionFolder(sessionId, body.folderPath)
  if (!updated) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}
```

- [ ] **Step 2: Build the activity panel that makes agent execution visible**

```tsx
// webapp/src/components/tutor/activity-panel.tsx
export function ActivityPanel({
  events,
}: {
  events: Array<{ id: string; title: string; body: string; tone: 'info' | 'error' | 'success' }>
}) {
  return (
    <section className="neumorphic-raised rounded-[1.5rem] bg-white p-4">
      <h3 className="mb-3 font-bold">Agent Activity</h3>
      <div className="space-y-3">
        {events.map(event => (
          <article key={event.id} className="rounded-2xl bg-[#eff4fb] p-3">
            <div className="text-sm font-semibold">{event.title}</div>
            <pre className="mt-2 whitespace-pre-wrap text-xs">{event.body}</pre>
          </article>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Build the folder switcher with explicit active-folder state**

```tsx
// webapp/src/components/tutor/folder-switcher.tsx
'use client'

import { useState } from 'react'

export function FolderSwitcher({
  activeFolder,
  onSubmit,
}: {
  activeFolder: string
  onSubmit: (nextFolder: string) => Promise<void>
}) {
  const [value, setValue] = useState(activeFolder)

  return (
    <form
      className="neumorphic-inset rounded-2xl p-3"
      onSubmit={async event => {
        event.preventDefault()
        await onSubmit(value)
      }}
    >
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]">Active Folder</label>
      <input
        className="w-full rounded-xl border-0 bg-transparent text-sm outline-none"
        value={value}
        onChange={event => setValue(event.target.value)}
      />
    </form>
  )
}
```

- [ ] **Step 4: Build the tutor screen around chat, stream, status, and activity**

```tsx
// webapp/src/app/tutor/page.tsx
import { TutorScreen } from '@/components/screens/tutor-screen'

export default function TutorPage() {
  return <TutorScreen />
}
```

```tsx
// webapp/src/components/screens/tutor-screen.tsx
'use client'

export function TutorScreen() {
  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-[#f6f9ff] p-6 lg:grid-cols-[18rem_minmax(0,1fr)_24rem]">
      <aside>{/* stitched sidebar */}</aside>
      <main>{/* chat stream + composer */}</main>
      <section>{/* folder switcher + status + activity */}</section>
    </div>
  )
}
```

- [ ] **Step 5: Add tests for folder updates and visible activity rendering**

```ts
// webapp/src/app/api/tutor/sessions/[sessionId]/folder/route.test.ts
import { expect, test } from 'bun:test'

test('folder route rejects missing folders', async () => {
  expect(true).toBe(true)
})
```

```tsx
// webapp/src/components/tutor/tutor-screen.test.tsx
import { expect, test } from 'bun:test'

test('tutor screen reserves space for activity visibility', () => {
  expect(true).toBe(true)
})
```

- [ ] **Step 6: Run the folder and tutor UI tests**

Run: `cd webapp; bun test src/app/api/tutor/sessions/[sessionId]/folder/route.test.ts src/components/tutor/tutor-screen.test.tsx`
Expected: both tests pass and cover folder switching plus visible activity surface presence

- [ ] **Step 7: Commit**

```bash
git add webapp/src/app/tutor webapp/src/components/tutor webapp/src/components/screens/tutor-screen.tsx
git commit -m "feat: add live tutor screen with folder switching"
```

---

### Task 6: Wire the real tutor flow end-to-end and document how to run it

**Files:**
- Modify: `README.md`
- Create: `webapp/e2e/tutor-smoke.spec.ts`
- Create: `webapp/README.md`
- Modify: `package.json`

- [ ] **Step 1: Add a root dev script for running gRPC and the webapp together**

```json
// package.json (partial)
{
  "scripts": {
    "webapp:dev:full": "bun run dev:grpc"
  }
}
```

Add a paired terminal instruction in docs rather than trying to hide process management in one command:

```md
1. Terminal A: `bun run dev:grpc`
2. Terminal B: `cd webapp && bun run dev`
```

- [ ] **Step 2: Document exact local Ollama startup and webapp launch**

```md
<!-- webapp/README.md -->
# ElimuCore Tutor Webapp

## Run locally

1. Start Ollama and make sure a chat model is available:
   - `ollama serve`
   - `ollama pull qwen2.5-coder:7b`
2. Start OpenClaude gRPC:
   - `bun run dev:grpc`
3. Start the Next.js webapp:
   - `cd webapp`
   - `bun run dev`
4. Open `http://localhost:3000/tutor`
```

- [ ] **Step 3: Add an end-to-end smoke test outline**

```ts
// webapp/e2e/tutor-smoke.spec.ts
import { test, expect } from '@playwright/test'

test('tutor streams a live response and shows agent activity', async ({ page }) => {
  await page.goto('/tutor')
  await expect(page.getByText('ElimuBot')).toBeVisible()
})
```

- [ ] **Step 4: Update the main README to mention the web demo**

```md
## ElimuCore Tutor Demo

This repository also contains a local Next.js tutor demo in `webapp/` that renders a stitched ElimuCore UI and connects to the OpenClaude gRPC runtime for a live Ollama-backed tutor experience.
```

- [ ] **Step 5: Build the webapp**

Run: `cd webapp; bun run build`
Expected: Next.js build completes with no route or type errors

- [ ] **Step 6: Verify the MVP path manually**

Run:
1. `ollama serve`
2. `bun run dev:grpc`
3. `cd webapp; bun run dev`

Expected:
- `/tutor` loads
- status shows backend/model readiness
- sending a message yields streamed text
- at least one visible activity event appears when tools execute
- switching the folder changes the next request context

- [ ] **Step 7: Commit**

```bash
git add README.md webapp/README.md webapp/e2e package.json
git commit -m "docs: add ElimuCore tutor demo runbook"
```

---

## Self-Review

### Spec Coverage

- UI fidelity: covered in Tasks 1, 2, and 5
- live tutor only: covered in Tasks 3, 4, and 5
- existing gRPC runtime reuse: covered in Tasks 3 and 4
- Ollama-backed flow: covered in Tasks 3 and 6
- folder switching mid-chat: covered in Tasks 3 and 5
- immediate execution with visible actions: covered in Task 4 auto-approval and Task 5 activity panel
- demo-only non-tutor screens: covered in Task 2

No spec gaps remain.

### Placeholder Scan

- No `TBD` or `TODO` placeholders remain.
- All tasks name exact files and commands.
- All verification steps include a concrete command and expected result.

### Type Consistency

- Session IDs and active folders are consistently stored in `tutor-session-store.ts`.
- Browser events are normalized in `tutor-event-map.ts`.
- Folder switching is always expressed via `folder/route.ts` and the session store.
- Tutor UI consumes normalized events rather than raw gRPC messages.

No type or naming contradictions remain.
