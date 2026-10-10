from extensions import db
from datetime import datetime
import uuid


def generate_uuid():
    return str(uuid.uuid4())


def generate_tracking_ref():
    """Generate a citizen-friendly tracking reference like CIV-2024-XXXX"""
    import random, string
    year = datetime.utcnow().year
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"CIV-{year}-{suffix}"


# ─── Association / Junction tables ────────────────────────────────────────────

role_permissions = db.Table(
    'role_permissions',
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True),
    db.Column('permission_id', db.Integer, db.ForeignKey('permissions.id'), primary_key=True)
)


# ─── Roles & Permissions ──────────────────────────────────────────────────────

class Permission(db.Model):
    __tablename__ = 'permissions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255))


class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255))
    permissions = db.relationship('Permission', secondary=role_permissions, lazy='subquery',
                                  backref=db.backref('roles', lazy=True))
    users = db.relationship('User', backref='role', lazy=True)


# ─── Users ────────────────────────────────────────────────────────────────────

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, default=generate_uuid, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    language_pref = db.Column(db.String(10), default='en')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    complaints = db.relationship('Complaint', foreign_keys='Complaint.citizen_id', backref='citizen', lazy=True)
    assigned_complaints = db.relationship('Complaint', foreign_keys='Complaint.assigned_staff_id',
                                          backref='assigned_staff', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'uuid': self.uuid,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role.name if self.role else None,
            'department_id': self.department_id,
            'department': self.department.name if self.department else None,
            'department_code': self.department.code if self.department else None,
            'is_active': self.is_active,
            'language_pref': self.language_pref,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }


# ─── Departments ──────────────────────────────────────────────────────────────

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    code = db.Column(db.String(30), unique=True, nullable=False)
    description = db.Column(db.Text)
    head_name = db.Column(db.String(150))
    head_email = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    sla_hours = db.Column(db.Integer, default=72)  # Service Level Agreement
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship('User', backref='department', lazy=True)
    complaints = db.relationship('Complaint', backref='department', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'head_name': self.head_name,
            'head_email': self.head_email,
            'phone': self.phone,
            'is_active': self.is_active,
            'sla_hours': self.sla_hours,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ─── Service Categories ───────────────────────────────────────────────────────

class ServiceCategory(db.Model):
    __tablename__ = 'service_categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    name_kn = db.Column(db.String(200))  # Kannada name
    code = db.Column(db.String(30), unique=True, nullable=False)
    description = db.Column(db.Text)
    description_kn = db.Column(db.Text)
    icon = db.Column(db.String(50), default='FileText')
    default_priority = db.Column(db.String(20), default='medium')
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    complaints = db.relationship('Complaint', backref='category', lazy=True)
    routing_rules = db.relationship('RoutingRule', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_kn': self.name_kn,
            'code': self.code,
            'description': self.description,
            'description_kn': self.description_kn,
            'icon': self.icon,
            'default_priority': self.default_priority,
            'is_active': self.is_active,
            'sort_order': self.sort_order,
        }


# ─── Routing Rules ────────────────────────────────────────────────────────────

class RoutingRule(db.Model):
    __tablename__ = 'routing_rules'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('service_categories.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    priority = db.Column(db.Integer, default=1)  # rule match priority
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    department = db.relationship('Department')

    def to_dict(self):
        return {
            'id': self.id,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'priority': self.priority,
            'is_active': self.is_active,
        }


# ─── Priority Rules ───────────────────────────────────────────────────────────

class PriorityRule(db.Model):
    __tablename__ = 'priority_rules'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    category_id = db.Column(db.Integer, db.ForeignKey('service_categories.id'), nullable=True)
    keywords = db.Column(db.Text)  # JSON array of trigger keywords
    assigned_priority = db.Column(db.String(20), nullable=False)  # critical/high/medium/low
    is_mandatory = db.Column(db.Boolean, default=False)  # safety rules cannot be overridden
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category_id': self.category_id,
            'keywords': json.loads(self.keywords) if self.keywords else [],
            'assigned_priority': self.assigned_priority,
            'is_mandatory': self.is_mandatory,
            'is_active': self.is_active,
        }


# ─── Complaints ───────────────────────────────────────────────────────────────

COMPLAINT_STATUSES = ['submitted', 'under_review', 'assigned', 'in_progress',
                      'escalated', 'resolved', 'closed', 'rejected']
PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low']


class Complaint(db.Model):
    __tablename__ = 'complaints'
    id = db.Column(db.Integer, primary_key=True)
    tracking_ref = db.Column(db.String(30), unique=True, nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('service_categories.id'), nullable=False)
    citizen_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    guest_name = db.Column(db.String(150))
    guest_email = db.Column(db.String(255))
    guest_phone = db.Column(db.String(20))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    assigned_staff_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.String(30), default='submitted', nullable=False)
    priority = db.Column(db.String(20), default='medium', nullable=False)
    priority_reason = db.Column(db.String(255))
    address = db.Column(db.String(300))
    locality = db.Column(db.String(150))
    landmark = db.Column(db.String(200))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    resolution_notes = db.Column(db.Text)
    rejection_reason = db.Column(db.Text)
    is_escalated = db.Column(db.Boolean, default=False)
    idempotency_key = db.Column(db.String(64), unique=True, nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    acknowledged_at = db.Column(db.DateTime)
    resolved_at = db.Column(db.DateTime)
    closed_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    status_history = db.relationship('StatusHistory', backref='complaint', lazy=True,
                                     order_by='StatusHistory.created_at')
    escalations = db.relationship('Escalation', backref='complaint', lazy=True)
    attachments = db.relationship('Attachment', backref='complaint', lazy=True)
    feedback = db.relationship('ResolutionFeedback', backref='complaint', uselist=False)

    def to_dict(self, include_history=False):
        data = {
            'id': self.id,
            'tracking_ref': self.tracking_ref,
            'title': self.title,
            'description': self.description,
            'category_id': self.category_id,
            'category': self.category.name if self.category else None,
            'category_kn': self.category.name_kn if self.category else None,
            'citizen_id': self.citizen_id,
            'citizen_name': self.citizen.full_name if self.citizen else self.guest_name,
            'citizen_email': self.citizen.email if self.citizen else self.guest_email,
            'citizen_phone': self.citizen.phone if self.citizen else self.guest_phone,
            'guest_name': self.guest_name,
            'guest_email': self.guest_email,
            'guest_phone': self.guest_phone,
            'submitter_name': (self.citizen.full_name if self.citizen else self.guest_name) or 'Citizen Submitter',
            'submitter_email': (self.citizen.email if self.citizen else self.guest_email) or 'Not provided',
            'submitter_phone': (self.citizen.phone if self.citizen else self.guest_phone) or 'Not provided',
            'department_id': self.department_id,
            'department': self.department.name if self.department else None,
            'department_code': self.department.code if self.department else None,
            'assigned_staff': self.assigned_staff.full_name if self.assigned_staff else None,
            'status': self.status,
            'priority': self.priority,
            'priority_reason': self.priority_reason,
            'address': self.address,
            'locality': self.locality,
            'landmark': self.landmark,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'resolution_notes': self.resolution_notes,
            'rejection_reason': self.rejection_reason,
            'is_escalated': self.is_escalated,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'acknowledged_at': self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'closed_at': self.closed_at.isoformat() if self.closed_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_history:
            data['history'] = [h.to_dict() for h in self.status_history]
            data['attachments'] = [a.to_dict() for a in self.attachments]
        return data


# ─── Status History ───────────────────────────────────────────────────────────

class StatusHistory(db.Model):
    __tablename__ = 'status_history'
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=False)
    from_status = db.Column(db.String(30))
    to_status = db.Column(db.String(30), nullable=False)
    from_department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    to_department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    changed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    remarks = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    changed_by = db.relationship('User', foreign_keys=[changed_by_id])

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'from_status': self.from_status,
            'to_status': self.to_status,
            'changed_by': self.changed_by.full_name if self.changed_by else 'System',
            'remarks': self.remarks,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ─── Escalations ──────────────────────────────────────────────────────────────

class Escalation(db.Model):
    __tablename__ = 'escalations'
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    escalated_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    escalated_to_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    resolved_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    escalated_by = db.relationship('User', foreign_keys=[escalated_by_id])
    escalated_to = db.relationship('User', foreign_keys=[escalated_to_id])

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'tracking_ref': self.complaint.tracking_ref if self.complaint else None,
            'reason': self.reason,
            'escalated_by': self.escalated_by.full_name if self.escalated_by else 'System',
            'escalated_to': self.escalated_to.full_name if self.escalated_to else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ─── Attachments ──────────────────────────────────────────────────────────────

class Attachment(db.Model):
    __tablename__ = 'attachments'
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255))
    mimetype = db.Column(db.String(100))
    size_bytes = db.Column(db.Integer)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'mimetype': self.mimetype,
            'size_bytes': self.size_bytes,
        }


# ─── Notifications ────────────────────────────────────────────────────────────

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='info')  # info/success/warning/error
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'complaint_id': self.complaint_id,
            'tracking_ref': self.complaint.tracking_ref if self.complaint else None,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ─── Resolution Feedback ──────────────────────────────────────────────────────

class ResolutionFeedback(db.Model):
    __tablename__ = 'resolution_feedback'
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), unique=True, nullable=False)
    rating = db.Column(db.Integer)  # 1-5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ─── Audit Logs ───────────────────────────────────────────────────────────────

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50))
    resource_id = db.Column(db.Integer)
    old_value = db.Column(db.Text)
    new_value = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.full_name if self.user else 'System',
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
