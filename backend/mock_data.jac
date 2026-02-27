"""
autonode — Mock Data Seeder
"""

import from main { Warehouse, Zone, Router, Sensor }

walker setup_warehouse {
    has facility_name: str = "Meridian Industrial Campus";

    can build with entry {
        t = 9999999999.0;

        wh = Warehouse("Meridian Industrial Campus", "FAC-007");
        root ++> wh;

        cold  = Zone("Cold Storage",    "refrigerated", 20.0,  50.0,  300.0, 350.0, "#0ea5e9");
        assy  = Zone("Assembly Floor",  "production",   370.0, 50.0,  290.0, 300.0, "#f59e0b");
        load  = Zone("Loading Bay",     "loading",      670.0, 50.0,  210.0, 300.0, "#8b5cf6");
        maint = Zone("Maintenance Bay", "maintenance",  370.0, 360.0, 390.0, 240.0, "#10b981");

        wh ++> cold; wh ++> assy; wh ++> load; wh ++> maint;

        r1 = Router("RTR-001", "192.168.1.1", "Cold Storage",    32, 160.0, 230.0);
        r2 = Router("RTR-002", "192.168.2.1", "Assembly Floor",  68, 510.0, 175.0);
        r3 = Router("RTR-003", "192.168.3.1", "Loading Bay",     41, 760.0, 185.0);
        r4 = Router("RTR-004", "192.168.4.1", "Maintenance Bay", 28, 565.0, 465.0);

        cold ++> r1; assy ++> r2; load ++> r3; maint ++> r4;

        s001 = Sensor("SEN-001", "temp",      "Cold Storage", "RTR-001", 100.0, 130.0, "online", -52, 91, t, "Cold Storage Row 1 Bay 1");
        s002 = Sensor("SEN-002", "temp",      "Cold Storage", "RTR-001", 200.0, 100.0, "online", -58, 84, t, "Cold Storage Row 1 Bay 3");
        s003 = Sensor("SEN-003", "gas",       "Cold Storage", "RTR-001", 155.0, 200.0, "online", -61, 77, t, "Cold Storage Row 2 Bay 2");
        s004 = Sensor("SEN-004", "vibration", "Cold Storage", "RTR-001", 65.0,  240.0, "online", -55, 88, t, "Cold Storage Compressor Unit A");
        s005 = Sensor("SEN-005", "asset",     "Cold Storage", "RTR-001", 240.0, 160.0, "online", -49, 95, t, "Cold Storage Pallet Tracker Aisle 3");
        s042 = Sensor("SEN-042", "temp",      "Cold Storage", "RTR-001", 130.0, 320.0, "online", -55, 87, t, "Cold Storage Row 3 Bay 2");
        s022 = Sensor("SEN-022", "gas",       "Cold Storage", "RTR-001", 220.0, 300.0, "online", -54, 89, t, "Cold Storage Row 3 Bay 4");

        r1 ++> s001; r1 ++> s002; r1 ++> s003; r1 ++> s004;
        r1 ++> s005; r1 ++> s042; r1 ++> s022;

        s006 = Sensor("SEN-006", "temp",      "Assembly Floor", "RTR-002", 420.0, 90.0,  "online", -60, 72, t, "Assembly Floor Welding Station A");
        s007 = Sensor("SEN-007", "vibration", "Assembly Floor", "RTR-002", 510.0, 140.0, "online", -63, 68, t, "Assembly Floor CNC Machine 1");
        s008 = Sensor("SEN-008", "vibration", "Assembly Floor", "RTR-002", 590.0, 80.0,  "online", -57, 81, t, "Assembly Floor CNC Machine 2");
        s009 = Sensor("SEN-009", "gas",       "Assembly Floor", "RTR-002", 455.0, 210.0, "online", -54, 90, t, "Assembly Floor Paint Booth");
        s010 = Sensor("SEN-010", "temp",      "Assembly Floor", "RTR-002", 555.0, 230.0, "online", -66, 63, t, "Assembly Floor HVAC Duct 3");
        s011 = Sensor("SEN-011", "asset",     "Assembly Floor", "RTR-002", 400.0, 270.0, "online", -59, 75, t, "Assembly Floor Forklift 2 Tracker");
        s023 = Sensor("SEN-023", "asset",     "Assembly Floor", "RTR-002", 630.0, 170.0, "online", -58, 82, t, "Assembly Floor Tool Cart Alpha");

        r2 ++> s006; r2 ++> s007; r2 ++> s008; r2 ++> s009;
        r2 ++> s010; r2 ++> s011; r2 ++> s023;

        s013 = Sensor("SEN-013", "gas",       "Loading Bay", "RTR-003", 700.0, 150.0, "online", -62, 79, t, "Loading Bay Dock 1 Gas Detector");
        s014 = Sensor("SEN-014", "asset",     "Loading Bay", "RTR-003", 780.0, 100.0, "online", -58, 86, t, "Loading Bay Dock 2 Door Sensor");
        s015 = Sensor("SEN-015", "temp",      "Loading Bay", "RTR-003", 740.0, 230.0, "online", -70, 55, t, "Loading Bay Receiving Area Temp");
        s016 = Sensor("SEN-016", "vibration", "Loading Bay", "RTR-003", 840.0, 180.0, "online", -65, 71, t, "Loading Bay Conveyor Motor");
        s024 = Sensor("SEN-024", "vibration", "Loading Bay", "RTR-003", 800.0, 270.0, "online", -63, 70, t, "Loading Bay Lift Gate Sensor");

        r3 ++> s013; r3 ++> s014; r3 ++> s015; r3 ++> s016; r3 ++> s024;

        s017 = Sensor("SEN-017", "gas",       "Maintenance Bay", "RTR-004", 430.0, 450.0, "online", -53, 93, t, "Maintenance Bay Welding Gas Monitor");
        s018 = Sensor("SEN-018", "vibration", "Maintenance Bay", "RTR-004", 520.0, 400.0, "online", -60, 80, t, "Maintenance Bay Lathe 1");
        s019 = Sensor("SEN-019", "temp",      "Maintenance Bay", "RTR-004", 610.0, 490.0, "online", -56, 88, t, "Maintenance Bay Parts Oven Temp");
        s020 = Sensor("SEN-020", "asset",     "Maintenance Bay", "RTR-004", 700.0, 450.0, "online", -67, 64, t, "Maintenance Bay Tool Cage Tracker");
        s021 = Sensor("SEN-021", "temp",      "Maintenance Bay", "RTR-004", 470.0, 540.0, "online", -61, 76, t, "Maintenance Bay HVAC Return Duct");

        r4 ++> s017; r4 ++> s018; r4 ++> s019; r4 ++> s020; r4 ++> s021;

        report {
            "status": "graph_initialized",
            "zones": 4,
            "routers": 4,
            "sensors": 24
        };
    }
}