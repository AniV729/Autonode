
# SentinelMesh — AI Dead Zone Hunter

> Industrial IoT mesh network monitoring with autonomous AI agents built on Jac / Jaseci

![Autonode Dashboard](https://img.shields.io/badge/status-live-22c55e?style=flat-square) ![Jac](https://img.shields.io/badge/backend-Jac%200.11.2-38bdf8?style=flat-square) ![Frontend](https://img.shields.io/badge/frontend-Vanilla%20JS-f7df1e?style=flat-square)

---

## What It Does

SentinelMesh is a real-time IoT sensor monitoring platform that uses **autonomous AI agents** to detect, diagnose, and respond to sensor failures in an industrial warehouse — automatically, without human intervention.

When a sensor goes dark, a pipeline of 5 specialized agents fires:

| Agent | Role |
|---|---|
| **HeartbeatMonitor** | Continuously scans all sensors for missed pings |
| **DeadZoneMapper** | Maps the geographic spread of signal loss |
| **RootCauseAnalyzer** | Diagnoses the failure (battery, obstruction, overload) |
| **ReroutingAgent** | Attempts automatic mesh rerouting for self-healing |
| **DispatchAgent** | Generates a work order if hardware intervention is needed |

---

## Quick Start (One Command)

### Prerequisites

- Python 3.11+
- `jaclang` with `jac-cloud` installed

```bash
pip install jaclang jac-cloud
```

> **Windows users**: set the environment variable `PYTHONUTF8=1` to avoid encoding issues.
> ```powershell
> [System.Environment]::SetEnvironmentVariable("PYTHONUTF8", "1", "User")
> ```

### Run

```bash
jac start server.jac -n
```

That's it. Open **http://localhost:8000/static/index.html** in your browser.

- Backend API auto-starts on port 8000
- Frontend is served from `assets/` as static files
- Swagger docs available at `http://localhost:8000/docs`

---

## Architecture

```
┌──────────────────────────────────┐
│  Frontend (served at /static/)   │
│  Live SVG warehouse map          │
│  Real-time agent feed            │
│  Work order display              │
│  Vanilla JS + CSS (no build)     │
└────────────┬─────────────────────┘
             │ HTTP (REST) — same origin
┌────────────▼─────────────────────┐
│  Jac Backend (localhost:8000)    │
│  jac start server.jac -n        │
│                                  │
│  Graph: Warehouse                │
│    └── Zone (x4)                 │
│          └── Router (x4)         │
│                └── Sensor (x24)  │
└──────────────────────────────────┘
```

The backend is built entirely in **Jac** — a graph-native AI programming language. The warehouse is modeled as a persistent node graph, and each agent is a walker that traverses the graph to detect and respond to anomalies. The frontend is served as static files by the same Jac server — no separate process needed.

---

## Two Simulation Modes

### 1. Self-Heal (default)

Simulates a **signal obstruction** on SEN-042. The agents detect the dropout, diagnose `PHYSICAL_OBSTRUCTION`, and **automatically reroute** the sensor through an alternate router. No human intervention needed.

**Flow**: HeartbeatMonitor → DeadZoneMapper → RootCauseAnalyzer → ReroutingAgent → Self-heal success ✓

### 2. Dispatch

Simulates a **dead battery** on SEN-042. The agents detect the dropout, diagnose `BATTERY_DEAD`, determine that mesh rerouting cannot fix a hardware failure, and **generate a work order** for the maintenance team.

**Flow**: HeartbeatMonitor → DeadZoneMapper → RootCauseAnalyzer → ReroutingAgent (skip) → DispatchAgent → Work order issued 🔧

Toggle between modes using the **Self-Heal / Dispatch** buttons in the sidebar.

---

## API Endpoints

All endpoints are `POST` with a JSON body.

| Endpoint | Description |
|---|---|
| `/walker/api_setup` | Initialize the warehouse graph |
| `/walker/api_state` | Get full graph state (sensors, routers, zones) |
| `/walker/api_heartbeat` | Run heartbeat scan, returns alerts |
| `/walker/api_simulate_dropout` | Simulate signal dropout `{"sensor_id": "SEN-042"}` |
| `/walker/api_simulate_battery_dead` | Simulate dead battery `{"sensor_id": "SEN-042"}` |
| `/walker/api_run_pipeline` | Run full 5-agent diagnostic pipeline |
| `/walker/api_diagnose` | Diagnose a specific sensor `{"sensor_id": "SEN-042"}` |
| `/walker/api_dispatch` | Generate work order `{"sensor_id": "SEN-042"}` |
| `/walker/api_reset` | Reset all sensors to online |

---

## Demo Flow

1. Run `jac start server.jac -n`
2. Open **http://localhost:8000/static/index.html**
3. Confirm the **● LIVE JAC** badge in the header
4. Select **Self-Heal** or **Dispatch** mode
5. Click the simulation button
6. Watch the agent feed fire in real time:
   - SEN-042 turns **red** on the map
   - Root cause diagnosed with confidence score
   - **Self-Heal**: sensor rerouted, turns **yellow** (degraded)
   - **Dispatch**: work order card appears with urgency and action
7. Click **↺ Reset All Sensors** to restore

---

## Project Structure

```
SentinelMesh/
├── server.jac            # REST API walker endpoints (:pub walkers)
├── main.jac              # Node/edge definitions + walker agents
├── mock_data.jac         # Graph seeder data
├── run.jac               # CLI demo runner
├── jac.toml              # Project config (entry point, port)
├── assets/               # Frontend (served at /static/)
│   ├── index.html        # Main HTML shell
│   ├── app.js            # Frontend logic (vanilla JS)
│   └── styles.css        # Styles
├── backend/              # Duplicate from autonode1 branch
│   ├── server.jac
│   ├── main.jac
│   └── assets/
└── README.md
```

---

## Tech Stack

- **Backend**: [Jac 0.11.2](https://docs.jaseci.org) / Jaseci stack (jaclang + jac-cloud)
- **Frontend**: Vanilla JS, CSS, served as static files (no build step)
- **API**: Auto-generated REST endpoints via `jac start`
- **Sensor Graph**: 24 sensors, 4 routers, 4 zones, 1 warehouse

---

## Why Jac?

Jac's **object-spatial programming** model is a natural fit for IoT mesh networks:

- The warehouse **is** a graph — sensors, routers, and zones are nodes
- Agents **are** walkers — they traverse the graph to find and fix problems
- The graph **persists** across API calls — state lives in the graph, not a database
- Walkers automatically become **REST endpoints** via `jac start`

This means the entire backend — data model, business logic, and API — is expressed in one language with zero boilerplate.

---

## Team

Built for the Jaseci Hackathon 2026.