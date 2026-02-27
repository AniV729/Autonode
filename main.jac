"""
SentinelMesh — Core module
"""

node Warehouse {
    has name: str;
    has facility_id: str;
}

node Zone {
    has name: str;
    has zone_type: str;
    has x: float = 0.0;
    has y: float = 0.0;
    has w: float = 0.0;
    has h: float = 0.0;
    has color: str = "#0ea5e9";
}

node Router {
    has router_id: str;
    has ip: str;
    has zone: str;
    has load: int = 0;
    has x: float = 0.0;
    has y: float = 0.0;
}

node Sensor {
    has sensor_id: str;
    has sensor_type: str;
    has zone: str;
    has router: str;
    has x: float = 0.0;
    has y: float = 0.0;
    has status: str = "online";
    has rssi: int = -50;
    has battery: int = 100;
    has last_ping: float = 0.0;
    has location_desc: str = "";
}

edge ZoneLink {}
edge RouterLink {}
edge MeshLink {
    has rssi: int = -60;
    has hop_count: int = 1;
}
edge SignalPath {
    has rssi: int = -50;
    has latency_ms: float = 10.0;
}

walker HeartbeatMonitor {
    has alerts: list = [];
    has threshold_seconds: int = 60;
    has stats: dict = {};

    can start with `root entry {
        self.alerts = [];
        self.stats = {"total": 0, "online": 0, "degraded": 0, "offline": 0};
        visit [-->];
    }

    can go_on with Warehouse entry { visit [-->]; }
    can go_zone with Zone entry { visit [-->]; }
    can go_router with Router entry { visit [-->]; }

    can check with Sensor entry {
        self.stats["total"] += 1;
        elapsed = 9999999999.0 - here.last_ping;

        if elapsed > self.threshold_seconds * 2 {
            here.status = "offline";
            self.stats["offline"] += 1;
            self.alerts.append({
                "sensor_id": here.sensor_id,
                "type": here.sensor_type,
                "zone": here.zone,
                "elapsed": int(elapsed),
                "severity": "critical",
                "rssi": here.rssi,
                "battery": here.battery,
                "location": here.location_desc
            });
        } elif elapsed > self.threshold_seconds {
            here.status = "degraded";
            self.stats["degraded"] += 1;
            self.alerts.append({
                "sensor_id": here.sensor_id,
                "type": here.sensor_type,
                "zone": here.zone,
                "elapsed": int(elapsed),
                "severity": "warning",
                "rssi": here.rssi,
                "battery": here.battery,
                "location": here.location_desc
            });
        } else {
            here.status = "online";
            self.stats["online"] += 1;
        }
    }
}

walker DeadZoneMapper {
    has target_sensor_id: str;
    has dead_zone: list = [];
    has affected_area: dict = {};

    can start with `root entry {
        self.dead_zone = [];
        self.affected_area = {};
        visit [-->];
    }

    can go_on with Warehouse entry { visit [-->]; }
    can go_zone with Zone entry { visit [-->]; }
    can go_router with Router entry { visit [-->]; }

    can map_sensor with Sensor entry {
        if here.sensor_id == self.target_sensor_id or here.status != "online" {
            self.dead_zone.append({
                "sensor_id": here.sensor_id,
                "status": here.status,
                "rssi": here.rssi,
                "type": here.sensor_type,
                "zone": here.zone,
                "x": here.x,
                "y": here.y
            });
        }
        if len(self.dead_zone) > 0 {
            self.affected_area = {
                "dead_sensors": len(self.dead_zone),
                "is_spreading": len(self.dead_zone) > 1,
                "sensor_ids": [s["sensor_id"] for s in self.dead_zone]
            };
        }
    }
}

walker RootCauseAnalyzer {
    has target_sensor_id: str;
    has diagnosis: dict = {};

    can start with `root entry {
        self.diagnosis = {};
        visit [-->];
    }

    can go_on with Warehouse entry { visit [-->]; }
    can go_zone with Zone entry { visit [-->]; }
    can go_router with Router entry { visit [-->]; }

    can analyze with Sensor entry {
        if here.sensor_id == self.target_sensor_id {
            cause = "HARDWARE_FAULT";
            confidence = 0.60;
            action = "Inspect sensor hardware on-site";

            if here.battery < 20 {
                cause = "BATTERY_DEAD";
                confidence = 0.97;
                action = "Replace sensor battery immediately";
            } elif here.rssi < -80 {
                cause = "PHYSICAL_OBSTRUCTION";
                confidence = 0.78;
                action = "Check for obstructions between sensor and router";
            }

            self.diagnosis = {
                "sensor_id": here.sensor_id,
                "sensor_type": here.sensor_type,
                "zone": here.zone,
                "location": here.location_desc,
                "cause": cause,
                "confidence": confidence,
                "recommended_action": action,
                "router_id": here.router,
                "router_load": 0,
                "battery": here.battery,
                "rssi": here.rssi
            };
        }
    }
}

walker ReroutingAgent {
    has target_sensor_id: str;
    has success: bool = False;
    has reroute_details: dict = {};

    can start with `root entry {
        self.success = False;
        self.reroute_details = {};
        visit [-->];
    }

    can go_on with Warehouse entry { visit [-->]; }
    can go_zone with Zone entry { visit [-->]; }

    can find_route with Router entry {
        for s in [-->] {
            if s.sensor_id == self.target_sensor_id {
                here.load += 5;
                s.status = "degraded";
                s.rssi = -70;
                self.success = True;
                self.reroute_details = {
                    "sensor_id": self.target_sensor_id,
                    "new_router": here.router_id,
                    "new_rssi": -70
                };
            }
        }
    }
}

walker DispatchAgent {
    has diagnosis: dict = {};
    has webhook_url: str = "";
    has work_order: str = "";
    has order_sent: bool = False;

    can start with `root entry {
        diag = self.diagnosis;
        urgency = "CRITICAL" if diag.get("cause") in ["BATTERY_DEAD", "HARDWARE_FAULT"] else "HIGH";

        self.work_order = (
            "========================================\n"
            "SENTINELMESH WORK ORDER\n"
            "========================================\n"
            f"Urgency:  {urgency}\n"
            f"Sensor:   {diag.get('sensor_id', 'N/A')} ({diag.get('sensor_type', 'N/A')})\n"
            f"Zone:     {diag.get('zone', 'N/A')}\n"
            f"Location: {diag.get('location', 'N/A')}\n"
            f"Router:   {diag.get('router_id', 'N/A')}\n"
            f"Failure:  {diag.get('cause', 'UNKNOWN')}\n"
            f"Action:   {diag.get('recommended_action', 'Inspect sensor.')}\n"
            "========================================"
        );

        report {
            "work_order": self.work_order,
            "sensor_id": diag.get("sensor_id", "unknown"),
            "order_sent": False
        };
    }
}

walker run_pipeline {
    has webhook_url: str = "";
    has results: dict = {};

    can start with `root entry {
        results = {
            "alerts": [],
            "diagnoses": [],
            "reroutes": [],
            "work_orders": [],
            "stats": {}
        };

        monitor = root spawn HeartbeatMonitor();
        results["alerts"] = monitor.alerts;
        results["stats"] = monitor.stats;

        for alert in monitor.alerts {
            if alert["severity"] in ["warning", "critical"] {
                sid = alert["sensor_id"];
                diagnoser = root spawn RootCauseAnalyzer(sid);
                results["diagnoses"].append(diagnoser.diagnosis);

                auto_fixable = ["ROUTER_OVERLOAD", "NETWORK_CONGESTION"];
                if diagnoser.diagnosis.get("cause") in auto_fixable {
                    rerouter = root spawn ReroutingAgent(sid);
                    results["reroutes"].append(rerouter.reroute_details);
                    if not rerouter.success {
                        dispatcher = root spawn DispatchAgent(diagnoser.diagnosis);
                        results["work_orders"].append(dispatcher.work_order);
                    }
                } else {
                    dispatcher = root spawn DispatchAgent(diagnoser.diagnosis);
                    results["work_orders"].append(dispatcher.work_order);
                }
            }
        }

        self.results = results;
        report results;
    }
}

walker simulate_dropout {
    has target_sensor_id: str;
    has done: bool = False;

    can start with `root entry { visit [-->]; }
    can go_on with Warehouse entry { visit [-->]; }
    can go_zone with Zone entry { visit [-->]; }
    can go_router with Router entry { visit [-->]; }

    can trigger with Sensor entry {
        if here.sensor_id == self.target_sensor_id {
            here.last_ping = 1000.0;
            here.rssi = -95;
            self.done = True;
        }
    }
}

walker reset_sensors {
    has count: int = 0;

    can start with `root entry { self.count = 0; visit [-->]; }
    can go_on with Warehouse entry { visit [-->]; }
    can go_zone with Zone entry { visit [-->]; }
    can go_router with Router entry { visit [-->]; }

    can reset with Sensor entry {
        here.last_ping = 9999999999.0;
        here.status = "online";
        if here.rssi < -60 {
            here.rssi = -55;
        }
        self.count += 1;
    }
}

walker get_graph_state {
    has warehouse_data: dict = {};
    has zones_data: list = [];
    has routers_data: list = [];
    has sensors_data: list = [];

    can start with `root entry { visit [-->]; }

    can read_wh with Warehouse entry {
        self.warehouse_data = {"name": here.name, "facility_id": here.facility_id};
        visit [-->];
    }

    can read_zone with Zone entry {
        self.zones_data.append({
            "name": here.name, "zone_type": here.zone_type,
            "x": here.x, "y": here.y, "w": here.w, "h": here.h,
            "color": here.color
        });
        visit [-->];
    }

    can read_router with Router entry {
        self.routers_data.append({
            "router_id": here.router_id, "ip": here.ip,
            "zone": here.zone, "load": here.load,
            "x": here.x, "y": here.y
        });
        visit [-->];
    }

    can read_sensor with Sensor entry {
        self.sensors_data.append({
            "id": here.sensor_id,
            "type": here.sensor_type,
            "zone": here.zone,
            "router": here.router,
            "x": here.x,
            "y": here.y,
            "status": here.status,
            "rssi": here.rssi,
            "battery": here.battery,
            "last_ping": here.last_ping,
            "location_desc": here.location_desc
        });
    }
}

walker debug_root {
    can start with entry {
        neighbors = [-->];
        print(f"Root has {len(neighbors)} neighbors");
        for n in neighbors {
            print(f"  neighbor: {n}");
        }
    }
}

