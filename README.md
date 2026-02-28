
# Autonode — AI IoT Dead Zone Solver

> Industrial IoT mesh network monitoring with autonomous AI agents built on Jac / Jaseci

![Autonode Dashboard](https://img.shields.io/badge/status-live-22c55e?style=flat-square) ![Jac](https://img.shields.io/badge/backend-Jac%200.11.2-38bdf8?style=flat-square) ![React](https://img.shields.io/badge/frontend-React-61dafb?style=flat-square)

---

## What It Does

Autonode is a real-time IoT sensor monitoring platform that uses **autonomous AI agents** to detect, diagnose, and respond to sensor failures in an industrial warehouse — automatically, without human intervention.

When a sensor goes dark, a pipeline of 5 specialized agents fires:

| Agent | Role |
|---|---|
| **PulseAgent** | Continuously scans all sensors for missed pings |
| **DeadzoneAgent** | Maps the geographic spread of signal loss |
| **CauseAgent** | Diagnoses the failure (battery, obstruction, overload) |
| **Rerout Agent** | Attempts automatic mesh rerouting for self-healing |
| **DispatchAgent** | Generates a work order if hardware intervention is needed |

---

## Architecture

```
┌─────────────────────────────────┐
│   React Frontend (localhost:3000)│
│   Live SVG warehouse map         │
│   Real-time agent feed           │
│   Work order display             │
└────────────┬────────────────────┘
             │ HTTP (REST)
┌────────────▼────────────────────┐
│   Jac Backend (localhost:8000)  │
│   jac start server.jac          │
│                                  │
│   Graph: Warehouse               │
│     └── Zone (x4)               │
│           └── Router (x4)       │
│                 └── Sensor (x24)│
└─────────────────────────────────┘
```

The backend is built entirely in **Jac** — a graph-native AI programming language. The warehouse is modeled as a persistent node graph, and each agent is a walker that traverses the graph to detect and respond to anomalies.

---

## Tech Stack

- **Backend**: [Jac 0.11.2](https://docs.jaseci.org) / Jaseci stack
- **Frontend**: React 19, SVG-based live map
- **API**: Auto-generated REST endpoints via `jac start`
- **Sensor Graph**: 24 sensors, 4 routers, 4 zones

---

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- local Python virtual environment (`venv`)

### Backend

```bash
cd backend
python3 -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

python -m pip install -U pip
python -m pip install -r requirements.txt
jac start server.jac
```

Server runs at `http://localhost:8000`  

If `jac start` is unavailable on your local CLI version, use:

```bash
jac serve server.jac -ho 0.0.0.0 -p 8000
```

### Frontend

```bash
cd ..   # back to project root
npm install
npm start
```

App runs at `http://localhost:3000`

---

## API Endpoints

Most endpoints are `POST` with a JSON body.

| Endpoint | Description |
|---|---|
| `/walker/api_setup` | Initialize the warehouse graph |
| `/walker/api_state` | Get full graph state (sensors, routers, zones) |
| `/walker/api_heartbeat` | Run heartbeat scan |
| `/walker/api_simulate_dropout` | Simulate sensor going offline `{"sensor_id": "SEN-042"}` |
| `/walker/api_run_pipeline` | Run full 5-agent pipeline |
| `/walker/api_diagnose` | Diagnose a specific sensor `{"sensor_id": "SEN-042"}` |
| `/walker/api_reset` | Reset all sensors to online |

Useful discovery endpoints:

| Endpoint | Description |
|---|---|
| `GET /walkers` | List available walkers |
| `GET /functions` | List available functions |

---

## Demo Flow

1. Open `http://localhost:3000`
2. Confirm **● LIVE JAC** badge in the header
3. Click **▶ Simulate Dropout — SEN-042**
4. Watch the agent feed fire in real time:
   - SEN-042 turns **red** on the map
   - Root cause diagnosed with confidence score
   - Work order generated or self-heal attempted
5. Click **↺ Reset All Sensors** to restore

---

## Project Structure

```
Autonode/
├── backend/
│   ├── main.jac          # Node/edge definitions + walker agents
│   ├── server.jac        # REST API walker endpoints
│   ├── mock_data.jac     # Graph seeder (legacy)
│   ├── run.jac           # CLI demo runner
│   └── jac.toml          # Project config
├── frontend/
│   ├── src/
│   │   └── App.js        # Main React dashboard
│   └── package.json
└── README.md
```

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
---

## Progress Update (Completed So Far)

- Backend graph model is implemented for 1 warehouse, 4 zones, 4 routers, and 24 sensors.
- Core autonomous agent pipeline is implemented:
  - PulseAgent
  - DeadzoneAgent
  - CauseAgent
  - Rerout Agent
  - DispatchAgent
- Backend public API walkers are in place (`api_setup`, `api_state`, `api_ingest`, `api_heartbeat`, `api_simulate_dropout`, `api_run_pipeline`, `api_diagnose`, `api_dispatch`, `api_business_metrics`, `api_notification_health`, `api_reset`).
- Automation runtime is integrated for event history, business metrics, and work-order delivery hooks.
- React dashboard is implemented with live map rendering, controls, resets, data/metrics, agent log feed, and work-order panel.
- End-to-end demo flow is working (simulate dropout -> run pipeline -> visualize result -> reset).

### Current Status

- Complete: Jac backend + REST API + CRA frontend integration.
- Complete: Autonomous vs traditional mode simulation behavior in UI.
- In progress / next: Jac-native frontend migration (`frontend_jac`) as outlined in `JAC_FRONTEND_MIGRATION_OUTLINE.md`.

## Run Commands (Frontend + Backend)

Run these from the project root using two terminals.

### Terminal 1: Backend (Jac API)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
python -m pip install -r requirements.txt
jac start server.jac
```

Backend URL: `http://localhost:8000`  

### Terminal 2: Frontend (React)

```bash
cd frontend
npm install
npm start
```

Frontend URL: `http://localhost:3000`
