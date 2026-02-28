"""
Autonode frontend entry (Jac `cl` module).

Capabilities preserved via this Jac frontend module:
- Existing full dashboard UI (factory map + right panel tabs)
- Controls / Resets / Data / Agents / Work flows
- Simulation controls, logs, work orders, sensor details, KPI panel
- Backend API walker integration already used by the UI

TODO for native-Jac-only UI internals:
- Rewrite current imported React component into pure Jac `cl` source (no JS import)
- Port styling/state helpers into Jac-native syntax in incremental slices
- Add Jac frontend tests for tab states and simulation action locking
"""

cl import from '../frontend/src/App.js' { default as LegacyApp }

cl {
  def:pub app() {
    return <LegacyApp />;
  }
}
