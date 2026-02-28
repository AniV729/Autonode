import { useEffect, useMemo, useRef, useState } from "react";

const API = "http://localhost:8000";

const INITIAL_SENSORS = [
  { id: "SEN-001", type: "temp",      zone: "Cold Storage",    router: "RTR-001", x: 100, y: 130, status: "online",   rssi: -52, battery: 91 },
  { id: "SEN-002", type: "temp",      zone: "Cold Storage",    router: "RTR-001", x: 200, y: 100, status: "online",   rssi: -58, battery: 84 },
  { id: "SEN-003", type: "gas",       zone: "Cold Storage",    router: "RTR-001", x: 155, y: 200, status: "online",   rssi: -61, battery: 77 },
  { id: "SEN-004", type: "vibration", zone: "Cold Storage",    router: "RTR-001", x: 65,  y: 240, status: "online",   rssi: -55, battery: 88 },
  { id: "SEN-005", type: "asset",     zone: "Cold Storage",    router: "RTR-001", x: 240, y: 160, status: "online",   rssi: -49, battery: 95 },
  { id: "SEN-006", type: "temp",      zone: "Assembly Floor",  router: "RTR-002", x: 420, y: 90,  status: "online",   rssi: -60, battery: 72 },
  { id: "SEN-007", type: "vibration", zone: "Assembly Floor",  router: "RTR-002", x: 510, y: 140, status: "online",   rssi: -55, battery: 68 },
  { id: "SEN-008", type: "vibration", zone: "Assembly Floor",  router: "RTR-002", x: 590, y: 80,  status: "online",   rssi: -57, battery: 81 },
  { id: "SEN-009", type: "gas",       zone: "Assembly Floor",  router: "RTR-002", x: 455, y: 210, status: "online",   rssi: -54, battery: 90 },
  { id: "SEN-010", type: "temp",      zone: "Assembly Floor",  router: "RTR-002", x: 555, y: 230, status: "online",   rssi: -66, battery: 63 },
  { id: "SEN-011", type: "asset",     zone: "Assembly Floor",  router: "RTR-002", x: 400, y: 270, status: "online",   rssi: -59, battery: 75 },
  { id: "SEN-042", type: "temp",      zone: "Cold Storage",    router: "RTR-001", x: 130, y: 320, status: "online",   rssi: -55, battery: 87 },
  { id: "SEN-013", type: "gas",       zone: "Loading Bay",     router: "RTR-003", x: 700, y: 150, status: "online",   rssi: -62, battery: 79 },
  { id: "SEN-014", type: "asset",     zone: "Loading Bay",     router: "RTR-003", x: 780, y: 100, status: "online",   rssi: -58, battery: 86 },
  { id: "SEN-015", type: "temp",      zone: "Loading Bay",     router: "RTR-003", x: 740, y: 230, status: "online",   rssi: -70, battery: 55 },
  { id: "SEN-016", type: "vibration", zone: "Loading Bay",     router: "RTR-003", x: 840, y: 180, status: "online",   rssi: -65, battery: 71 },
  { id: "SEN-017", type: "gas",       zone: "Maintenance Bay", router: "RTR-004", x: 460, y: 450, status: "online",   rssi: -53, battery: 93 },
  { id: "SEN-018", type: "vibration", zone: "Maintenance Bay", router: "RTR-004", x: 550, y: 400, status: "online",   rssi: -60, battery: 80 },
  { id: "SEN-019", type: "temp",      zone: "Maintenance Bay", router: "RTR-004", x: 640, y: 490, status: "online",   rssi: -56, battery: 88 },
  { id: "SEN-020", type: "asset",     zone: "Maintenance Bay", router: "RTR-004", x: 730, y: 450, status: "online",   rssi: -67, battery: 64 },
  { id: "SEN-021", type: "temp",      zone: "Maintenance Bay", router: "RTR-004", x: 500, y: 540, status: "online",   rssi: -61, battery: 76 },
  { id: "SEN-022", type: "gas",       zone: "Cold Storage",    router: "RTR-001", x: 220, y: 300, status: "online",   rssi: -54, battery: 89 },
  { id: "SEN-023", type: "asset",     zone: "Assembly Floor",  router: "RTR-002", x: 630, y: 170, status: "online",   rssi: -58, battery: 82 },
  { id: "SEN-024", type: "vibration", zone: "Loading Bay",     router: "RTR-003", x: 800, y: 270, status: "online",   rssi: -63, battery: 70 },
];

const ROUTERS_FALLBACK = [
  { id: "RTR-001", zone: "Cold Storage",    x: 160, y: 230, load: 32 },
  { id: "RTR-002", zone: "Assembly Floor",  x: 510, y: 175, load: 68 },
  { id: "RTR-003", zone: "Loading Bay",     x: 760, y: 185, load: 41 },
  { id: "RTR-004", zone: "Maintenance Bay", x: 595, y: 465, load: 28 },
];

const ZONES = [
  { name: "Cold Storage",    x: 20,  y: 50,  w: 300, h: 350, color: "#0ea5e9" },
  { name: "Assembly Floor",  x: 370, y: 50,  w: 290, h: 300, color: "#f59e0b" },
  { name: "Loading Bay",     x: 670, y: 50,  w: 210, h: 300, color: "#8b5cf6" },
  { name: "Maintenance Bay", x: 400, y: 360, w: 390, h: 230, color: "#10b981" },
];

const TYPE_ICONS = { temp: "🌡", vibration: "📳", gas: "💨", asset: "📦" };
const STATUS_COLOR = {
  online:   { dot: "#22c55e", glow: "0 0 8px #22c55e88" },
  degraded: { dot: "#f59e0b", glow: "0 0 8px #f59e0b88" },
  offline:  { dot: "#ef4444", glow: "0 0 12px #ef444499" },
};

const FAILURE_PROFILES = {
  ROUTER_OVERLOAD: {
    label: "Router overload",
    rootCause: "ROUTER_OVERLOAD",
    detectionRange: [800, 1500],
    diagnoseRange: [1200, 2000],
    actionRange: [1200, 1800],
    confidenceRange: [0.83, 0.94],
    response: "reroute",
    rerouteReason: "router load exceeded 70%, so traffic moved to a lower-load path",
    dispatchReason: "",
    perIncidentSavings: 5200,
    manualResolutionRange: [70 * 60 * 1000, 115 * 60 * 1000],
  },
  BATTERY_DEAD: {
    label: "Dead battery",
    rootCause: "BATTERY_DEAD",
    detectionRange: [700, 1400],
    diagnoseRange: [1000, 1700],
    actionRange: [1300, 1900],
    confidenceRange: [0.9, 0.98],
    response: "dispatch",
    rerouteReason: "",
    dispatchReason: "battery dropped below 5% and device heartbeat stopped",
    perIncidentSavings: 2100,
    manualResolutionRange: [95 * 60 * 1000, 160 * 60 * 1000],
  },
  HARDWARE_FAULT: {
    label: "Hardware fault",
    rootCause: "HARDWARE_FAULT",
    detectionRange: [900, 1700],
    diagnoseRange: [1200, 2200],
    actionRange: [1400, 2200],
    confidenceRange: [0.8, 0.92],
    response: "dispatch",
    rerouteReason: "",
    dispatchReason: "telemetry checksum + vibration profile indicate local hardware damage",
    perIncidentSavings: 2500,
    manualResolutionRange: [105 * 60 * 1000, 180 * 60 * 1000],
  },
  PHYSICAL_OBSTRUCTION: {
    label: "Physical obstruction",
    rootCause: "PHYSICAL_OBSTRUCTION",
    detectionRange: [900, 1600],
    diagnoseRange: [1300, 2100],
    actionRange: [1200, 1900],
    confidenceRange: [0.75, 0.88],
    response: "reroute",
    rerouteReason: "path-loss spike indicates blocked line-of-sight; alternate route restored coverage",
    dispatchReason: "",
    perIncidentSavings: 4600,
    manualResolutionRange: [80 * 60 * 1000, 140 * 60 * 1000],
  },
};

const COMPARISON_SCENARIO = {
  sensorId: "SEN-007",
  failureKey: "ROUTER_OVERLOAD",
};

const DEMO_SENSORS_BY_FAILURE = {
  ROUTER_OVERLOAD: "SEN-007",
  BATTERY_DEAD: "SEN-015",
  HARDWARE_FAULT: "SEN-020",
  PHYSICAL_OBSTRUCTION: "SEN-042",
};

const SEED_INCIDENTS = [];

async function apiPost(endpoint, body = {}) {
  const res = await fetch(`${API}/walker/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.reports && data.reports.length > 0) return data.reports[0];
  return data;
}

function pickInRange([min, max]) {
  return Math.round(min + Math.random() * (max - min));
}

function avg(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function formatDuration(ms) {
  if (!ms) return "0.0s";
  if (ms < 60 * 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / (60 * 1000)).toFixed(1)}m`;
}

function formatMoney(amount) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${Math.round(amount / 1000)}k`;
  return `$${Math.round(amount)}`;
}

function AgentBadge({ name }) {
  const colors = {
    HeartbeatMonitor: "#0ea5e9",
    DeadZoneMapper: "#8b5cf6",
    RootCauseAnalyzer: "#f59e0b",
    ReroutingAgent: "#10b981",
    DispatchAgent: "#ef4444",
    System: "#64748b",
  };
  const c = colors[name] || "#94a3b8";
  return (
    <span style={{
      fontSize: 10,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      color: c,
      background: `${c}18`,
      border: `1px solid ${c}44`,
      borderRadius: 3,
      padding: "1px 6px",
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
    }}>
      {name}
    </span>
  );
}

function LogEntry({ entry, fresh }) {
  const typeStyle = { info: "#94a3b8", warn: "#f59e0b", error: "#ef4444", success: "#22c55e" };

  return (
    <div style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      padding: "7px 0",
      borderBottom: "1px solid #ffffff08",
      animation: fresh ? "fadeSlide 0.3s ease" : "none",
    }}>
      <span style={{
        fontSize: 10,
        color: "#475569",
        fontFamily: "monospace",
        whiteSpace: "nowrap",
        marginTop: 2,
      }}>
        {new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <AgentBadge name={entry.agent} />
          <span style={{ fontSize: 12, color: typeStyle[entry.type], lineHeight: 1.45 }}>{entry.msg}</span>
        </div>
        {(entry.rootCause || entry.confidence || entry.reason) && (
          <div style={{ marginTop: 4, fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>
            {entry.rootCause && <span>root cause: {entry.rootCause} </span>}
            {entry.confidence && <span>confidence: {entry.confidence}% </span>}
            {entry.reason && <span>why: {entry.reason}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function SensorNode({ sensor, selected, onClick }) {
  const sc = STATUS_COLOR[sensor.status] || STATUS_COLOR.online;
  const r = selected ? 14 : 10;

  return (
    <g transform={`translate(${sensor.x}, ${sensor.y})`} style={{ cursor: "pointer" }} onClick={() => onClick(sensor)}>
      {sensor.status !== "online" && (
        <circle r="20" fill={sc.dot} opacity="0.12">
          <animate attributeName="r" values="14;26;14" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle
        r={r}
        fill={sc.dot}
        stroke={selected ? "#fff" : "#060d1a"}
        strokeWidth={selected ? 2.5 : 1.5}
        style={{ filter: `drop-shadow(${sc.glow})`, transition: "r 0.2s" }}
      />
      <text textAnchor="middle" dominantBaseline="central" fontSize="11" style={{ userSelect: "none", pointerEvents: "none" }}>
        {TYPE_ICONS[sensor.type]}
      </text>
    </g>
  );
}

function RouterNode({ router }) {
  const loadColor = router.load > 70 ? "#ef4444" : router.load > 50 ? "#f59e0b" : "#22c55e";
  return (
    <g transform={`translate(${router.x}, ${router.y})`}>
      <rect
        x="-22"
        y="-14"
        width="44"
        height="28"
        rx="4"
        fill="#1e293b"
        stroke={loadColor}
        strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 4px ${loadColor}66)` }}
      />
      <text textAnchor="middle" dominantBaseline="central" fontSize="14" fill={loadColor} fontFamily="monospace" fontWeight="700">📡</text>
      <text textAnchor="middle" y="22" fontSize="9" fill={loadColor} fontFamily="monospace" fontWeight="700">{router.id}</text>
    </g>
  );
}

export default function SentinelMesh() {
  const [sensors, setSensors] = useState(INITIAL_SENSORS);
  const [routers, setRouters] = useState(ROUTERS_FALLBACK);
  const [selected, setSelected] = useState(null);
  const [log, setLog] = useState([]);
  const [freshLog, setFreshLog] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("autonomous");
  const [autoMonitor, setAutoMonitor] = useState(false);
  const [backendStatus, setBackendStatus] = useState("connecting");
  const [backendReady, setBackendReady] = useState(false);
  const [incidentHistory, setIncidentHistory] = useState(SEED_INCIDENTS);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [activeFailure, setActiveFailure] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState("agents");

  const logRef = useRef(null);
  const timersRef = useRef([]);
  const runIncidentRef = useRef(null);
  const baselineSensorsRef = useRef(INITIAL_SENSORS);
  const baselineRoutersRef = useRef(ROUTERS_FALLBACK);

  const isNarrow = viewportWidth < 1100;
  const isCompact = viewportWidth < 760;
  const isTiny = viewportWidth < 480;
  const sidebarMetricColumns = isTiny ? 1 : 2;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(() => {
    if (!selected) return;
    const live = sensors.find((s) => s.id === selected.id);
    if (live) setSelected(live);
  }, [sensors, selected]);

  function addLog(agent, msg, type = "info", detail = {}) {
    const entry = { agent, msg, type, ts: Date.now(), ...detail };
    setLog((prev) => [...prev.slice(-159), entry]);
    setFreshLog(`${entry.ts}-${agent}-${msg}`);
  }

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function schedule(delay, fn) {
    const tid = setTimeout(fn, delay);
    timersRef.current.push(tid);
  }

  function recordIncident(incident) {
    setIncidentHistory((prev) => [...prev, incident].slice(-220));
  }

  function updateSensorOffline(sensorId, failureKey) {
    setSensors((prev) => prev.map((s) => {
      if (s.id !== sensorId) return s;

      if (failureKey === "BATTERY_DEAD") {
        return { ...s, status: "offline", battery: Math.max(0, s.battery - 85), rssi: -97 };
      }
      if (failureKey === "HARDWARE_FAULT") {
        return { ...s, status: "offline", rssi: -93 };
      }
      if (failureKey === "PHYSICAL_OBSTRUCTION") {
        return { ...s, status: "offline", rssi: -86 };
      }
      return { ...s, status: "offline", rssi: -83 };
    }));
  }

  function pickAlternateRouter(sensor) {
    const options = routers
      .filter((r) => r.id !== sensor.router)
      .sort((a, b) => a.load - b.load);
    return options[0] || null;
  }

  function runIncident(sensorId, failureKey, source = "manual", actionKey = null) {
    if (running) return;

    const sensor = sensors.find((s) => s.id === sensorId);
    const profile = FAILURE_PROFILES[failureKey];
    if (!sensor || !profile) return;

    clearTimers();
    setRunning(true);
    setActiveAction(actionKey);
    setActiveFailure({ sensorId, failureKey, source });

    const detectionMs = pickInRange(profile.detectionRange);
    const diagnosisMs = detectionMs + pickInRange(profile.diagnoseRange);
    const actionMs = diagnosisMs + pickInRange(profile.actionRange);
    const confidence = Math.round(pickInRange([
      profile.confidenceRange[0] * 100,
      profile.confidenceRange[1] * 100,
    ]));

    addLog("HeartbeatMonitor", `${sensor.id} anomaly observed (${profile.label})`, "warn");
    addLog(
      "System",
      `${mode === "autonomous" ? "Autonomous" : "Traditional"} mode handling started for ${sensor.id}`,
      "info"
    );

    schedule(detectionMs, () => {
      updateSensorOffline(sensor.id, failureKey);
      addLog(
        "HeartbeatMonitor",
        `${sensor.id} marked OFFLINE in ${sensor.zone}`,
        "error",
        { reason: "heartbeat threshold exceeded" }
      );
    });

    if (mode === "traditional") {
      schedule(detectionMs + 700, () => {
        addLog(
          "System",
          "Employee manually checks",
          "warn",
          {
            rootCause: profile.rootCause,
            confidence,
            reason: "automation disabled in Traditional Mode",
          }
        );

        recordIncident({
          mode,
          failureKey,
          autoHealed: false,
          dispatched: true,
          detectionMs,
          resolutionMs: pickInRange(profile.manualResolutionRange),
          savedDollars: 0,
        });

        setRunning(false);
        setActiveAction(null);
      });
      return;
    }

    const preferredResponse = profile.response;
    const altRouter = preferredResponse === "reroute" ? pickAlternateRouter(sensor) : null;
    const response = preferredResponse === "reroute" && !altRouter ? "dispatch" : preferredResponse;

    schedule(diagnosisMs - 500, () => {
      addLog("DeadZoneMapper", `Impact radius mapped for ${sensor.id} in ${sensor.zone}`, "info");
    });

    schedule(diagnosisMs, () => {
      const why = response === "reroute" ? profile.rerouteReason : profile.dispatchReason;
      addLog(
        "RootCauseAnalyzer",
        `Root cause identified: ${profile.rootCause}`,
        "success",
        {
          rootCause: profile.rootCause,
          confidence,
          reason: why,
        }
      );
    });

    if (response === "reroute" && altRouter) {
      schedule(diagnosisMs + 700, () => {
        addLog(
          "ReroutingAgent",
          `Decision: reroute ${sensor.id} from ${sensor.router} to ${altRouter.id}`,
          "info",
          { reason: profile.rerouteReason }
        );

        setSensors((prev) => prev.map((s) => (
          s.id === sensor.id ? { ...s, status: "degraded", router: altRouter.id, rssi: Math.min(-66, s.rssi + 10) } : s
        )));

        setRouters((prev) => prev.map((r) => {
          if (r.id === sensor.router) return { ...r, load: Math.max(15, r.load - 8) };
          if (r.id === altRouter.id) return { ...r, load: Math.min(94, r.load + 8) };
          return r;
        }));
      });

      schedule(actionMs, () => {
        setSensors((prev) => prev.map((s) => (
          s.id === sensor.id ? { ...s, status: "online", rssi: -63 } : s
        )));

        addLog(
          "ReroutingAgent",
          `${sensor.id} recovered through ${altRouter.id}. Self-heal complete.`,
          "success",
          { reason: "traffic shifted automatically before prolonged downtime" }
        );
        addLog("DispatchAgent", "Dispatch avoided after autonomous recovery.", "success");

        recordIncident({
          mode,
          failureKey,
          autoHealed: true,
          dispatched: false,
          detectionMs,
          resolutionMs: actionMs,
          savedDollars: profile.perIncidentSavings,
        });

        setRunning(false);
        setActiveAction(null);
      });
      return;
    }

    schedule(diagnosisMs + 650, () => {
      const workOrderId = `WO-${Date.now().toString().slice(-6)}`;
      addLog(
        "DispatchAgent",
        `Decision: dispatch technician for ${sensor.id}`,
        "warn",
        { reason: profile.dispatchReason || "reroute path not viable" }
      );

      setWorkOrders((prev) => [{
        id: workOrderId,
        sensor: sensor.id,
        cause: profile.rootCause,
        urgency: profile.rootCause === "BATTERY_DEAD" ? "CRITICAL" : "HIGH",
        location: sensor.zone,
        action: profile.rootCause === "BATTERY_DEAD"
          ? "Replace battery module and validate heartbeat stream"
          : "Inspect and repair on-device hardware; run diagnostics",
        ts: Date.now(),
      }, ...prev].slice(0, 20));
    });

    schedule(actionMs, () => {
      addLog(
        "DispatchAgent",
        "Work order generated and routed automatically.",
        "success",
        { reason: "no manual click required after failure detection" }
      );

      recordIncident({
        mode,
        failureKey,
        autoHealed: false,
        dispatched: true,
        detectionMs,
        resolutionMs: actionMs,
        savedDollars: profile.perIncidentSavings,
      });

      setRunning(false);
      setActiveAction(null);
    });
  }

  runIncidentRef.current = runIncident;

  async function handleReset(resetMetrics = false) {
    clearTimers();
    setRunning(false);
    setActiveFailure(null);
    setActiveAction(null);
    setSensors(baselineSensorsRef.current.map((s) => ({ ...s, status: "online" })));
    setRouters(baselineRoutersRef.current.map((r) => ({ ...r })));
    setLog([]);
    setWorkOrders([]);
    setSelected(null);

    if (resetMetrics) {
      setIncidentHistory(SEED_INCIDENTS);
    }

    if (backendReady) {
      try {
        await apiPost("api_reset");
      } catch (e) {
        addLog("System", "Backend reset unavailable; visual state reset only.", "warn");
      }
    }
  }

  useEffect(() => {
    async function init() {
      try {
        addLog("System", "Connecting to backend graph…", "info");
        await apiPost("api_setup");
        const state = await apiPost("api_state");

        if (state?.sensors?.length > 0) {
          const liveSensors = state.sensors.map((s) => ({
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
          setSensors(liveSensors);
          baselineSensorsRef.current = liveSensors;

          if (state.routers?.length > 0) {
            const liveRouters = state.routers.map((r) => ({
              id: r.router_id,
              zone: r.zone,
              x: r.x,
              y: r.y,
              load: r.load,
            }));
            setRouters(liveRouters);
            baselineRoutersRef.current = liveRouters;
          }
        }

        setBackendReady(true);
        setBackendStatus("live");
        addLog("System", "Backend connection live.", "success");
      } catch (e) {
        setBackendStatus("demo");
        addLog("System", "Backend unavailable; using simulated telemetry feed.", "warn");
      }
    }

    init();

    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (!autoMonitor) return;

    const loop = () => {
      if (running) return;
      const candidates = sensors.filter((s) => s.status !== "offline");
      if (candidates.length === 0) return;

      const sensor = candidates[Math.floor(Math.random() * candidates.length)];
      const keys = Object.keys(FAILURE_PROFILES);
      const failureKey = keys[Math.floor(Math.random() * keys.length)];
      runIncidentRef.current?.(sensor.id, failureKey, "auto-monitor", "auto-monitor");
    };

    const initial = setTimeout(loop, 2500);
    const interval = setInterval(loop, 28000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [autoMonitor, running, sensors, mode]);

  const online = sensors.filter((s) => s.status === "online").length;
  const degraded = sensors.filter((s) => s.status === "degraded").length;
  const offline = sensors.filter((s) => s.status === "offline").length;

  const metrics = useMemo(() => {
    if (incidentHistory.length === 0) {
      return {
        autoHealedPct: null,
        dispatchReducedPct: null,
        detectionAvg: null,
        resolutionAvg: null,
        saved: null,
        annualPerFacility: null,
        incidents: 0,
      };
    }

    const autonomous = incidentHistory.filter((i) => i.mode === "autonomous");
    const traditional = incidentHistory.filter((i) => i.mode === "traditional");
    const autoHealed = autonomous.filter((i) => i.autoHealed).length;

    const autoDispatchRate = autonomous.length > 0
      ? autonomous.filter((i) => i.dispatched).length / autonomous.length
      : 0;
    const traditionalDispatchRate = traditional.length > 0
      ? traditional.filter((i) => i.dispatched).length / traditional.length
      : 0;

    const dispatchReduced = traditionalDispatchRate > 0
      ? ((traditionalDispatchRate - autoDispatchRate) / traditionalDispatchRate) * 100
      : null;

    const detectionAvg = avg(incidentHistory.map((i) => i.detectionMs));
    const resolutionAvg = avg(incidentHistory.map((i) => i.resolutionMs).filter(Boolean));
    const saved = incidentHistory.reduce((sum, i) => sum + (i.savedDollars || 0), 0);

    const avgSavedPerIncident = incidentHistory.length > 0 ? saved / incidentHistory.length : 0;
    const annualPerFacility = Math.round(avgSavedPerIncident * 42);

    return {
      autoHealedPct: autonomous.length > 0 ? (autoHealed / autonomous.length) * 100 : null,
      dispatchReducedPct: dispatchReduced !== null ? Math.max(0, dispatchReduced) : null,
      detectionAvg,
      resolutionAvg,
      saved,
      annualPerFacility,
      incidents: incidentHistory.length,
    };
  }, [incidentHistory]);

  const st = {
    root: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      background: "#060d1a",
      color: "#e2e8f0",
      minHeight: "100vh",
      height: isNarrow ? "auto" : "100vh",
      display: "grid",
      gridTemplateRows: isNarrow ? "auto minmax(320px, 56vh) auto" : "auto 1fr",
      gridTemplateColumns: isNarrow ? "1fr" : "minmax(0, 1fr) 360px",
      gridTemplateAreas: isNarrow
        ? `"header" "map" "sidebar"`
        : `"header header" "map sidebar"`,
      overflowX: "hidden",
      overflowY: isNarrow ? "auto" : "hidden",
    },
    header: {
      gridArea: "header",
      background: "#0b1628",
      borderBottom: "1px solid #1e3a5f",
      display: "flex",
      alignItems: "center",
      padding: isCompact ? "10px 12px" : "8px 16px",
      gap: 12,
      flexWrap: "wrap",
      rowGap: 8,
    },
    pill: (color) => ({
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: `${color}14`,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 11,
      color,
    }),
    badge: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      background: backendStatus === "live" ? "#22c55e18" : "#f59e0b18",
      border: `1px solid ${backendStatus === "live" ? "#22c55e44" : "#f59e0b44"}`,
      color: backendStatus === "live" ? "#22c55e" : "#f59e0b",
      borderRadius: 4,
      padding: "3px 8px",
    },
    sidebar: {
      gridArea: "sidebar",
      background: "#0b1628",
      borderLeft: isNarrow ? "none" : "1px solid #1e3a5f",
      borderTop: isNarrow ? "1px solid #1e3a5f" : "none",
      boxShadow: isNarrow ? "none" : "inset -1px 0 0 #1e3a5f",
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      minHeight: 0,
      overflowX: "hidden",
      overflowY: "hidden",
      scrollbarGutter: "stable both-edges",
    },
    tabRow: {
      display: "flex",
      flexWrap: "nowrap",
      gap: 4,
      padding: "8px",
      borderBottom: "1px solid #1e3a5f",
      background: "#071226",
      minWidth: 0,
      overflow: "hidden",
    },
    tabBtn: (active) => ({
      flex: "1 1 0",
      minWidth: 0,
      border: active ? "1px solid #1d4ed8" : "1px solid #1e3a5f",
      background: active ? "#1d4ed8" : "#0b1628",
      color: active ? "#fff" : "#94a3b8",
      borderRadius: 6,
      padding: "7px 4px",
      fontSize: 10,
      fontWeight: 700,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: "0.03em",
      textAlign: "center",
    }),
    tabBody: {
      flex: 1,
      minHeight: 0,
      display: "flex",
      overflow: "hidden",
    },
    sectionScroll: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "10px 12px 12px",
      scrollbarWidth: "thin",
      scrollbarColor: "#1e3a5f transparent",
    },
    modeToggle: {
      margin: "4px 0 0",
      border: "1px solid #1e3a5f",
      borderRadius: 8,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      overflow: "hidden",
      background: "#071226",
    },
    modeBtn: (active) => ({
      background: active ? "#1d4ed8" : "transparent",
      border: "none",
      color: active ? "#ffffff" : "#64748b",
      padding: "9px 6px",
      fontFamily: "inherit",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.06em",
      cursor: running ? "not-allowed" : "pointer",
    }),
    actionBtn: (color = "#0ea5e9", opts = {}) => ({
      ...(() => {
        const active = !!opts.active;
        const locked = !!opts.locked;
        return {
          background: active
            ? "#1e293b"
            : `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
          color: active ? "#cbd5e1" : "#fff",
          opacity: locked && !active ? 0.58 : 1,
          cursor: locked ? "not-allowed" : "pointer",
          border: active ? "1px solid #334155" : "none",
        };
      })(),
      margin: "8px 0 0",
      padding: "10px 0",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontFamily: "inherit",
      width: "100%",
      transition: "opacity 0.15s ease, filter 0.15s ease, background 0.15s ease",
    }),
    resetBtn: {
      margin: "8px 0 0",
      padding: "6px 0",
      background: "transparent",
      border: "1px solid #1e3a5f",
      borderRadius: 6,
      color: "#64748b",
      fontSize: 11,
      cursor: "pointer",
      fontFamily: "inherit",
      width: "100%",
    },
    logBox: {
      flex: 1,
      overflowY: "auto",
      minHeight: 0,
      padding: "2px 0",
      scrollbarWidth: "thin",
      scrollbarColor: "#1e3a5f transparent",
    },
    woBox: {
      maxHeight: "none",
      minHeight: 0,
      flex: 1,
      overflowY: "auto",
      padding: "0 0 12px",
      scrollbarWidth: "thin",
      scrollbarColor: "#1e3a5f transparent",
    },
    woCard: {
      background: "#0f1f38",
      border: "1px solid #ef444444",
      borderRadius: 6,
      padding: 12,
      marginBottom: 8,
      fontSize: 11,
      wordBreak: "break-word",
      overflowWrap: "anywhere",
    },
    detail: {
      borderTop: "1px solid #1e3a5f",
      marginTop: 10,
      padding: 12,
      fontSize: 12,
      borderRadius: 6,
      background: "#071226",
      border: "1px solid #1e3a5f",
    },
  };

  return (
    <div style={st.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        @keyframes fadeSlide { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:2px;}
      `}</style>

      <header style={st.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Autonode logo"
            style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
          />
          <span style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b", letterSpacing: "-0.03em" }}>
            Autonode
          </span>
        </div>

        <div style={{ flex: 1 }} />
        <span style={st.badge}>
          {backendStatus === "live" ? "● LIVE JAC" : backendStatus === "demo" ? "◌ DEMO FEED" : "⟳ CONNECTING"}
        </span>
        <div style={st.pill("#22c55e")}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
          {online} online
        </div>
        <div style={st.pill("#f59e0b")}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
          {degraded} degraded
        </div>
        <div style={st.pill("#ef4444")}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          {offline} offline
        </div>
      </header>

      <main style={{ gridArea: "map", position: "relative", overflow: "hidden", background: "#060d1a", minWidth: 0, minHeight: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 900 620" preserveAspectRatio="xMidYMid meet">
          {ZONES.map((z) => (
            <g key={z.name}>
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                rx="6"
                fill={`${z.color}08`}
                stroke={`${z.color}44`}
                strokeWidth="1.5"
                strokeDasharray="6,3"
              />
              <text
                x={z.x + 10}
                y={z.y + 22}
                fontSize="11"
                fill={z.color}
                opacity="0.8"
                fontFamily="monospace"
                fontWeight="700"
                letterSpacing="0.08em"
              >
                {z.name.toUpperCase()}
              </text>
            </g>
          ))}

          {sensors.map((sen) => {
            const router = routers.find((r) => r.id === sen.router);
            if (!router) return null;
            const sc = STATUS_COLOR[sen.status] || STATUS_COLOR.online;
            return (
              <line
                key={`${sen.id}-line`}
                x1={router.x}
                y1={router.y}
                x2={sen.x}
                y2={sen.y}
                stroke={sc.dot}
                strokeWidth="1"
                strokeOpacity={sen.status === "online" ? 0.25 : 0.6}
                strokeDasharray={sen.status === "offline" ? "4,4" : "none"}
              />
            );
          })}

          {routers.map((r) => <RouterNode key={r.id} router={r} />)}
          {sensors.map((sen) => (
            <SensorNode key={sen.id} sensor={sen} selected={selected?.id === sen.id} onClick={setSelected} />
          ))}
        </svg>

        <div style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: isNarrow ? 16 : "auto",
          maxWidth: isNarrow ? "unset" : 700,
          background: "#0b162888",
          backdropFilter: "blur(8px)",
          border: "1px solid #1e3a5f",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          fontSize: 11,
        }}>
          {Object.entries(TYPE_ICONS).map(([t, icon]) => (
            <span key={t} style={{ color: "#94a3b8" }}>{icon} {t}</span>
          ))}
        </div>
      </main>

      <aside style={st.sidebar}>
        <div style={st.tabRow}>
          {[
            ["controls", "Controls"],
            ["resets", "Resets"],
            ["debug", "Data"],
            ["agents", "Agents"],
            ["work_orders", "Work"],
          ].map(([id, label]) => (
            <button key={id} style={st.tabBtn(activeSidebarTab === id)} onClick={() => setActiveSidebarTab(id)}>
              {label}
            </button>
          ))}
        </div>

        <div style={st.tabBody}>
          {activeSidebarTab === "controls" && (
            <div style={st.sectionScroll}>
              <div style={st.modeToggle}>
                <button
                  style={st.modeBtn(mode === "traditional")}
                  onClick={() => !running && setMode("traditional")}
                  disabled={running}
                >
                  Traditional
                </button>
                <button
                  style={st.modeBtn(mode === "autonomous")}
                  onClick={() => !running && setMode("autonomous")}
                  disabled={running}
                >
                  Autonomous
                </button>
              </div>

              <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>
                Same failure profile: <span style={{ color: "#38bdf8" }}>{COMPARISON_SCENARIO.sensorId}</span> / {FAILURE_PROFILES[COMPARISON_SCENARIO.failureKey].label}
              </div>

              <button
                style={st.actionBtn("#0ea5e9", { active: running && activeAction === "comparison", locked: running })}
                onClick={() => runIncident(COMPARISON_SCENARIO.sensorId, COMPARISON_SCENARIO.failureKey, "comparison", "comparison")}
                disabled={running}
              >
                {running && activeAction === "comparison" ? "⏳ Agents Running…" : "▶ Replay Same Failure"}
              </button>

              <div style={{ marginTop: 8, fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>
                {mode === "traditional"
                  ? "Traditional Mode: alerts detected, manual operations required."
                  : "Autonomous Mode: agents detect, explain, reroute/dispatch automatically."}
              </div>

              {Object.entries(FAILURE_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  style={st.actionBtn(
                    key === "BATTERY_DEAD" || key === "HARDWARE_FAULT" ? "#ef4444" : "#10b981",
                    { active: running && activeAction === `failure-${key}`, locked: running }
                  )}
                  onClick={() => runIncident(DEMO_SENSORS_BY_FAILURE[key], key, "manual", `failure-${key}`)}
                  disabled={running}
                >
                  {running && activeAction === `failure-${key}` ? "⏳ Running…" : `▶ ${profile.label}`}
                </button>
              ))}
            </div>
          )}

          {activeSidebarTab === "resets" && (
            <div style={st.sectionScroll}>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>
                Reset controls and background monitoring.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 11, color: autoMonitor ? "#22c55e" : "#ef4444" }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: autoMonitor ? "#22c55e" : "#ef4444",
                    boxShadow: autoMonitor ? "0 0 10px #22c55e99" : "0 0 10px #ef444499",
                    display: "inline-block",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                {autoMonitor ? "Auto Monitor Running" : "Auto Monitor Paused"}
              </div>
              <button
                style={st.resetBtn}
                onClick={() => setAutoMonitor((v) => !v)}
              >
                {autoMonitor ? "Pause Auto Monitor" : "Resume Auto Monitor"}
              </button>
              <button style={st.resetBtn} onClick={() => handleReset(false)}>↺ Reset Sensors</button>
              <button style={st.resetBtn} onClick={() => handleReset(true)}>↺ Reset Sensors + Metrics</button>
            </div>
          )}

          {activeSidebarTab === "debug" && (
            <div style={st.sectionScroll}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${sidebarMetricColumns}, minmax(110px, 1fr))`, gap: 8 }}>
                <div style={{ background: "#0f1f38", border: "1px solid #1e3a5f", borderRadius: 6, padding: "7px 6px" }}>
                  <div style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.07em" }}>% AUTO-HEALED</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#22c55e" }}>
                    {metrics.autoHealedPct === null ? "--" : `${metrics.autoHealedPct.toFixed(1)}%`}
                  </div>
                </div>
                <div style={{ background: "#0f1f38", border: "1px solid #1e3a5f", borderRadius: 6, padding: "7px 6px" }}>
                  <div style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.07em" }}>% DISPATCH REDUCED</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#38bdf8" }}>
                    {metrics.dispatchReducedPct === null ? "--" : `${metrics.dispatchReducedPct.toFixed(1)}%`}
                  </div>
                </div>
                <div style={{ background: "#0f1f38", border: "1px solid #1e3a5f", borderRadius: 6, padding: "7px 6px" }}>
                  <div style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.07em" }}>AVG DETECTION</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>
                    {metrics.detectionAvg === null ? "--" : formatDuration(metrics.detectionAvg)}
                  </div>
                </div>
                <div style={{ background: "#0f1f38", border: "1px solid #1e3a5f", borderRadius: 6, padding: "7px 6px" }}>
                  <div style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.07em" }}>AVG RESOLUTION</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>
                    {metrics.resolutionAvg === null ? "--" : formatDuration(metrics.resolutionAvg)}
                  </div>
                </div>
                <div style={{ background: "#0f1f38", border: "1px solid #1e3a5f", borderRadius: 6, padding: "7px 6px" }}>
                  <div style={{ fontSize: 8, color: "#64748b", letterSpacing: "0.07em" }}>EST. $ SAVED</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>
                    {metrics.saved === null ? "--" : formatMoney(metrics.saved)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 8, fontSize: 10, color: "#22c55e" }}>
                {metrics.annualPerFacility === null
                  ? "Run a simulation to populate business outcome metrics."
                  : `This prevents ~${formatMoney(metrics.annualPerFacility)} per facility per year.`}
              </div>

              <div style={{ marginTop: 10, padding: "8px", borderRadius: 6, border: "1px solid #1e3a5f", background: "#071226" }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em", marginBottom: 5 }}>
                  MQTT → API EXAMPLE
                </div>
                <pre style={{ margin: 0, fontSize: 10, color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
{`topic: facility/sensors/SEN-007/telemetry
payload: {"battery":3,"rssi":-92,"last_ping_ms":1730}
bridge: mosquitto -> POST /walker/api_ingest`}
                </pre>
              </div>

              {selected ? (
                <div style={st.detail}>
                  <div style={{ color: "#475569", fontSize: 10, letterSpacing: "0.1em", marginBottom: 8 }}>SENSOR DETAIL</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                    {[
                      ["ID", selected.id],
                      ["Type", `${TYPE_ICONS[selected.type]} ${selected.type}`],
                      ["Zone", selected.zone],
                      ["Router", selected.router],
                      ["RSSI", `${selected.rssi} dBm`],
                      ["Battery", `${selected.battery}%`],
                      ["Status", selected.status.toUpperCase()],
                      ["Active Failure", activeFailure?.sensorId === selected.id ? FAILURE_PROFILES[activeFailure.failureKey].label : "none"],
                    ].map(([k, v]) => (
                      <div key={`${selected.id}-${k}`} style={{ display: "contents" }}>
                        <span style={{ color: "#475569", fontSize: 11 }}>{k}</span>
                        <span style={{ color: STATUS_COLOR[selected.status]?.dot || "#22c55e", fontSize: 11, fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      marginTop: 10,
                      background: "transparent",
                      border: "1px solid #1e3a5f",
                      borderRadius: 4,
                      color: "#475569",
                      fontSize: 10,
                      padding: "4px 10px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    CLOSE ✕
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 10, color: "#475569", fontSize: 11 }}>
                  Click any sensor node to see sensor details here.
                </div>
              )}
            </div>
          )}

          {activeSidebarTab === "agents" && (
            <div style={st.sectionScroll}>
              <div ref={logRef} style={st.logBox}>
                {log.length === 0 && (
                  <div style={{ color: "#334155", fontSize: 11, padding: "12px 0", textAlign: "center" }}>
                    Waiting for telemetry anomalies.
                  </div>
                )}
                {log.map((entry, i) => (
                  <LogEntry key={`${entry.ts}-${i}`} entry={entry} fresh={freshLog === `${entry.ts}-${entry.agent}-${entry.msg}`} />
                ))}
              </div>
            </div>
          )}

          {activeSidebarTab === "work_orders" && (
            <div style={st.sectionScroll}>
              {workOrders.length === 0 && (
                <div style={{ color: "#334155", fontSize: 11, padding: "12px 0", textAlign: "center" }}>
                  No work orders yet.
                </div>
              )}
              <div style={st.woBox}>
                {workOrders.map((wo) => (
                  <div key={wo.id} style={st.woCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "#ef4444", fontWeight: 700 }}>{wo.id}</span>
                      <span style={{ background: "#ef444422", color: "#ef4444", borderRadius: 3, padding: "1px 6px", fontSize: 10 }}>
                        {wo.urgency}
                      </span>
                    </div>
                    <div style={{ color: "#94a3b8", marginBottom: 4 }}>📍 {wo.location}</div>
                    <div style={{ color: "#f59e0b", marginBottom: 6 }}>⚠ {wo.cause}</div>
                    <div style={{ color: "#64748b" }}>→ {wo.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
