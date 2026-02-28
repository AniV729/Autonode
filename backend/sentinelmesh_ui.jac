walker:pub ui_main {
    can start with entry {
        emit "<!doctype html><html><head><meta charset='utf-8' /><meta name='viewport' content='width=device-width,initial-scale=1' /><title>SentinelMesh (Jac UI)</title><link rel='stylesheet' href='/static/ui.css' /></head><body><div id='app'><div id='sidebar'><h2>SentinelMesh</h2><div><button id='btn-refresh'>Refresh</button><button id='btn-reset'>Reset</button></div><h3>Agents</h3><ul id='agents-list'><li>HeartbeatMonitor</li><li>DeadZoneMapper</li><li>RootCauseAnalyzer</li><li>ReroutingAgent</li><li>DispatchAgent</li></ul><h3>Log</h3><div id='log' style='max-height:40vh; overflow:auto'></div><h3>Work Orders</h3><div id='workorders'></div></div><div id='main'><h3>Map</h3><div id='map-root'></div></div></div><script src='/static/index.js'></script></body></html>";
    }
}

walker:pub ui_refresh {
    can start with entry {
        report { "status": "ok" };
    }
}

walker:pub run_incident {
    has sensor_id: str = "";
    has failure_key: str = "";
    can start with entry {
        
        report { "status": "queued", "sensor": self.sensor_id, "failure": self.failure_key };
    }
}

walker:pub reset_ui {
    has reset_metrics: bool = False;
    can start with entry {
        
        report { "status": "reset_requested", "metrics": self.reset_metrics };
    }
}

walker:pub add_log {
    has message: str = "";
    can start with entry {
        report { "status": "logged", "message": self.message };
    }
}

walker:pub record_incident {
    has sensor_id: str = "";
    has details: dict = {};
    can start with entry {
        report { "status": "incident_recorded", "sensor_id": self.sensor_id, "details": self.details };
    }
}
