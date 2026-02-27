#!/usr/bin/env python3
"""Readable development logger for Autonode walker responses.

Usage examples:
  python backend/dev_api_log.py api_setup
  python backend/dev_api_log.py api_state
  python backend/dev_api_log.py api_state --full-state
  python backend/dev_api_log.py api_simulate_dropout --body '{"sensor_id":"SEN-042"}'
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from typing import Any

import requests


def extract_report(data: Any) -> Any:
    """Normalize Jac walker response shape to the first report payload."""
    if isinstance(data, dict) and isinstance(data.get("reports"), list) and data["reports"]:
        return data["reports"][0]
    return data


def summarize_state(payload: dict[str, Any]) -> dict[str, Any]:
    """Compact summary for api_state responses to keep logs readable."""
    sensors = payload.get("sensors", []) if isinstance(payload, dict) else []
    routers = payload.get("routers", []) if isinstance(payload, dict) else []
    zones = payload.get("zones", []) if isinstance(payload, dict) else []
    status_counts = Counter(
        s.get("status", "unknown")
        for s in sensors
        if isinstance(s, dict)
    )
    return {
        "warehouse": payload.get("warehouse", {}),
        "counts": {
            "zones": len(zones),
            "routers": len(routers),
            "sensors": len(sensors),
        },
        "health": {
            "online": status_counts.get("online", 0),
            "degraded": status_counts.get("degraded", 0),
            "offline": status_counts.get("offline", 0),
            "unknown": status_counts.get("unknown", 0),
        },
    }


def format_for_log(endpoint: str, payload: Any, full_state: bool) -> Any:
    """Keep behavior unchanged while giving readable development logs."""
    if endpoint == "api_state" and not full_state and isinstance(payload, dict):
        return summarize_state(payload)
    return payload


def call_walker(base_url: str, endpoint: str, body: dict[str, Any]) -> Any:
    url = f"{base_url.rstrip('/')}/walker/{endpoint}"
    response = requests.post(url, json=body, timeout=30)
    response.raise_for_status()
    return extract_report(response.json())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Pretty-print Autonode walker responses.")
    parser.add_argument("endpoint", help="Walker endpoint name, e.g. api_state")
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="Backend base URL (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--body",
        default="{}",
        help="JSON body for POST request (default: {})",
    )
    parser.add_argument(
        "--full-state",
        action="store_true",
        help="For api_state, print full payload instead of compact summary.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    body = json.loads(args.body)
    payload = call_walker(args.base_url, args.endpoint, body)
    log_payload = format_for_log(args.endpoint, payload, args.full_state)
    print(json.dumps(log_payload, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
