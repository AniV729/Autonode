"""Notification integrations for dispatch alerts."""

from __future__ import annotations

import json
import os
import smtplib
from email.message import EmailMessage
from typing import Any, Dict
from urllib import error, request


def _fmt_work_order(work_order: Dict[str, Any]) -> str:
    return (
        f"Work order {work_order.get('id', 'N/A')}\n"
        f"Sensor: {work_order.get('sensor_id', 'N/A')} ({work_order.get('sensor_type', 'N/A')})\n"
        f"Zone: {work_order.get('zone', 'N/A')}\n"
        f"Cause: {work_order.get('cause', 'UNKNOWN')}\n"
        f"Action: {work_order.get('recommended_action', 'Inspect sensor')}\n"
        f"Urgency: {work_order.get('urgency', 'HIGH')}"
    )


def _send_slack(work_order: Dict[str, Any]) -> Dict[str, Any]:
    webhook_url = os.getenv("AUTONODE_SLACK_WEBHOOK_URL", "").strip()
    if not webhook_url:
        return {"enabled": False, "ok": False, "reason": "webhook_not_configured"}

    payload = {"text": f":rotating_light: { _fmt_work_order(work_order) }"}
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        webhook_url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=7) as resp:
            return {"enabled": True, "ok": 200 <= resp.status < 300, "status": resp.status}
    except error.HTTPError as exc:
        return {"enabled": True, "ok": False, "status": exc.code, "reason": "http_error"}
    except Exception as exc:  # pragma: no cover
        return {"enabled": True, "ok": False, "reason": str(exc)}


def _send_email(work_order: Dict[str, Any]) -> Dict[str, Any]:
    host = os.getenv("AUTONODE_SMTP_HOST", "").strip()
    port = int(os.getenv("AUTONODE_SMTP_PORT", "587"))
    username = os.getenv("AUTONODE_SMTP_USERNAME", "").strip()
    password = os.getenv("AUTONODE_SMTP_PASSWORD", "").strip()
    from_addr = os.getenv("AUTONODE_ALERT_EMAIL_FROM", "").strip()
    to_addr = os.getenv("AUTONODE_ALERT_EMAIL_TO", "").strip()
    use_tls = os.getenv("AUTONODE_SMTP_USE_TLS", "true").strip().lower() != "false"

    if not (host and from_addr and to_addr):
        return {"enabled": False, "ok": False, "reason": "smtp_not_configured"}

    msg = EmailMessage()
    msg["Subject"] = f"[Autonode] {work_order.get('urgency', 'HIGH')} incident {work_order.get('sensor_id', 'N/A')}"
    msg["From"] = from_addr
    msg["To"] = to_addr
    msg.set_content(_fmt_work_order(work_order))

    try:
        with smtplib.SMTP(host, port, timeout=10) as smtp:
            if use_tls:
                smtp.starttls()
            if username:
                smtp.login(username, password)
            smtp.send_message(msg)
        return {"enabled": True, "ok": True}
    except Exception as exc:  # pragma: no cover
        return {"enabled": True, "ok": False, "reason": str(exc)}


def send_dispatch_alert(work_order: Dict[str, Any]) -> Dict[str, Any]:
    slack = _send_slack(work_order)
    email = _send_email(work_order)
    sent = bool(slack.get("ok")) or bool(email.get("ok"))
    return {"sent": sent, "slack": slack, "email": email}

