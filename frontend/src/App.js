import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA (coords in viewBox units: 0-1000 x, 0-750 y) ──────────────────
const INITIAL_SENSORS = [
  { id: "SEN-001", type: "temp",      zone: "Cold Storage",    router: "RTR-001", x: 100, y: 130, status: "online",   rssi: -52, battery: 91 },
  { id: "SEN-002", type: "temp",      zone: "Cold Storage",    router: "RTR-001", x: 200, y: 100, status: "online",   rssi: -58, battery: 84 },
  { id: "SEN-003", type: "gas",       zone: "Cold Storage",    router: "RTR-001", x: 155, y: 200, status: "online",   rssi: -61, battery: 77 },
  { id: "SEN-004", type: "vibration", zone: "Cold Storage",    router: "RTR-001", x: 65,  y: 240, status: "online",   rssi: -55, battery: 88 },
  { id: "SEN-005", type: "asset",     zone: "Cold Storage",    router: "RTR-001", x: 240, y: 160, status: "online",   rssi: -49, battery: 95 },
  { id: "SEN-006", type: "temp",      zone: "Assembly Floor",  router: "RTR-002", x: 420, y: 90,  status: "online",   rssi: -60, battery: 72 },
  { id: "SEN-007", type: "vibration", zone: "Assembly Floor",  router: "RTR-002", x: 510, y: 140, status: "online",   rssi: -63, battery: 68 },
  { id: "SEN-008", type: "vibration", zone: "Assembly Floor",  router: "RTR-002", x: 590, y: 80,  status: "online",   rssi: -57, battery: 81 },
  { id: "SEN-009", type: "gas",       zone: "Assembly Floor",  router: "RTR-002", x: 455, y: 210, status: "online",   rssi: -54, battery: 90 },
  { id: "SEN-010", type: "temp",      zone: "Assembly Floor",  router: "RTR-002", x: 555, y: 230, status: "online",   rssi: -66, battery: 63 },
  { id: "SEN-011", type: "asset",     zone: "Assembly Floor",  router: "RTR-002", x: 400, y: 270, status: "online",   rssi: -59, battery: 75 },
  { id: "SEN-042", type: "temp",      zone: "Cold Storage",    router: "RTR-001", x: 130, y: 320, status: "online",   rssi: -55, battery: 87 },
  { id: "SEN-013", type: "gas",       zone: "Loading Bay",     router: "RTR-003", x: 700, y: 150, status: "online",   rssi: -62, battery: 79 },
  { id: "SEN-014", type: "asset",     zone: "Loading Bay",     router: "RTR-003", x: 780, y: 100, status: "online",   rssi: -58, battery: 86 },
  { id: "SEN-015", type: "temp",      zone: "Loading Bay",     router: "RTR-003", x: 740, y: 230, status: "online",   rssi: -70, battery: 55 },
  { id: "SEN-016", type: "vibration", zone: "Loading Bay",     router: "RTR-003", x: 840, y: 180, status: "online",   rssi: -65, battery: 71 },
  { id: "SEN-017", type: "gas",       zone: "Maintenance Bay", router: "RTR-004", x: 430, y: 450, status: "online",   rssi: -53, battery: 93 },
  { id: "SEN-018", type: "vibration", zone: "Maintenance Bay", router: "RTR-004", x: 520, y: 400, status: "online",   rssi: -60, battery: 80 },
  { id: "SEN-019", type: "temp",      zone: "Maintenance Bay", router: "RTR-004", x: 610, y: 490, status: "online",   rssi: -56, battery: 88 },
  { id: "SEN-020", type: "asset",     zone: "Maintenance Bay", router: "RTR-004", x: 700, y: 450, status: "online",   rssi: -67, battery: 64 },
  { id: "SEN-021", type: "temp",      zone: "Maintenance Bay", router: "RTR-004", x: 470, y: 540, status: "online",   rssi: -61, battery: 76 },
  { id: "SEN-022", type: "gas",       zone: "Cold Storage",    router: "RTR-001", x: 220, y: 300, status: "online",   rssi: -54, battery: 89 },
  { id: "SEN-023", type: "asset",     zone: "Assembly Floor",  router: "RTR-002", x: 630, y: 170, status: "online",   rssi: -58, battery: 82 },
  { id: "SEN-024", type: "vibration", zone: "Loading Bay",     router: "RTR-003", x: 800, y: 270, status: "online",   rssi: -63, battery: 70 },
];

const ROUTERS = [
  { id: "RTR-001", zone: "Cold Storage",    x: 160, y: 230, load: 32 },
  { id: "RTR-002", zone: "Assembly Floor",  x: 510, y: 175, load: 68 },
  { id: "RTR-003", zone: "Loading Bay",     x: 760, y: 185, load: 41 },
  { id: "RTR-004", zone: "Maintenance Bay", x: 565, y: 465, load: 28 },
];

const ZONES = [
  { name: "Cold Storage",    x: 20,  y: 50,  w: 300, h: 350, color: "#0ea5e9" },
  { name: "Assembly Floor",  x: 370, y: 50,  w: 290, h: 300, color: "#f59e0b" },
  { name: "Loading Bay",     x: 670, y: 50,  w: 210, h: 300, color: "#8b5cf6" },
  { name: "Maintenance Bay", x: 370, y: 360, w: 390, h: 240, color: "#10b981" },
];

const TYPE_ICONS = { temp: "🌡", vibration: "📳", gas: "💨", asset: "📦" };

const STATUS_COLOR = {
  online:   { dot: "#22c55e", glow: "0 0 8px #22c55e88",  label: "ONLINE"   },
  degraded: { dot: "#f59e0b", glow: "0 0 8px #f59e0b88",  label: "DEGRADED" },
  offline:  { dot: "#ef4444", glow: "0 0 12px #ef444499", label: "OFFLINE"  },
};

// ─── SIMULATION PIPELINE ──────────────────────────────────────────────────────
function buildSimEvents(targetId) {
  const t = Date.now();
  return [
    { t: 0,    agent: "HeartbeatMonitor",   msg: `Patrol cycle started — scanning 24 sensors`, type: "info" },
    { t: 1200, agent: "HeartbeatMonitor",   msg: `${targetId} last_ping delta: 614s — threshold exceeded`, type: "warn" },
    { t: 2000, agent: "HeartbeatMonitor",   msg: `${targetId} flagged OFFLINE (severity: critical)`, type: "error", sensorId: targetId, newStatus: "offline" },
    { t: 3400, agent: "DeadZoneMapper",     msg: `Mapping dead zone around ${targetId}…`, type: "info" },
    { t: 4600, agent: "DeadZoneMapper",     msg: `RSSI on neighboring edges: -71, -74, -68 dBm. Zone isolated.`, type: "info" },
    { t: 6000, agent: "RootCauseAnalyzer",  msg: `Querying LLM — battery:87%, router_load:68%, neighbors:3`, type: "info" },
    { t: 8200, agent: "RootCauseAnalyzer",  msg: `LLM result → cause: ROUTER_OVERLOAD  confidence: 0.91`, type: "success" },
    { t: 9500, agent: "ReroutingAgent",     msg: `RTR-002 load 68% > threshold. Scanning alternates…`, type: "info" },
    { t: 11000,agent: "ReroutingAgent",     msg: `RTR-003 candidate (load 41%). Creating new SignalPath edge.`, type: "info" },
    { t: 12800,agent: "ReroutingAgent",     msg: `${targetId} rerouted via RTR-003. Self-heal SUCCESS ✓`, type: "success", sensorId: targetId, newStatus: "degraded" },
    { t: 14000,agent: "DispatchAgent",      msg: `Self-heal succeeded. No work order required.`, type: "success" },
  ];
}

function buildFailEvents(targetId) {
  return [
    { t: 0,    agent: "HeartbeatMonitor",   msg: `Patrol cycle started — scanning 24 sensors`, type: "info" },
    { t: 1200, agent: "HeartbeatMonitor",   msg: `${targetId} last_ping delta: 7240s — critical`, type: "warn" },
    { t: 2000, agent: "HeartbeatMonitor",   msg: `${targetId} flagged OFFLINE (severity: critical)`, type: "error", sensorId: targetId, newStatus: "offline" },
    { t: 3500, agent: "DeadZoneMapper",     msg: `Dead zone confirmed. 2 neighboring sensors also degraded.`, type: "warn" },
    { t: 5200, agent: "RootCauseAnalyzer",  msg: `Querying LLM — battery:12%, router_load:42%, neighbors:2`, type: "info" },
    { t: 7400, agent: "RootCauseAnalyzer",  msg: `LLM result → cause: BATTERY_DEAD  confidence: 0.97`, type: "success" },
    { t: 8600, agent: "ReroutingAgent",     msg: `Cause BATTERY_DEAD — mesh reroute cannot fix. Skipping.`, type: "warn" },
    { t: 9800, agent: "DispatchAgent",      msg: `Generating work order via LLM…`, type: "info" },
    { t: 12000,agent: "DispatchAgent",      msg: `Work order dispatched to maintenance team ✓`, type: "success", workOrder: true },
  ];
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function AgentBadge({ name }) {
  const colors = {
    HeartbeatMonitor:  "#0ea5e9",
    DeadZoneMapper:    "#8b5cf6",
    RootCauseAnalyzer: "#f59e0b",
    ReroutingAgent:    "#10b981",
    DispatchAgent:     "#ef4444",
  };
  return (
    <span style={{
      fontSize: 10,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      color: colors[name] || "#94a3b8",
      background: (colors[name] || "#94a3b8") + "18",
      border: `1px solid ${(colors[name] || "#94a3b8")}44`,
      borderRadius: 3,
      padding: "1px 6px",
      letterSpacing: "0.04em",
      whiteSpace: "nowrap",
    }}>{name}</span>
  );
}

function LogEntry({ entry, fresh }) {
  const typeStyle = {
    info:    { color: "#94a3b8" },
    warn:    { color: "#f59e0b" },
    error:   { color: "#ef4444" },
    success: { color: "#22c55e" },
  };
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      padding: "7px 0",
      borderBottom: "1px solid #ffffff08",
      opacity: 1,
      animation: fresh ? "fadeSlide 0.3s ease" : "none",
    }}>
      <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", whiteSpace: "nowrap", marginTop: 2 }}>
        {new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>
      <AgentBadge name={entry.agent} />
      <span style={{ fontSize: 12, ...typeStyle[entry.type], lineHeight: 1.5 }}>{entry.msg}</span>
    </div>
  );
}

function SensorNode({ sensor, selected, onClick }) {
  const sc = STATUS_COLOR[sensor.status];
  const r = selected ? 14 : 10;
  return (
    <g
      transform={`translate(${sensor.x}, ${sensor.y})`}
      style={{ cursor: "pointer" }}
      onClick={() => onClick(sensor)}
    >
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
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
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
        x="-22" y="-14"
        width="44" height="28"
        rx="4"
        fill="#1e293b"
        stroke={loadColor}
        strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 4px ${loadColor}66)` }}
      />
      <text textAnchor="middle" dominantBaseline="central" fontSize="14" fill={loadColor} fontFamily="monospace" fontWeight="700">
        📡
      </text>
      <text textAnchor="middle" y="22" fontSize="9" fill={loadColor} fontFamily="monospace" fontWeight="700">
        {router.id}
      </text>
    </g>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function SentinelMesh() {
  const [sensors, setSensors]         = useState(INITIAL_SENSORS);
  const [selected, setSelected]       = useState(null);
  const [log, setLog]                 = useState([]);
  const [freshLog, setFreshLog]       = useState(null);
  const [workOrders, setWorkOrders]   = useState([]);
  const [running, setRunning]         = useState(false);
  const [simMode, setSimMode]         = useState("heal"); // "heal" | "dispatch"
  const logRef = useRef(null);
  const timersRef = useRef([]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function resetSensors() {
    setSensors(INITIAL_SENSORS.map(s => ({ ...s, status: "online" })));
    setLog([]);
    setWorkOrders([]);
    setFreshLog(null);
  }

  function addLog(entry) {
    setLog(prev => [...prev, { ...entry, ts: Date.now() }]);
    setFreshLog(entry.agent + entry.msg);
  }

  function runSimulation() {
    if (running) return;
    resetSensors();
    setRunning(true);

    const targetId = "SEN-042";
    const events = simMode === "heal" ? buildSimEvents(targetId) : buildFailEvents(targetId);

    events.forEach(ev => {
      const tid = setTimeout(() => {
        addLog(ev);

        if (ev.sensorId && ev.newStatus) {
          setSensors(prev =>
            prev.map(s => s.id === ev.sensorId ? { ...s, status: ev.newStatus } : s)
          );
        }

        if (ev.workOrder) {
          setWorkOrders(prev => [{
            id: `WO-${Date.now()}`,
            sensor: targetId,
            cause: "BATTERY_DEAD",
            urgency: "HIGH",
            location: "Cold Storage — Row 3, Bay 2 (near RTR-001)",
            steps: [
              "Locate SEN-042 on the shelf marker (sticker: orange triangle).",
              "Press the side release tab and remove the battery compartment.",
              "Replace with CR123A 3V lithium cell (spare stock: Maintenance Locker B-7).",
              "Hold the reset button for 3 seconds until the LED flashes green.",
              "Confirm sensor re-appears in dashboard within 60 seconds.",
            ],
            ts: Date.now(),
          }, ...prev]);
        }
      }, ev.t);
      timersRef.current.push(tid);
    });

    const totalTime = events[events.length - 1].t + 1500;
    const endTid = setTimeout(() => setRunning(false), totalTime);
    timersRef.current.push(endTid);
  }

  const online   = sensors.filter(s => s.status === "online").length;
  const degraded = sensors.filter(s => s.status === "degraded").length;
  const offline  = sensors.filter(s => s.status === "offline").length;

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const styles = {
    root: {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      background: "#060d1a",
      color: "#e2e8f0",
      minHeight: "100vh",
      display: "grid",
      gridTemplateRows: "56px 1fr",
      gridTemplateColumns: "1fr 320px",
      gridTemplateAreas: `"header header" "map sidebar"`,
      overflow: "hidden",
    },
    header: {
      gridArea: "header",
      background: "#0b1628",
      borderBottom: "1px solid #1e3a5f",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 20,
    },
    logo: {
      fontSize: 18,
      fontWeight: 800,
      letterSpacing: "-0.03em",
      color: "#38bdf8",
      textTransform: "uppercase",
    },
    logoSub: {
      fontSize: 10,
      color: "#475569",
      letterSpacing: "0.15em",
      marginLeft: 2,
    },
    statPill: (color) => ({
      display: "flex", alignItems: "center", gap: 6,
      background: color + "14",
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: "3px 12px",
      fontSize: 12,
      color,
    }),
    mapArea: {
      gridArea: "map",
      position: "relative",
      overflow: "hidden",
      background: "#060d1a",
    },
    sidebar: {
      gridArea: "sidebar",
      background: "#0b1628",
      borderLeft: "1px solid #1e3a5f",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    sectionHead: {
      fontSize: 10,
      letterSpacing: "0.12em",
      color: "#475569",
      fontWeight: 700,
      textTransform: "uppercase",
      padding: "14px 16px 6px",
      borderBottom: "1px solid #1e3a5f",
    },
    simBtn: {
      margin: "12px 16px",
      padding: "10px 0",
      background: running
        ? "#1e293b"
        : "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
      border: "none",
      borderRadius: 6,
      color: running ? "#475569" : "#fff",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.08em",
      cursor: running ? "not-allowed" : "pointer",
      textTransform: "uppercase",
      transition: "all 0.2s",
      fontFamily: "inherit",
    },
    modeToggle: {
      display: "flex",
      margin: "0 16px 8px",
      background: "#0f1f38",
      borderRadius: 6,
      padding: 3,
      gap: 3,
    },
    modeBtn: (active) => ({
      flex: 1,
      padding: "5px 0",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.06em",
      background: active ? "#1e3a5f" : "transparent",
      border: active ? "1px solid #38bdf844" : "1px solid transparent",
      borderRadius: 4,
      color: active ? "#38bdf8" : "#475569",
      cursor: "pointer",
      fontFamily: "inherit",
    }),
    logBox: {
      flex: 1,
      overflowY: "auto",
      padding: "4px 16px",
      scrollbarWidth: "thin",
      scrollbarColor: "#1e3a5f transparent",
    },
    detailBox: {
      borderTop: "1px solid #1e3a5f",
      padding: 16,
      fontSize: 12,
    },
    woBox: {
      maxHeight: 200,
      overflowY: "auto",
      padding: "0 16px 12px",
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
    },
  };

  return (
    <div style={styles.root}>
      {/* ── Global animation keyframe ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        @keyframes fadeSlide { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1e3a5f; border-radius:2px; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={styles.header}>
        <div>
          <span style={styles.logo}>SentinelMesh</span>
          <span style={styles.logoSub}> / AI Dead Zone Hunter</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ ...styles.statPill("#22c55e") }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
          {online} online
        </div>
        <div style={{ ...styles.statPill("#f59e0b") }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
          {degraded} degraded
        </div>
        <div style={{ ...styles.statPill("#ef4444") }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          {offline} offline
        </div>
        <span style={{ fontSize: 11, color: "#334155", marginLeft: 8 }}>
          {new Date().toLocaleTimeString()}
        </span>
      </header>

      {/* ── MAP ── */}
      <main style={styles.mapArea}>
        <svg width="100%" height="100%" viewBox="0 0 900 620" preserveAspectRatio="xMidYMid meet">
          {/* Zone rects */}
          {ZONES.map(z => (
            <g key={z.name}>
              <rect
                x={z.x} y={z.y}
                width={z.w} height={z.h}
                rx="6"
                fill={z.color + "08"}
                stroke={z.color + "44"}
                strokeWidth="1.5"
                strokeDasharray="6,3"
              />
              <text
                x={z.x + 10} y={z.y + 22}
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

          {/* Router nodes */}
          {ROUTERS.map(r => <RouterNode key={r.id} router={r} />)}

          {/* Signal path lines from router to sensors */}
          {sensors.map(s => {
            const router = ROUTERS.find(r => r.id === s.router);
            if (!router) return null;
            const sc = STATUS_COLOR[s.status];
            return (
              <line
                key={s.id + "-line"}
                x1={router.x} y1={router.y}
                x2={s.x} y2={s.y}
                stroke={sc.dot}
                strokeWidth="1"
                strokeOpacity={s.status === "online" ? 0.25 : 0.6}
                strokeDasharray={s.status === "offline" ? "4,4" : "none"}
              />
            );
          })}

          {/* Sensor nodes */}
          {sensors.map(s => (
            <SensorNode
              key={s.id}
              sensor={s}
              selected={selected?.id === s.id}
              onClick={setSelected}
            />
          ))}
        </svg>

        {/* Map legend */}
        <div style={{
          position: "absolute", bottom: 16, left: 16,
          background: "#0b162888",
          backdropFilter: "blur(8px)",
          border: "1px solid #1e3a5f",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex", gap: 16,
          fontSize: 11,
        }}>
          {Object.entries(TYPE_ICONS).map(([t, icon]) => (
            <span key={t} style={{ color: "#94a3b8" }}>{icon} {t}</span>
          ))}
          <span style={{ color: "#334155", margin: "0 4px" }}>|</span>
          <span style={{ color: "#22c55e" }}>● online</span>
          <span style={{ color: "#f59e0b" }}>● degraded</span>
          <span style={{ color: "#ef4444" }}>● offline</span>
          <span style={{ color: "#334155", margin: "0 4px" }}>|</span>
          <span style={{ color: "#64748b" }}>📡 router</span>
        </div>
      </main>

      {/* ── SIDEBAR ── */}
      <aside style={styles.sidebar}>

        {/* Sim controls */}
        <div style={styles.sectionHead}>Simulation</div>
        <div style={styles.modeToggle}>
          <button style={styles.modeBtn(simMode === "heal")}    onClick={() => !running && setSimMode("heal")}>Self-Heal</button>
          <button style={styles.modeBtn(simMode === "dispatch")} onClick={() => !running && setSimMode("dispatch")}>Dispatch</button>
        </div>
        <button style={styles.simBtn} onClick={runSimulation} disabled={running}>
          {running ? "⏳  Agents Running…" : "▶  Simulate Dropout — SEN-042"}
        </button>

        {/* Agent feed */}
        <div style={styles.sectionHead}>Agent Feed</div>
        <div ref={logRef} style={styles.logBox}>
          {log.length === 0 && (
            <div style={{ color: "#334155", fontSize: 11, padding: "12px 0", textAlign: "center" }}>
              No events yet. Run a simulation.
            </div>
          )}
          {log.map((entry, i) => (
            <LogEntry key={i} entry={entry} fresh={freshLog === entry.agent + entry.msg} />
          ))}
        </div>

        {/* Work orders */}
        {workOrders.length > 0 && (
          <>
            <div style={styles.sectionHead}>Work Orders ({workOrders.length})</div>
            <div style={styles.woBox}>
              {workOrders.map(wo => (
                <div key={wo.id} style={styles.woCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>{wo.id}</span>
                    <span style={{ background: "#ef444422", color: "#ef4444", borderRadius: 3, padding: "1px 6px", fontSize: 10 }}>{wo.urgency}</span>
                  </div>
                  <div style={{ color: "#94a3b8", marginBottom: 4 }}>📍 {wo.location}</div>
                  <div style={{ color: "#f59e0b", marginBottom: 6 }}>⚠ {wo.cause}</div>
                  <ol style={{ paddingLeft: 16, color: "#64748b", lineHeight: 1.8 }}>
                    {wo.steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Selected sensor detail */}
        {selected && (
          <div style={styles.detailBox}>
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
              ].map(([k, v]) => (
                <>
                  <span style={{ color: "#475569", fontSize: 11 }}>{k}</span>
                  <span style={{ color: STATUS_COLOR[selected.status].dot, fontSize: 11, fontWeight: 700 }}>{v}</span>
                </>
              ))}
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ marginTop: 10, background: "transparent", border: "1px solid #1e3a5f", borderRadius: 4, color: "#475569", fontSize: 10, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
            >
              CLOSE ✕
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
