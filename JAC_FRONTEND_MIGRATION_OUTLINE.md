# Jac Frontend Migration Outline (Full Feature Parity)

## Goal
- Rebuild the current React UI in Jac (`cl` frontend) so all existing behavior works in Jaseci/Jac.
- Keep backend walkers/endpoints as source of truth.
- Do not ship until feature parity tests pass.

## Target Architecture
- Single Jac-first app boundary:
  - `backend/main.jac`: graph + core walkers (already present)
  - `backend/server.jac`: API walkers (already present)
  - `frontend_jac/app.jac`: Jac `cl` UI (new)
- UI talks to backend walkers through Jac/HTTP calls only.
- Existing CRA frontend becomes fallback until parity is complete.

## Phase 1: Jac UI Shell
- Create `frontend_jac/app.jac` with:
  - App layout (header, map area, right sidebar)
  - Tab row: `Controls`, `Resets`, `Data`, `Agents`, `Work`
  - Base state: sensors, routers, logs, work orders, selected sensor, mode, running, auto-monitor
- Implement API client helpers for:
  - `api_setup`
  - `api_state`
  - `api_reset`
  - `api_ingest`
  - `api_simulate_dropout`
  - `api_run_pipeline`
  - `api_business_metrics`

## Phase 2: Map + Telemetry View
- Render warehouse zones, routers, and sensors from API state.
- Render router-sensor link lines with status styling.
- Support sensor click selection + sensor details panel.
- Keep current coordinate model and zone colors.

## Phase 3: Controls Tab Parity
- Mode toggle: `Traditional` / `Autonomous`.
- Replay same failure action.
- Manual failure buttons by failure type.
- Single-run lock (`running`) to prevent concurrent actions.
- Active action visual state (clicked action is darker).

## Phase 4: Resets Tab Parity
- `Pause/Resume Auto Monitor` action.
- Pulsing status indicator:
  - Green when running
  - Red when paused
- Reset buttons:
  - Reset sensors
  - Reset sensors + metrics

## Phase 5: Data Tab Parity
- KPI cards:
  - Auto-healed %
  - Dispatch reduced %
  - Avg detection time
  - Avg resolution time
  - Estimated $ saved
- Null/empty defaults (`--`) before incidents.
- Annual savings sentence logic.
- MQTT/API example block.
- Selected sensor detail block inside Data tab.

## Phase 6: Agents + Work Tabs Parity
- Agents tab:
  - Live agent log feed
  - Timestamp, agent badge, type color, reason/confidence display
  - Auto-scroll to newest log entry
- Work tab:
  - Work order cards
  - ID, urgency, location, cause, action
  - Empty-state text when none

## Phase 7: Automation + Backend Integration
- Auto-monitor loop support in Jac UI with configurable interval.
- Ensure all failure flows still call backend walkers where required.
- Keep auth-compatible request behavior.
- Keep business metrics sourced from backend or computed identically (pick one strategy and standardize).

## Phase 8: Decommission/Cutover
- Add route/launch switch for Jac UI as primary frontend.
- Keep CRA UI behind a feature flag until full QA pass.
- Remove CRA only after sign-off.

## Feature Parity Checklist (Must Pass)
- Header branding and status pills match expected behavior.
- Map renders all zones/routers/sensors and updates after actions.
- Node selection shows correct sensor details.
- Controls actions execute correct failure profiles.
- Only one action can run at a time.
- Active clicked control is visually distinct.
- Auto-monitor indicator and toggle behave correctly.
- Logs show decision chain with confidence/reason fields.
- Work orders appear when dispatch path is used.
- Data tab metrics start null and update after incidents.
- Tab row is single-line and non-wrapping.
- Right panel uses full height for active tab content.
- Maintenance Bay coordinate offsets preserved.

## Validation Plan
- Jac compile checks:
  - `jac check backend/main.jac backend/server.jac frontend_jac/app.jac`
- Backend checks:
  - `jac check backend/main.jac backend/server.jac`
- End-to-end manual script:
  1. Start app
  2. Initialize graph
  3. Run each control action once
  4. Verify logs/work/data updates
  5. Toggle auto-monitor
  6. Reset flows
- Acceptance gate:
  - 100% checklist pass, no regressions from current behavior.

## Nice-to-Have After Parity
- Remove duplicated metric math by sourcing from backend only.
- Add typed shared schema for UI/backend payloads.
- Add snapshot tests for key UI states in Jac frontend.
