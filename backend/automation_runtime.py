"""In-memory automation state with bounded retention."""

from __future__ import annotations

import copy
import os
import time
from collections import deque
from typing import Any, Deque, Dict, List

import notify

MAX_EVENTS = int(os.getenv("AUTONODE_MAX_EVENT_HISTORY", "400"))
MAX_WORK_ORDERS = int(os.getenv("AUTONODE_MAX_WORK_ORDER_HISTORY", "150"))

_events: Deque[Dict[str, Any]] = deque(maxlen=MAX_EVENTS)
_work_orders: Deque[Dict[str, Any]] = deque(maxlen=MAX_WORK_ORDERS)

_totals: Dict[str, Any] = {
    "events_ingested": 0,
    "heartbeat_runs": 0,
    "incidents_total": 0,
    "auto_healed": 0,
    "dispatches_created": 0,
    "dispatches_sent": 0,
    "dispatches_avoided": 0,
    "estimated_savings_usd": 0.0,
    "last_updated_at": 0.0,
}


def _snapshot() -> Dict[str, Any]:
    return {
        **_totals,
        "recent_events": list(_events),
        "recent_work_orders": list(_work_orders),
        "event_retention_limit": MAX_EVENTS,
        "work_order_retention_limit": MAX_WORK_ORDERS,
    }


def _touch() -> None:
    _totals["last_updated_at"] = time.time()


def _normalize_work_order(wo: Any, index: int = 0) -> Dict[str, Any]:
    if isinstance(wo, dict):
        out = dict(wo)
        out.setdefault("id", f"WO-{int(time.time() * 1000)}-{index}")
        out.setdefault("urgency", "HIGH")
        return out
    return {
        "id": f"WO-{int(time.time() * 1000)}-{index}",
        "urgency": "HIGH",
        "summary": str(wo),
        "sensor_id": "unknown",
        "cause": "UNKNOWN",
        "recommended_action": str(wo),
    }


def record_ingest(event: Dict[str, Any]) -> Dict[str, Any]:
    _totals["events_ingested"] += 1
    payload = dict(event)
    payload.setdefault("event_type", "ingest")
    payload.setdefault("received_at", time.time())
    _events.append(payload)
    _touch()
    return _snapshot()


def record_heartbeat(alerts: List[Dict[str, Any]], stats: Dict[str, Any]) -> Dict[str, Any]:
    _totals["heartbeat_runs"] += 1
    _events.append(
        {
            "event_type": "heartbeat",
            "alerts": len(alerts or []),
            "stats": dict(stats or {}),
            "received_at": time.time(),
        }
    )
    _touch()
    return _snapshot()


def deliver_work_order(work_order: Dict[str, Any]) -> Dict[str, Any]:
    normalized = _normalize_work_order(work_order)
    delivery = notify.send_dispatch_alert(normalized)
    normalized["channel_status"] = delivery
    normalized["order_sent"] = bool(delivery.get("sent"))
    _work_orders.append(normalized)
    _totals["dispatches_created"] += 1
    if normalized["order_sent"]:
        _totals["dispatches_sent"] += 1
    _totals["estimated_savings_usd"] += 2100.0
    _touch()
    return delivery


def handle_pipeline_results(results: Dict[str, Any], source: str = "manual") -> Dict[str, Any]:
    enriched = copy.deepcopy(results or {})
    alerts = enriched.get("alerts") or []
    reroutes = enriched.get("reroutes") or []
    work_orders = enriched.get("work_orders") or []

    _totals["incidents_total"] += len(alerts)
    _totals["auto_healed"] += len(reroutes)
    _totals["dispatches_avoided"] += len(reroutes)
    _totals["estimated_savings_usd"] += float(len(reroutes) * 5200.0)

    normalized_work_orders: List[Dict[str, Any]] = []
    for idx, wo in enumerate(work_orders):
        normalized = _normalize_work_order(wo, idx)
        delivery = notify.send_dispatch_alert(normalized)
        normalized["channel_status"] = delivery
        normalized["order_sent"] = bool(delivery.get("sent"))
        normalized_work_orders.append(normalized)
        _work_orders.append(normalized)
        _totals["dispatches_created"] += 1
        if normalized["order_sent"]:
            _totals["dispatches_sent"] += 1
        _totals["estimated_savings_usd"] += 2100.0

    enriched["work_orders"] = normalized_work_orders
    _events.append(
        {
            "event_type": "pipeline",
            "source": source,
            "alerts": len(alerts),
            "reroutes": len(reroutes),
            "work_orders": len(normalized_work_orders),
            "received_at": time.time(),
        }
    )
    _touch()
    return {"results": enriched, "business_metrics": _snapshot()}


def notification_health() -> Dict[str, Any]:
    return {
        "slack_webhook_configured": bool(os.getenv("AUTONODE_SLACK_WEBHOOK_URL", "").strip()),
        "smtp_configured": bool(
            os.getenv("AUTONODE_SMTP_HOST", "").strip()
            and os.getenv("AUTONODE_ALERT_EMAIL_FROM", "").strip()
            and os.getenv("AUTONODE_ALERT_EMAIL_TO", "").strip()
        ),
    }


def get_metrics() -> Dict[str, Any]:
    _touch()
    return _snapshot()


def reset(reset_metrics: bool = False) -> Dict[str, Any]:
    _events.clear()
    _work_orders.clear()
    if reset_metrics:
        _totals.update(
            {
                "events_ingested": 0,
                "heartbeat_runs": 0,
                "incidents_total": 0,
                "auto_healed": 0,
                "dispatches_created": 0,
                "dispatches_sent": 0,
                "dispatches_avoided": 0,
                "estimated_savings_usd": 0.0,
            }
        )
    _touch()
    return _snapshot()

