"""
Autonode - REST API Server
"""

import time;
import automation_runtime;

import from main {
    Warehouse, Zone, Router, Sensor,
    HeartbeatMonitor, RootCauseAnalyzer, DispatchAgent,
    run_pipeline, simulate_dropout, reset_sensors, get_graph_state
}

walker:pub api_setup {
    has facility_name: str = "Meridian Industrial Campus";

    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        t = time.time();
        existing_wh = 0;
        existing_zones = 0;
        existing_routers = 0;
        existing_sensors = 0;

        for wh in [-->] {
            existing_wh += 1;
            for zone in [wh -->] {
                existing_zones += 1;
                for router in [zone -->] {
                    existing_routers += 1;
                    for _sensor in [router -->] {
                        existing_sensors += 1;
                    }
                }
            }
        }

        if existing_wh > 0 {
            report {
                "status": "already_initialized",
                "zones": existing_zones,
                "routers": existing_routers,
                "sensors": existing_sensors,
                "business_metrics": automation_runtime.get_metrics()
            };
            return;
        }

        wh = Warehouse("Meridian Industrial Campus", "FAC-007");
        here ++> wh;

        cold = Zone("Cold Storage", "refrigerated", 20.0, 50.0, 300.0, 350.0, "#0ea5e9");
        assy = Zone("Assembly Floor", "production", 370.0, 50.0, 290.0, 300.0, "#f59e0b");
        load = Zone("Loading Bay", "loading", 670.0, 50.0, 210.0, 300.0, "#8b5cf6");
        maint = Zone("Maintenance Bay", "maintenance", 370.0, 360.0, 390.0, 240.0, "#10b981");

        wh ++> cold;
        wh ++> assy;
        wh ++> load;
        wh ++> maint;

        r1 = Router("RTR-001", "192.168.1.1", "Cold Storage", 32, 160.0, 230.0);
        r2 = Router("RTR-002", "192.168.2.1", "Assembly Floor", 68, 510.0, 175.0);
        r3 = Router("RTR-003", "192.168.3.1", "Loading Bay", 41, 760.0, 185.0);
        r4 = Router("RTR-004", "192.168.4.1", "Maintenance Bay", 28, 565.0, 465.0);

        cold ++> r1;
        assy ++> r2;
        load ++> r3;
        maint ++> r4;

        s001 = Sensor("SEN-001", "temp", "Cold Storage", "RTR-001", 100.0, 130.0, "online", -52, 91, t, "Cold Storage Row 1 Bay 1");
        s002 = Sensor("SEN-002", "temp", "Cold Storage", "RTR-001", 200.0, 100.0, "online", -58, 84, t, "Cold Storage Row 1 Bay 3");
        s003 = Sensor("SEN-003", "gas", "Cold Storage", "RTR-001", 155.0, 200.0, "online", -61, 77, t, "Cold Storage Row 2 Bay 2");
        s004 = Sensor("SEN-004", "vibration", "Cold Storage", "RTR-001", 65.0, 240.0, "online", -55, 88, t, "Cold Storage Compressor Unit A");
        s005 = Sensor("SEN-005", "asset", "Cold Storage", "RTR-001", 240.0, 160.0, "online", -49, 95, t, "Cold Storage Pallet Tracker Aisle 3");
        s042 = Sensor("SEN-042", "temp", "Cold Storage", "RTR-001", 130.0, 320.0, "online", -55, 87, t, "Cold Storage Row 3 Bay 2");
        s022 = Sensor("SEN-022", "gas", "Cold Storage", "RTR-001", 220.0, 300.0, "online", -54, 89, t, "Cold Storage Row 3 Bay 4");

        r1 ++> s001;
        r1 ++> s002;
        r1 ++> s003;
        r1 ++> s004;
        r1 ++> s005;
        r1 ++> s042;
        r1 ++> s022;

        s006 = Sensor("SEN-006", "temp", "Assembly Floor", "RTR-002", 420.0, 90.0, "online", -60, 72, t, "Assembly Floor Welding Station A");
        s007 = Sensor("SEN-007", "vibration", "Assembly Floor", "RTR-002", 510.0, 140.0, "online", -63, 68, t, "Assembly Floor CNC Machine 1");
        s008 = Sensor("SEN-008", "vibration", "Assembly Floor", "RTR-002", 590.0, 80.0, "online", -57, 81, t, "Assembly Floor CNC Machine 2");
        s009 = Sensor("SEN-009", "gas", "Assembly Floor", "RTR-002", 455.0, 210.0, "online", -54, 90, t, "Assembly Floor Paint Booth");
        s010 = Sensor("SEN-010", "temp", "Assembly Floor", "RTR-002", 555.0, 230.0, "online", -66, 63, t, "Assembly Floor HVAC Duct 3");
        s011 = Sensor("SEN-011", "asset", "Assembly Floor", "RTR-002", 400.0, 270.0, "online", -59, 75, t, "Assembly Floor Forklift 2 Tracker");
        s023 = Sensor("SEN-023", "asset", "Assembly Floor", "RTR-002", 630.0, 170.0, "online", -58, 82, t, "Assembly Floor Tool Cart Alpha");

        r2 ++> s006;
        r2 ++> s007;
        r2 ++> s008;
        r2 ++> s009;
        r2 ++> s010;
        r2 ++> s011;
        r2 ++> s023;

        s013 = Sensor("SEN-013", "gas", "Loading Bay", "RTR-003", 700.0, 150.0, "online", -62, 79, t, "Loading Bay Dock 1 Gas Detector");
        s014 = Sensor("SEN-014", "asset", "Loading Bay", "RTR-003", 780.0, 100.0, "online", -58, 86, t, "Loading Bay Dock 2 Door Sensor");
        s015 = Sensor("SEN-015", "temp", "Loading Bay", "RTR-003", 740.0, 230.0, "online", -70, 55, t, "Loading Bay Receiving Area Temp");
        s016 = Sensor("SEN-016", "vibration", "Loading Bay", "RTR-003", 840.0, 180.0, "online", -65, 71, t, "Loading Bay Conveyor Motor");
        s024 = Sensor("SEN-024", "vibration", "Loading Bay", "RTR-003", 800.0, 270.0, "online", -63, 70, t, "Loading Bay Lift Gate Sensor");

        r3 ++> s013;
        r3 ++> s014;
        r3 ++> s015;
        r3 ++> s016;
        r3 ++> s024;

        s017 = Sensor("SEN-017", "gas", "Maintenance Bay", "RTR-004", 430.0, 450.0, "online", -53, 93, t, "Maintenance Bay Welding Gas Monitor");
        s018 = Sensor("SEN-018", "vibration", "Maintenance Bay", "RTR-004", 520.0, 400.0, "online", -60, 80, t, "Maintenance Bay Lathe 1");
        s019 = Sensor("SEN-019", "temp", "Maintenance Bay", "RTR-004", 610.0, 490.0, "online", -56, 88, t, "Maintenance Bay Parts Oven Temp");
        s020 = Sensor("SEN-020", "asset", "Maintenance Bay", "RTR-004", 700.0, 450.0, "online", -67, 64, t, "Maintenance Bay Tool Cage Tracker");
        s021 = Sensor("SEN-021", "temp", "Maintenance Bay", "RTR-004", 470.0, 540.0, "online", -61, 76, t, "Maintenance Bay HVAC Return Duct");

        r4 ++> s017;
        r4 ++> s018;
        r4 ++> s019;
        r4 ++> s020;
        r4 ++> s021;

        automation_runtime.reset(True);
        report {
            "status": "initialized",
            "zones": 4,
            "routers": 4,
            "sensors": 24,
            "business_metrics": automation_runtime.get_metrics()
        };
    }
}

walker:pub api_state {
    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        snap = root spawn get_graph_state();
        report {
            "warehouse": snap.warehouse_data,
            "zones": snap.zones_data,
            "routers": snap.routers_data,
            "sensors": snap.sensors_data,
            "business_metrics": automation_runtime.get_metrics()
        };
    }
}

walker:pub api_ingest {
    has sensor_id: str = "SEN-042";
    has battery: int = -1;
    has rssi: int = 0;
    has status: str = "";
    has router: str = "";
    has source: str = "device";
    has last_ping: float = 0.0;
    has auto_run: bool = True;

    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        updated = {};
        found = False;
        ping_ts = self.last_ping if self.last_ping > 0.0 else time.time();

        for wh in [-->] {
            for zone in [wh -->] {
                for router in [zone -->] {
                    for sensor in [router -->] {
                        if sensor.sensor_id == self.sensor_id {
                            found = True;

                            if self.battery >= 0 {
                                sensor.battery = self.battery;
                            }
                            if self.rssi != 0 {
                                sensor.rssi = self.rssi;
                            }
                            if self.router != "" {
                                sensor.router = self.router;
                            }

                            sensor.last_ping = ping_ts;
                            sensor.status = self.status if self.status != "" else "online";

                            updated = {
                                "sensor_id": sensor.sensor_id,
                                "type": sensor.sensor_type,
                                "zone": sensor.zone,
                                "router": sensor.router,
                                "status": sensor.status,
                                "rssi": sensor.rssi,
                                "battery": sensor.battery,
                                "last_ping": sensor.last_ping
                            };
                        }
                    }
                }
            }
        }

        if not found {
            report {
                "status": "sensor_not_found",
                "sensor_id": self.sensor_id,
                "business_metrics": automation_runtime.get_metrics()
            };
            return;
        }

        automation_runtime.record_ingest({
            "sensor_id": self.sensor_id,
            "source": self.source,
            "status": updated.get("status", "online"),
            "rssi": updated.get("rssi", 0),
            "battery": updated.get("battery", 0),
            "received_at": ping_ts
        });

        if self.auto_run {
            pipeline = root spawn run_pipeline();
            handled = automation_runtime.handle_pipeline_results(pipeline.results, self.source);
            report {
                "status": "ingested",
                "sensor": updated,
                "pipeline": handled.get("results", {}),
                "business_metrics": handled.get("business_metrics", automation_runtime.get_metrics())
            };
            return;
        }

        report {
            "status": "ingested",
            "sensor": updated,
            "pipeline": {},
            "business_metrics": automation_runtime.get_metrics()
        };
    }
}

walker:pub api_heartbeat {
    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        monitor = root spawn HeartbeatMonitor();
        metrics = automation_runtime.record_heartbeat(monitor.alerts, monitor.stats);
        report {
            "alerts": monitor.alerts,
            "total": len(monitor.alerts),
            "stats": monitor.stats,
            "business_metrics": metrics
        };
    }
}

walker:pub api_simulate_dropout {
    has sensor_id: str = "SEN-042";
    has auto_run: bool = True;

    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        root spawn simulate_dropout(self.sensor_id);
        automation_runtime.record_ingest({
            "sensor_id": self.sensor_id,
            "source": "simulator",
            "status": "offline",
            "received_at": time.time()
        });

        if self.auto_run {
            pipeline = root spawn run_pipeline();
            handled = automation_runtime.handle_pipeline_results(pipeline.results, "simulator");
            report {
                "status": "dropout_simulated",
                "sensor_id": self.sensor_id,
                "pipeline": handled.get("results", {}),
                "business_metrics": handled.get("business_metrics", automation_runtime.get_metrics())
            };
            return;
        }

        report {
            "status": "dropout_simulated",
            "sensor_id": self.sensor_id,
            "pipeline": {},
            "business_metrics": automation_runtime.get_metrics()
        };
    }
}

walker:pub api_run_pipeline {
    has source: str = "manual";

    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        pipeline = root spawn run_pipeline();
        handled = automation_runtime.handle_pipeline_results(pipeline.results, self.source);
        report {
            "status": "pipeline_completed",
            "source": self.source,
            "results": handled.get("results", {}),
            "business_metrics": handled.get("business_metrics", automation_runtime.get_metrics())
        };
    }
}

walker:pub api_diagnose {
    has sensor_id: str = "SEN-042";

    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        diagnoser = root spawn RootCauseAnalyzer(self.sensor_id);
        report diagnoser.diagnosis;
    }
}

walker:pub api_dispatch {
    has sensor_id: str = "SEN-042";

    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        diagnoser = root spawn RootCauseAnalyzer(self.sensor_id);
        if len(diagnoser.diagnosis) == 0 {
            report {"status": "sensor_not_found", "sensor_id": self.sensor_id};
            return;
        }

        dispatcher = root spawn DispatchAgent(diagnoser.diagnosis);
        delivery = automation_runtime.deliver_work_order(dispatcher.work_order_data);
        report {
            "sensor_id": self.sensor_id,
            "diagnosis": diagnoser.diagnosis,
            "work_order": dispatcher.work_order_data,
            "delivery": delivery,
            "business_metrics": automation_runtime.get_metrics()
        };
    }
}

walker:pub api_business_metrics {
    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        report automation_runtime.get_metrics();
    }
}

walker:pub api_notification_health {
    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        report automation_runtime.notification_health();
    }
}

walker:pub api_reset {
    has reset_metrics: bool = False;

    obj __specs__ {
        static has auth: bool = True;
    }

    can start with entry {
        resetter = root spawn reset_sensors();
        automation_runtime.reset(self.reset_metrics);
        report {
            "status": "reset",
            "sensors_reset": resetter.count,
            "metrics_reset": self.reset_metrics,
            "business_metrics": automation_runtime.get_metrics()
        };
    }
}
