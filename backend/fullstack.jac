"""Autonode fullstack Jac entrypoint (API walkers + frontend app)."""

import from server {
  api_setup, api_state, api_ingest, api_heartbeat, api_simulate_dropout,
  api_run_pipeline, api_diagnose, api_dispatch, api_business_metrics,
  api_notification_health, api_reset
}

cl import from './frontend_app.jac' { app as FrontendApp }

cl {
  def:pub app() {
    return <FrontendApp />;
  }
}
