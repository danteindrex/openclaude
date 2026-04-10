# ElimuCore Next.js Tutor MVP Design

## Summary

Build a single-user local Next.js web app inside this repository that reproduces the stitched `UI folder` screens as closely as possible, while making only the `AI Tutor / ElimuBot` experience fully functional.

The live tutor must use the existing OpenClaude runtime rather than reimplementing agent orchestration. The web app will bridge to OpenClaude's existing gRPC service for streaming chat, tool execution events, and session control. Ollama remains the model backend through OpenClaude's existing provider path.

All non-tutor product surfaces are presentation/demo shells backed by local mock data.

## Goals

- Recreate the stitched ElimuCore UI in a Next.js application with high visual fidelity.
- Make the `ai_tutor_elimubot` screen fully functional as a real AI product surface.
- Use the existing OpenClaude engine and gRPC interface as the real backend runtime.
- Support real streaming chat, file awareness, terminal/tool execution, and visible activity output.
- Allow switching the active working folder mid-chat.
- Keep the MVP local-only and single-user.

## Non-Goals

- Production multi-user auth or tenant model.
- Real LMS backend, course progress backend, or persistent learner data platform.
- Full parity for every CLI command and every advanced OpenClaude feature in the first release.
- Browser-direct gRPC or browser-direct Ollama access.
- Silent or hidden background execution; all AI actions must be visible to the user.

## Source Material

The stitched UI source of truth lives in:

- `UI folder/stitch/welcome_to_elimucore/code.html`
- `UI folder/stitch/select_your_role/code.html`
- `UI folder/stitch/local_login/code.html`
- `UI folder/stitch/student_dashboard/code.html`
- `UI folder/stitch/course_catalog/code.html`
- `UI folder/stitch/ai_tutor_elimubot/code.html`
- `UI folder/stitch/elimucore_soft_edge/DESIGN.md`

The runtime backend source of truth lives in:

- `src/proto/openclaude.proto`
- `scripts/start-grpc.ts`
- `scripts/grpc-cli.ts`

## Product Scope

### Real Feature Surface

Only the tutor experience is fully functional in the MVP:

- chat input and response streaming
- session-scoped message history
- visible tool and terminal activity
- file-aware agent behavior
- terminal/tool execution through the existing OpenClaude runtime
- explicit current-folder state
- folder switching mid-chat
- Ollama-backed model responses through current OpenClaude provider configuration

### Demo Feature Surface

The following screens remain visually real but operationally mocked:

- welcome screen
- role selection
- login
- student dashboard
- course catalog
- study/progress cards and lesson content outside the tutor

These screens should feel product-quality, but their data can be static/local mock data for demo purposes.

## Architecture

### Recommended Approach

Use a thin web shell over the existing OpenClaude gRPC service.

Architecture layers:

1. **Next.js frontend**
   - renders the stitched ElimuCore screens
   - owns navigation, local UI state, chat presentation, and activity panels

2. **Next.js server-side bridge**
   - exposes browser-safe HTTP/SSE/WebSocket endpoints
   - manages tutor sessions for the browser
   - connects to OpenClaude's gRPC service
   - adapts gRPC stream events into UI-friendly events

3. **OpenClaude gRPC runtime**
   - real agent execution engine
   - sends streaming text, tool start/result events, and completion/error events

4. **OpenClaude provider layer**
   - real Ollama connectivity through the existing OpenAI-compatible local-provider path

### Why This Approach

- reuses existing agent logic instead of duplicating it in Next.js
- preserves real OpenClaude behavior
- aligns well with the existing `openclaude.proto` event model
- reduces MVP risk while still producing a real web product

## UI Structure

### Screen Set

The Next.js app should reproduce the stitched screen sequence:

1. `welcome_to_elimucore`
2. `select_your_role`
3. `local_login`
4. `student_dashboard`
5. `course_catalog`
6. `ai_tutor_elimubot`

### Tutor Screen

The `ai_tutor_elimubot` screen is the primary product surface and should remain visually faithful to the stitched source:

- left navigation sidebar
- top status bar
- central chat area
- bottom prompt composer

Minimal functional adaptation is allowed only where required to make the tutor operational:

- add a visible active-folder section
- add a visible activity/timeline surface for tool and command execution
- add status surfaces for backend/Ollama readiness

These additions must follow the same neumorphic, editorial visual language from `DESIGN.md`.

## Styling Rules

Follow the stitched visual system closely:

- tactile neumorphism
- soft tonal layering
- editorial typography hierarchy
- no generic default SaaS redesign
- preserve the ElimuCore / ElimuBot screen identity

Implementation expectations:

- encode the design tokens into the Next.js app
- preserve spacing rhythm, major layout proportions, and component silhouette
- do not replace the stitched layouts with a generic chat app pattern

## Runtime Behavior

### Chat Flow

1. User enters the tutor screen.
2. Frontend creates or resumes a local tutor session.
3. User sends a prompt.
4. Backend forwards the prompt and current working folder to the OpenClaude gRPC runtime.
5. Runtime responds with streamed text and tool events.
6. Frontend renders:
   - streaming assistant content
   - tool start/result events
   - command output summaries
   - file operation visibility
   - final response state

### Folder Switching

The user must be able to switch folders during an active conversation.

Requirements:

- current folder always visible
- folder changes are explicit user actions
- folder switch is logged into the visible activity timeline
- subsequent prompts execute against the new folder
- failures preserve the previous folder binding and are shown clearly

### Execution Model

Sensitive actions are **not approval-gated** in the MVP.

Instead:

- actions execute immediately
- the UI must expose them live and transparently
- command/file/tool activity must be inspectable by the user

This is a visibility model, not an approval model.

## Backend Bridge Requirements

The browser-facing bridge should provide:

- session creation/resume
- message send endpoint
- streaming event endpoint for responses
- event normalization from gRPC into browser-friendly payloads
- active-folder update endpoint
- Ollama/OpenClaude readiness status endpoint

The bridge is allowed to reshape gRPC messages, but must not change the underlying execution semantics.

## Session Model

The MVP is single-user local-only.

Session requirements:

- local session list for tutor chats
- local message history per session
- in-memory first implementation is acceptable
- lightweight local persistence is optional if it stays simple

Avoid adding a database unless needed to make the MVP viable.

## Error Handling

The tutor UI must visibly distinguish these cases:

- Ollama unavailable
- OpenClaude gRPC backend unavailable
- stream interrupted
- command/tool failed
- invalid or inaccessible folder
- session initialization failure

Error rendering rules:

- never silently swallow backend failures
- show user-readable failure state in the tutor UI
- preserve enough operational detail for demo transparency

## Testing Strategy

### UI Tests

- route/screen rendering checks for major stitched pages
- tutor UI component tests for message rendering and activity rendering

### Bridge Tests

- gRPC event to browser event transformation
- streaming lifecycle handling
- session creation and message dispatch
- folder switch state changes

### Runtime/Integration Tests

- status handling for Ollama ready/unavailable
- status handling for gRPC ready/unavailable
- smoke flow for tutor session creation and streamed response

### MVP End-to-End Proof

Minimum verified flow:

1. app starts locally
2. tutor screen loads
3. Ollama-backed chat returns a response
4. tool/terminal activity is visible in the UI
5. folder can be switched mid-chat
6. subsequent prompt runs in the new folder

## Decomposition

This MVP should be implemented as one coherent sub-project with four bounded work areas:

1. **Next.js app scaffold and stitched UI recreation**
2. **Tutor session bridge to OpenClaude gRPC**
3. **Tutor operational UI surfaces**
4. **Mock-data shell for non-tutor pages**

These are tightly related enough to remain in one spec and one implementation plan, but they should become separate task groups in the implementation plan.

## Risks

- The stitched HTML may not map cleanly into reusable React components without careful extraction.
- Browser-safe streaming may require a custom translation layer from gRPC to SSE/WebSocket.
- Folder switching semantics must remain explicit and reliable to avoid user confusion.
- OpenClaude tool activity may be more granular than the stitched UI originally anticipated; the UI must summarize without hiding.

## Design Decisions Locked

- Next.js app inside this repository
- strict visual fidelity to stitched UI
- only tutor flow is fully real
- OpenClaude gRPC is the real backend
- Ollama is the model backend through existing OpenClaude integration
- single-user local-only MVP
- folder switching mid-chat is supported
- actions execute immediately and are visible instead of approval-gated

## Open Questions

None blocking for implementation planning. Remaining choices are implementation details, not product-definition blockers.
