"""
CivicEase AI — Routing & Priority Engine
Rule-based, deterministic. AI assist is a separate optional layer.
"""
import json
import re
from models import RoutingRule, PriorityRule, ServiceCategory, Department, StatusHistory, Notification
from extensions import db
from datetime import datetime


# ─── Critical safety keywords (MANDATORY override) ───────────────────────────
CRITICAL_SAFETY_KEYWORDS = [
    r'\blive\s+wire\b', r'\belectric\s+wire\b', r'\belectrical\s+wire\b',
    r'\bfallen\s+wire\b', r'\bopen\s+wire\b', r'\bexposed\s+wire\b',
    r'\belectrocuti\w+', r'\bfire\b', r'\bgas\s+leak\b', r'\bexplosion\b',
    r'\bflooding\b', r'\bsinkhole\b', r'\bbuilding\s+collapse\b',
    r'\bdangerous\b.*\b(road|wire|pole|electric)\b',
    r'\b(road|traffic)\s+accident\b', r'\bhazard\b',
]

HIGH_KEYWORDS = [
    r'\bpothole\b', r'\bsewage\s+overflow\b', r'\bwater\s+contamination\b',
    r'\bno\s+water\b', r'\bstreet\s*light\s+out\b', r'\bdark\s+road\b',
    r'\bgarbage\s+overflow\b', r'\burgent\b', r'\bemergency\b',
]


def _text_matches(text: str, patterns: list) -> bool:
    if not text:
        return False
    text_lower = text.lower()
    for pat in patterns:
        if re.search(pat, text_lower):
            return True
    return False


def determine_priority(title: str, description: str, category_code: str = None,
                       priority_rules: list = None) -> tuple:
    """
    Returns (priority_level, reason).
    Mandatory critical-safety rules always override everything.
    """
    combined = f"{title or ''} {description or ''}"

    # 1. Mandatory critical safety check — cannot be overridden
    if _text_matches(combined, CRITICAL_SAFETY_KEYWORDS):
        return ('critical', 'Critical safety hazard detected — mandatory urgent priority applied')

    # 2. Check configured priority rules (mandatory ones first)
    if priority_rules:
        for rule in sorted(priority_rules, key=lambda r: (not r.is_mandatory, r.id)):
            if not rule.is_active:
                continue
            if rule.keywords:
                keywords = json.loads(rule.keywords) if isinstance(rule.keywords, str) else rule.keywords
                kw_patterns = [r'\b' + re.escape(kw.lower()) + r'\b' for kw in keywords]
                if _text_matches(combined, kw_patterns):
                    if rule.is_mandatory:
                        return (rule.assigned_priority, f"Mandatory rule: {rule.name}")
                    if rule.assigned_priority in ('critical', 'high'):
                        return (rule.assigned_priority, f"Priority rule matched: {rule.name}")

    # 3. Keyword-based heuristics
    if _text_matches(combined, HIGH_KEYWORDS):
        return ('high', 'Issue description indicates high urgency')

    # 4. Category default
    if category_code:
        from models import ServiceCategory
        cat = ServiceCategory.query.filter_by(code=category_code, is_active=True).first()
        if cat and cat.default_priority:
            return (cat.default_priority, f"Default priority for {cat.name}")

    return ('medium', 'Standard service request')


def route_complaint(complaint):
    """
    Assign department based on routing rules.
    Returns department or None (goes to review queue).
    """
    rule = (RoutingRule.query
            .filter_by(category_id=complaint.category_id, is_active=True)
            .order_by(RoutingRule.priority.asc())
            .first())
    if rule:
        return rule.department
    return None


def record_status_change(complaint, new_status, changed_by=None, remarks=None,
                         from_dept_id=None, to_dept_id=None):
    """Record a status transition in the history table."""
    history = StatusHistory(
        complaint_id=complaint.id,
        from_status=complaint.status,
        to_status=new_status,
        from_department_id=from_dept_id,
        to_department_id=to_dept_id,
        changed_by_id=changed_by.id if changed_by else None,
        remarks=remarks,
        created_at=datetime.utcnow(),
    )
    complaint.status = new_status
    complaint.updated_at = datetime.utcnow()
    db.session.add(history)
    return history


def notify_user(user_id, title, message, complaint=None, ntype='info'):
    """Create an in-app notification."""
    notif = Notification(
        user_id=user_id,
        complaint_id=complaint.id if complaint else None,
        title=title,
        message=message,
        type=ntype,
    )
    db.session.add(notif)
    return notif


def check_and_escalate_overdue(app):
    """
    Background worker: check complaints past their SLA and auto-escalate.
    Called by APScheduler every hour.
    """
    from models import Complaint, Escalation, Department
    with app.app_context():
        try:
            now = datetime.utcnow()
            # Find submitted/assigned/in_progress complaints past SLA
            complaints = Complaint.query.filter(
                Complaint.status.in_(['submitted', 'under_review', 'assigned', 'in_progress']),
                Complaint.is_escalated == False,
            ).all()

            for c in complaints:
                dept = c.department
                sla_hours = dept.sla_hours if dept else 72
                hours_since = (now - c.submitted_at).total_seconds() / 3600
                if hours_since >= sla_hours:
                    c.is_escalated = True
                    record_status_change(c, 'escalated', remarks=f'Auto-escalated: exceeded {sla_hours}h SLA')
                    esc = Escalation(
                        complaint_id=c.id,
                        reason=f'SLA exceeded: {int(hours_since)}h elapsed (threshold: {sla_hours}h)',
                        created_at=now,
                    )
                    db.session.add(esc)
                    # Notify assigned staff if any
                    if c.assigned_staff_id:
                        notify_user(c.assigned_staff_id,
                                    'Request Escalated',
                                    f'Request {c.tracking_ref} has been auto-escalated due to SLA breach.',
                                    complaint=c, ntype='warning')
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Escalation worker error: {e}")
