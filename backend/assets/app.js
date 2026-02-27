const TYPE_ICONS = { temp: "🌡", vibration: "📳", gas: "💨", asset: "📦" };
const STATUS_COLOR = {
  online: { dot: "#22c55e", glow: "0 0 8px #22c55e88" },
  degraded: { dot: "#f59e0b", glow: "0 0 8px #f59e0b88" },
  offline: { dot: "#ef4444", glow: "0 0 12px #ef444499" },
};
const ZONES = [
  { name: "Cold Storage", x: 20, y: 50, w: 300, h: 350, color: "#0ea5e9" },
  { name: "Assembly Floor", x: 370, y: 50, w: 290, h: 300, color: "#f59e0b" },
  { name: "Loading Bay", x: 670, y: 50, w: 210, h: 300, color: "#8b5cf6" },
  { name: "Maintenance Bay", x: 370, y: 360, w: 390, h: 240, color: "#10b981" },
];

const INITIAL_SENSORS = [
  { id: "SEN-001", type: "temp", zone: "Cold Storage", router: "RTR-001", x: 100, y: 130, status: "online", rssi: -52, battery: 91 },
  { id: "SEN-002", type: "temp", zone: "Cold Storage", router: "RTR-001", x: 200, y: 100, status: "online", rssi: -58, battery: 84 },
  { id: "SEN-003", type: "gas", zone: "Cold Storage", router: "RTR-001", x: 155, y: 200, status: "online", rssi: -61, battery: 77 },
  { id: "SEN-004", type: "vibration", zone: "Cold Storage", router: "RTR-001", x: 65, y: 240, status: "online", rssi: -55, battery: 88 },
  { id: "SEN-005", type: "asset", zone: "Cold Storage", router: "RTR-001", x: 240, y: 160, status: "online", rssi: -49, battery: 95 },
  { id: "SEN-006", type: "temp", zone: "Assembly Floor", router: "RTR-002", x: 420, y: 90, status: "online", rssi: -60, battery: 72 },
  { id: "SEN-007", type: "vibration", zone: "Assembly Floor", router: "RTR-002", x: 510, y: 140, status: "online", rssi: -63, battery: 68 },
  { id: "SEN-008", type: "vibration", zone: "Assembly Floor", router: "RTR-002", x: 590, y: 80, status: "online", rssi: -57, battery: 81 },
  { id: "SEN-009", type: "gas", zone: "Assembly Floor", router: "RTR-002", x: 455, y: 210, status: "online", rssi: -54, battery: 90 },
  { id: "SEN-010", type: "temp", zone: "Assembly Floor", router: "RTR-002", x: 555, y: 230, status: "online", rssi: -66, battery: 63 },
  { id: "SEN-011", type: "asset", zone: "Assembly Floor", router: "RTR-002", x: 400, y: 270, status: "online", rssi: -59, battery: 75 },
  { id: "SEN-042", type: "temp", zone: "Cold Storage", router: "RTR-001", x: 130, y: 320, status: "online", rssi: -55, battery: 87 },
  { id: "SEN-013", type: "gas", zone: "Loading Bay", router: "RTR-003", x: 700, y: 150, status: "online", rssi: -62, battery: 79 },
  { id: "SEN-014", type: "asset", zone: "Loading Bay", router: "RTR-003", x: 780, y: 100, status: "online", rssi: -58, battery: 86 },
  { id: "SEN-015", type: "temp", zone: "Loading Bay", router: "RTR-003", x: 740, y: 230, status: "online", rssi: -70, battery: 55 },
  { id: "SEN-016", type: "vibration", zone: "Loading Bay", router: "RTR-003", x: 840, y: 180, status: "online", rssi: -65, battery: 71 },
  { id: "SEN-017", type: "gas", zone: "Maintenance Bay", router: "RTR-004", x: 430, y: 450, status: "online", rssi: -53, battery: 93 },
  { id: "SEN-018", type: "vibration", zone: "Maintenance Bay", router: "RTR-004", x: 520, y: 400, status: "online", rssi: -60, battery: 80 },
  { id: "SEN-019", type: "temp", zone: "Maintenance Bay", router: "RTR-004", x: 610, y: 490, status: "online", rssi: -56, battery: 88 },
  { id: "SEN-020", type: "asset", zone: "Maintenance Bay", router: "RTR-004", x: 700, y: 450, status: "online", rssi: -67, battery: 64 },
  { id: "SEN-021", type: "temp", zone: "Maintenance Bay", router: "RTR-004", x: 470, y: 540, status: "online", rssi: -61, battery: 76 },
  { id: "SEN-022", type: "gas", zone: "Cold Storage", router: "RTR-001", x: 220, y: 300, status: "online", rssi: -54, battery: 89 },
  { id: "SEN-023", type: "asset", zone: "Assembly Floor", router: "RTR-002", x: 630, y: 170, status: "online", rssi: -58, battery: 82 },
  { id: "SEN-024", type: "vibration", zone: "Loading Bay", router: "RTR-003", x: 800, y: 270, status: "online", rssi: -63, battery: 70 },
];

const ROUTERS_FALLBACK = [
  { id: "RTR-001", zone: "Cold Storage", x: 160, y: 230, load: 32 },
  { id: "RTR-002", zone: "Assembly Floor", x: 510, y: 175, load: 68 },
  { id: "RTR-003", zone: "Loading Bay", x: 760, y: 185, load: 41 },
  { id: "RTR-004", zone: "Maintenance Bay", x: 565, y: 465, load: 28 },
];

const state = {
  sensors: INITIAL_SENSORS.map((s) => ({ ...s })),
  routers: ROUTERS_FALLBACK.map((r) => ({ ...r })),
  selectedId: null,
  log: [],
  freshLogKey: null,
  workOrders: [],
  running: false,
  backendStatus: "connecting",
  backendReady: false,
  pollInterval: null,
  timers: [],
};

const els = {
  badge: document.getElementById("backend-badge"),
  onlineCount: document.getElementById("online-count"),
  degradedCount: document.getElementById("degraded-count"),
  offlineCount: document.getElementById("offline-count"),
  mapArea: document.getElementById("map-area"),
  simBtn: document.getElementById("sim-btn"),
  resetBtn: document.getElementById("reset-btn"),
  logBox: document.getElementById("log-box"),
  workOrdersWrap: document.getElementById("work-orders-wrap"),
  workOrdersTitle: document.getElementById("work-orders-title"),
  workOrders: document.getElementById("work-orders"),
  sensorDetail: document.getElementById("sensor-detail"),
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function esc(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function apiPost(endpoint, body = {}) {
  const res = await fetch(`/walker/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.reports && data.reports.length > 0) {
    return data.reports[0];
  }
  return data;
}

function getSelectedSensor() {
  return state.sensors.find((s) => s.id === state.selectedId) || null;
}

function setSensorPatch(sensorId, patch) {
  state.sensors = state.sensors.map((s) => (s.id === sensorId ? { ...s, ...patch } : s));
}

function addLog(agent, msg, type = "info") {
  const entry = {
    key: `${agent}:${msg}:${Date.now()}`,
    agent,
    msg,
    type,
    ts: Date.now(),
  };
  state.log.push(entry);
  state.freshLogKey = entry.key;
  render();
}

function clearPendingTimers() {
  for (const id of state.timers) {
    clearTimeout(id);
  }
  state.timers = [];
}

function getAgentColor(agent) {
  if (agent === "HeartbeatMonitor") return "#0ea5e9";
  if (agent === "DeadZoneMapper") return "#8b5cf6";
  if (agent === "RootCauseAnalyzer") return "#f59e0b";
  if (agent === "ReroutingAgent") return "#10b981";
  if (agent === "DispatchAgent") return "#ef4444";
  return "#ffffff";
}

function statusCounts() {
  const online = state.sensors.filter((s) => s.status === "online").length;
  const degraded = state.sensors.filter((s) => s.status === "degraded").length;
  const offline = state.sensors.filter((s) => s.status === "offline").length;
  return { online, degraded, offline };
}

function renderBadge() {
  let text = "⟳ CONNECTING";
  let cls = "badge connecting";

  if (state.backendStatus === "live") {
    text = "● LIVE JAC";
    cls = "badge live";
  } else if (state.backendStatus === "demo") {
    text = "◌ DEMO";
    cls = "badge demo";
  }

  els.badge.className = cls;
  els.badge.textContent = text;
}

function renderHeaderCounts() {
  const counts = statusCounts();
  els.onlineCount.textContent = String(counts.online);
  els.degradedCount.textContent = String(counts.degraded);
  els.offlineCount.textContent = String(counts.offline);
}

function routerLoadColor(load) {
  if (load > 70) return "#ef4444";
  if (load > 50) return "#f59e0b";
  return "#22c55e";
}

function renderMap() {
  const zoneMarkup = ZONES.map((z) => {
    return `<g>
      <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="6" fill="${z.color}08" stroke="${z.color}44" stroke-width="1.5" stroke-dasharray="6,3"></rect>
      <text x="${z.x + 10}" y="${z.y + 22}" font-size="11" fill="${z.color}" opacity="0.8" font-family="monospace" font-weight="700" letter-spacing="0.08em">${esc(z.name.toUpperCase())}</text>
    </g>`;
  }).join("");

  const links = state.sensors.map((sensor) => {
    const router = state.routers.find((r) => r.id === sensor.router);
    if (!router) return "";
    const sc = STATUS_COLOR[sensor.status] || STATUS_COLOR.online;
    const dash = sensor.status === "offline" ? "4,4" : "none";
    const opacity = sensor.status === "online" ? 0.25 : 0.6;
    return `<line x1="${router.x}" y1="${router.y}" x2="${sensor.x}" y2="${sensor.y}" stroke="${sc.dot}" stroke-width="1" stroke-opacity="${opacity}" stroke-dasharray="${dash}"></line>`;
  }).join("");

  const routerMarkup = state.routers.map((router) => {
    const loadColor = routerLoadColor(router.load);
    return `<g transform="translate(${router.x}, ${router.y})">
      <rect x="-22" y="-14" width="44" height="28" rx="4" fill="#1e293b" stroke="${loadColor}" stroke-width="1.5" style="filter: drop-shadow(0 0 4px ${loadColor}66)"></rect>
      <text text-anchor="middle" dominant-baseline="central" font-size="14" fill="${loadColor}" font-family="monospace" font-weight="700">📡</text>
      <text text-anchor="middle" y="22" font-size="9" fill="${loadColor}" font-family="monospace" font-weight="700">${esc(router.id)}</text>
    </g>`;
  }).join("");

  const sensorMarkup = state.sensors.map((sensor) => {
    const selected = state.selectedId === sensor.id;
    const sc = STATUS_COLOR[sensor.status] || STATUS_COLOR.online;
    const radius = selected ? 14 : 10;
    const pulse = sensor.status !== "online"
      ? `<circle r="20" fill="${sc.dot}" opacity="0.12">
          <animate attributeName="r" values="14;26;14" dur="2s" repeatCount="indefinite"></animate>
          <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2s" repeatCount="indefinite"></animate>
        </circle>`
      : "";

    return `<g class="sensor-node" data-sensor-id="${esc(sensor.id)}" transform="translate(${sensor.x}, ${sensor.y})" style="cursor:pointer;">
      ${pulse}
      <circle r="${radius}" fill="${sc.dot}" stroke="${selected ? "#fff" : "#060d1a"}" stroke-width="${selected ? 2.5 : 1.5}" style="filter: drop-shadow(${sc.glow}); transition: r 0.2s"></circle>
      <text text-anchor="middle" dominant-baseline="central" font-size="11" style="user-select:none; pointer-events:none;">${TYPE_ICONS[sensor.type] || "?"}</text>
    </g>`;
  }).join("");

  els.mapArea.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 900 620" preserveAspectRatio="xMidYMid meet">
      ${zoneMarkup}
      ${links}
      ${routerMarkup}
      ${sensorMarkup}
    </svg>
    <div class="map-legend">
      <span class="sensor-type">🌡 temp</span>
      <span class="sensor-type">📳 vibration</span>
      <span class="sensor-type">💨 gas</span>
      <span class="sensor-type">📦 asset</span>
      <span class="divider">|</span>
      <span style="color:#22c55e">● online</span>
      <span style="color:#f59e0b">● degraded</span>
      <span style="color:#ef4444">● offline</span>
    </div>
  `;
}

function renderSimulationButtons() {
  els.simBtn.disabled = state.running;
  els.simBtn.className = state.running ? "sim-btn running" : "sim-btn";
  els.simBtn.textContent = state.running ? "⏳  Agents Running..." : "▶  Simulate Dropout - SEN-042";
}

function renderLogs() {
  if (state.log.length === 0) {
    els.logBox.innerHTML = '<div class="log-empty">No events yet. Run a simulation.</div>';
    return;
  }

  const logMarkup = state.log.map((entry) => {
    const color = getAgentColor(entry.agent);
    const isFresh = entry.key === state.freshLogKey ? "fresh" : "";
    return `<div class="log-entry ${isFresh}">
      <span class="log-time">${new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      <span class="agent-badge" style="color:${color}; background:${color}18; border-color:${color}44;">${esc(entry.agent)}</span>
      <span class="log-msg ${esc(entry.type)}">${esc(entry.msg)}</span>
    </div>`;
  }).join("");

  els.logBox.innerHTML = logMarkup;
  els.logBox.scrollTop = els.logBox.scrollHeight;
}

function renderWorkOrders() {
  if (state.workOrders.length === 0) {
    els.workOrdersWrap.classList.add("hidden");
    els.workOrders.innerHTML = "";
    return;
  }

  els.workOrdersWrap.classList.remove("hidden");
  els.workOrdersTitle.textContent = `Work Orders (${state.workOrders.length})`;

  els.workOrders.innerHTML = state.workOrders.map((wo) => {
    return `<div class="wo-card">
      <div class="wo-top">
        <span class="wo-id">${esc(wo.id)}</span>
        <span class="wo-urgency">${esc(wo.urgency)}</span>
      </div>
      <div class="wo-location">📍 ${esc(wo.location)}</div>
      <div class="wo-cause">⚠ ${esc(wo.cause)}</div>
      <div class="wo-action">→ ${esc(wo.action)}</div>
    </div>`;
  }).join("");
}

function renderSensorDetail() {
  const selected = getSelectedSensor();
  if (!selected) {
    els.sensorDetail.classList.add("hidden");
    els.sensorDetail.innerHTML = "";
    return;
  }

  const statusColor = (STATUS_COLOR[selected.status] || STATUS_COLOR.online).dot;
  const rows = [
    ["ID", selected.id],
    ["Type", `${TYPE_ICONS[selected.type] || "?"} ${selected.type}`],
    ["Zone", selected.zone],
    ["Router", selected.router],
    ["RSSI", `${selected.rssi} dBm`],
    ["Battery", `${selected.battery}%`],
    ["Status", selected.status.toUpperCase()],
  ];

  els.sensorDetail.classList.remove("hidden");
  els.sensorDetail.innerHTML = `
    <div class="sensor-detail-title">SENSOR DETAIL</div>
    <div class="sensor-grid">
      ${rows.map(([k, v]) => `<span class="sensor-k">${esc(k)}</span><span class="sensor-v" style="color:${statusColor};">${esc(v)}</span>`).join("")}
    </div>
    <button id="close-detail" class="close-btn">CLOSE ✕</button>
  `;

  const closeBtn = document.getElementById("close-detail");
  if (closeBtn) {
    closeBtn.onclick = () => {
      state.selectedId = null;
      render();
    };
  }
}

function render() {
  renderBadge();
  renderHeaderCounts();
  renderMap();
  renderSimulationButtons();
  renderLogs();
  renderWorkOrders();
  renderSensorDetail();
}

async function runSimulation() {
  if (state.running) return;

  state.running = true;
  state.log = [];
  state.workOrders = [];
  state.freshLogKey = null;
  render();

  if (state.backendReady) {
    try {
      addLog("HeartbeatMonitor", "Patrol cycle started - scanning 24 sensors", "info");
      await apiPost("api_simulate_dropout", { sensor_id: "SEN-042" });
      addLog("HeartbeatMonitor", "SEN-042 last_ping delta exceeded threshold - flagged OFFLINE", "error");
      setSensorPatch("SEN-042", { status: "offline", rssi: -95 });
      render();

      await sleep(1000);
      addLog("DeadZoneMapper", "Mapping dead zone around SEN-042...", "info");

      await sleep(800);
      addLog("RootCauseAnalyzer", "Analyzing root cause - battery, RSSI, router load...", "info");

      const result = await apiPost("api_run_pipeline");

      await sleep(600);
      if (result && result.diagnoses && result.diagnoses.length > 0) {
        const diag = result.diagnoses[0];
        addLog("RootCauseAnalyzer", `cause: ${diag.cause}  confidence: ${Math.round((diag.confidence || 0.78) * 100)}%`, "success");
        addLog("RootCauseAnalyzer", `action: ${diag.recommended_action}`, "info");
      }

      await sleep(600);
      if (result && result.work_orders && result.work_orders.length > 0) {
        addLog("DispatchAgent", "Generating work order...", "info");
        await sleep(500);
        addLog("DispatchAgent", "Work order dispatched to maintenance team ✓", "success");

        const diag = (result.diagnoses && result.diagnoses[0]) || {};
        state.workOrders = [{
          id: `WO-${Date.now()}`,
          sensor: "SEN-042",
          cause: diag.cause || "HARDWARE_FAULT",
          urgency: diag.cause === "BATTERY_DEAD" ? "CRITICAL" : "HIGH",
          location: diag.location || "Cold Storage - Row 3, Bay 2",
          action: diag.recommended_action || "Inspect sensor hardware on-site",
          ts: Date.now(),
        }];
        render();
      } else {
        addLog("ReroutingAgent", "Attempting mesh reroute...", "info");
        await sleep(800);
        addLog("ReroutingAgent", "SEN-042 rerouted. Self-heal SUCCESS ✓", "success");
        setSensorPatch("SEN-042", { status: "degraded" });
        addLog("DispatchAgent", "Self-heal succeeded. No work order required.", "success");
        render();
      }
    } catch (err) {
      addLog("System", `Backend error: ${err.message}`, "error");
    }

    state.running = false;
    render();
    return;
  }

  const events = [
    { t: 0, agent: "HeartbeatMonitor", msg: "Patrol cycle started - scanning 24 sensors", type: "info" },
    { t: 1200, agent: "HeartbeatMonitor", msg: "SEN-042 last_ping delta: 614s - threshold exceeded", type: "warn" },
    { t: 2000, agent: "HeartbeatMonitor", msg: "SEN-042 flagged OFFLINE (severity: critical)", type: "error", sid: "SEN-042", ns: "offline" },
    { t: 3400, agent: "DeadZoneMapper", msg: "Mapping dead zone around SEN-042...", type: "info" },
    { t: 4600, agent: "DeadZoneMapper", msg: "RSSI neighbors: -71, -74, -68 dBm. Zone isolated.", type: "info" },
    { t: 6000, agent: "RootCauseAnalyzer", msg: "Analyzing - battery:87%, router_load:68%, neighbors:3", type: "info" },
    { t: 8200, agent: "RootCauseAnalyzer", msg: "cause: PHYSICAL_OBSTRUCTION  confidence: 78%", type: "success" },
    { t: 9500, agent: "ReroutingAgent", msg: "RTR-002 load 68% > threshold. Scanning alternates...", type: "info" },
    { t: 11000, agent: "ReroutingAgent", msg: "SEN-042 rerouted via RTR-003. Self-heal SUCCESS ✓", type: "success", sid: "SEN-042", ns: "degraded" },
    { t: 12800, agent: "DispatchAgent", msg: "Self-heal succeeded. No work order required.", type: "success" },
  ];

  for (const ev of events) {
    const timer = setTimeout(() => {
      addLog(ev.agent, ev.msg, ev.type);
      if (ev.sid) {
        setSensorPatch(ev.sid, { status: ev.ns });
        render();
      }
    }, ev.t);
    state.timers.push(timer);
  }

  const endTimer = setTimeout(() => {
    state.running = false;
    render();
  }, 14000);
  state.timers.push(endTimer);
}

async function handleReset() {
  clearPendingTimers();

  state.sensors = INITIAL_SENSORS.map((s) => ({ ...s, status: "online" }));
  state.log = [];
  state.workOrders = [];
  state.selectedId = null;
  state.freshLogKey = null;
  render();

  if (state.backendReady) {
    try {
      await apiPost("api_reset");
      addLog("System", "All sensors reset ✓", "success");
    } catch (_err) {
      ;
    }
  }
}

function startPolling() {
  if (state.pollInterval) {
    clearInterval(state.pollInterval);
  }

  state.pollInterval = setInterval(async () => {
    if (!state.backendReady) return;

    try {
      const live = await apiPost("api_state");
      if (live && live.sensors && live.sensors.length > 0) {
        state.sensors = state.sensors.map((sensor) => {
          const found = live.sensors.find((ls) => ls.id === sensor.id);
          return found
            ? { ...sensor, status: found.status, rssi: found.rssi, battery: found.battery }
            : sensor;
        });
        render();
      }
    } catch (_err) {
      ;
    }
  }, 5000);
}

async function initBackend() {
  addLog("System", "Connecting to Autonode Jac backend...", "info");

  try {
    await apiPost("api_setup");
    addLog("System", "Warehouse graph initialized ✓", "success");

    const live = await apiPost("api_state");
    if (live && live.sensors && live.sensors.length > 0) {
      state.sensors = live.sensors.map((s) => ({
        id: s.id,
        type: s.type,
        zone: s.zone,
        router: s.router,
        x: s.x,
        y: s.y,
        status: s.status,
        rssi: s.rssi,
        battery: s.battery,
      }));

      if (live.routers && live.routers.length > 0) {
        state.routers = live.routers.map((r) => ({
          id: r.router_id,
          zone: r.zone,
          x: r.x,
          y: r.y,
          load: r.load,
        }));
      }

      addLog("System", `${live.sensors.length} sensors loaded from live Jac graph ✓`, "success");
    }

    state.backendReady = true;
    state.backendStatus = "live";
    render();
  } catch (_err) {
    addLog("System", "Backend unavailable - running in demo mode", "warn");
    state.backendStatus = "demo";
    render();
  }
}

function wireEvents() {
  els.simBtn.addEventListener("click", runSimulation);
  els.resetBtn.addEventListener("click", handleReset);

  els.mapArea.addEventListener("click", (event) => {
    const sensorNode = event.target.closest("[data-sensor-id]");
    if (!sensorNode) return;
    const sensorId = sensorNode.getAttribute("data-sensor-id");
    state.selectedId = sensorId;
    render();
  });
}

async function bootstrap() {
  wireEvents();
  render();
  startPolling();
  await initBackend();
}

bootstrap();
