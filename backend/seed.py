"""
CivicEase AI — Seed Data
Auto-seeds on first run when database is empty.
"""
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from models import (Role, Permission, User, Department, ServiceCategory,
                    RoutingRule, PriorityRule, Complaint, StatusHistory,
                    Escalation, Notification, generate_tracking_ref)
from extensions import db
import json


def seed_all():
    """Idempotent seeder — only runs if roles table is empty."""
    if Role.query.first():
        return  # Already seeded

    print("Seeding CivicEase AI demo data...")

    # ── Roles ──────────────────────────────────────────────────────────────
    roles = {}
    for name, desc in [
        ('admin', 'Full system administrator'),
        ('supervisor', 'Department supervisor'),
        ('staff', 'Department staff member'),
        ('citizen', 'Registered citizen'),
    ]:
        r = Role(name=name, description=desc)
        db.session.add(r)
        roles[name] = r
    db.session.flush()

    # ── Departments ────────────────────────────────────────────────────────
    dept_data = [
        ('Public Works Department', 'PWD', 'Roads, bridges, and public infrastructure',
         'Suresh Kumar', 'pwd@civicease.demo', '+91-80-1234-5678', 48),
        ('Electrical Department', 'ELEC', 'Street lighting and electrical infrastructure',
         'Priya Sharma', 'elec@civicease.demo', '+91-80-1234-5679', 24),
        ('Water Supply Department', 'WATER', 'Drinking water supply and pipeline maintenance',
         'Rajan Pillai', 'water@civicease.demo', '+91-80-1234-5680', 48),
        ('Sanitation Department', 'SANIT', 'Garbage collection and solid waste management',
         'Kavitha Nair', 'sanit@civicease.demo', '+91-80-1234-5681', 36),
        ('Drainage Department', 'DRAIN', 'Sewage and stormwater drainage systems',
         'Mohammed Ali', 'drain@civicease.demo', '+91-80-1234-5682', 48),
        ('Parks & Public Facilities', 'PARKS', 'Public parks, gardens, and civic amenities',
         'Anita Desai', 'parks@civicease.demo', '+91-80-1234-5683', 72),
        ('Public Safety Department', 'SAFETY', 'Public safety hazards and emergency response coordination',
         'Vikram Singh', 'safety@civicease.demo', '+91-80-1234-5684', 12),
        ('General Services', 'GEN', 'Miscellaneous and unclassified service requests',
         'Lakshmi Rao', 'gen@civicease.demo', '+91-80-1234-5685', 72),
    ]
    depts = {}
    for name, code, desc, head, hemail, phone, sla in dept_data:
        d = Department(name=name, code=code, description=desc,
                       head_name=head, head_email=hemail, phone=phone, sla_hours=sla)
        db.session.add(d)
        depts[code] = d
    db.session.flush()

    # ── Service Categories ─────────────────────────────────────────────────
    cat_data = [
        ('Roads and Potholes', 'ರಸ್ತೆ ಮತ್ತು ಗುಂಡಿಗಳು', 'ROADS',
         'Road damage, potholes, and pavement issues', 'ರಸ್ತೆ ಹಾನಿ, ಗುಂಡಿಗಳು ಮತ್ತು ಪೇವ್‌ಮೆಂಟ್ ಸಮಸ್ಯೆಗಳು',
         'Road', 'high', 1),
        ('Streetlights & Electrical', 'ಬೀದಿದೀಪಗಳು ಮತ್ತು ವಿದ್ಯುತ್', 'LIGHTS',
         'Streetlight failures and electrical infrastructure', 'ಬೀದಿ ದೀಪ ಮತ್ತು ವಿದ್ಯುತ್ ಮೂಲಸೌಕರ್ಯ',
         'Zap', 'high', 2),
        ('Water Supply & Leakage', 'ನೀರು ಸರಬರಾಜು ಮತ್ತು ಸೋರಿಕೆ', 'WATER',
         'Water supply disruptions and pipeline leakage', 'ನೀರು ಸರಬರಾಜು ಅಡ್ಡಿ ಮತ್ತು ಪೈಪ್‌ಲೈನ್ ಸೋರಿಕೆ',
         'Droplets', 'medium', 3),
        ('Garbage & Sanitation', 'ಕಸ ಮತ್ತು ನೈರ್ಮಲ್ಯ', 'GARBAGE',
         'Garbage collection and sanitation issues', 'ಕಸ ಸಂಗ್ರಹ ಮತ್ತು ನೈರ್ಮಲ್ಯ ಸಮಸ್ಯೆಗಳು',
         'Trash2', 'medium', 4),
        ('Drainage & Sewage', 'ಒಳಚರಂಡಿ ಮತ್ತು ಮಲಿನನೀರು', 'DRAINAGE',
         'Drainage blockages and sewage overflow', 'ಒಳಚರಂಡಿ ಅಡಚಣೆ ಮತ್ತು ಮಲಿನ ನೀರು ಉಕ್ಕಿ ಹರಿಯುವಿಕೆ',
         'Waves', 'medium', 5),
        ('Public Parks & Facilities', 'ಸಾರ್ವಜನಿಕ ಉದ್ಯಾನಗಳು ಮತ್ತು ಸೌಕರ್ಯಗಳು', 'PARKS',
         'Parks, playgrounds, and public facilities', 'ಉದ್ಯಾನಗಳು, ಆಟದ ಮೈದಾನಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸೌಕರ್ಯಗಳು',
         'Trees', 'low', 6),
        ('Public Safety Hazards', 'ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತಾ ಅಪಾಯಗಳು', 'SAFETY',
         'Dangerous conditions and public safety risks', 'ಅಪಾಯಕಾರಿ ಪರಿಸ್ಥಿತಿಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತಾ ಅಪಾಯಗಳು',
         'AlertTriangle', 'critical', 7),
        ('Other Public Services', 'ಇತರ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು', 'OTHER',
         'Other civic service requests not listed above', 'ಮೇಲೆ ಪಟ್ಟಿ ಮಾಡದ ಇತರ ನಾಗರಿಕ ಸೇವಾ ವಿನಂತಿಗಳು',
         'FileText', 'medium', 8),
    ]
    cats = {}
    for name, name_kn, code, desc, desc_kn, icon, priority, order in cat_data:
        c = ServiceCategory(name=name, name_kn=name_kn, code=code,
                            description=desc, description_kn=desc_kn,
                            icon=icon, default_priority=priority, sort_order=order)
        db.session.add(c)
        cats[code] = c
    db.session.flush()

    # ── Routing Rules ──────────────────────────────────────────────────────
    routing = [
        ('ROADS', 'PWD'), ('LIGHTS', 'ELEC'), ('WATER', 'WATER'),
        ('GARBAGE', 'SANIT'), ('DRAINAGE', 'DRAIN'), ('PARKS', 'PARKS'),
        ('SAFETY', 'SAFETY'), ('OTHER', 'GEN'),
    ]
    for cat_code, dept_code in routing:
        r = RoutingRule(category_id=cats[cat_code].id,
                        department_id=depts[dept_code].id, priority=1)
        db.session.add(r)

    # ── Priority Rules ─────────────────────────────────────────────────────
    pr_data = [
        ('Live Electrical Wire Safety',
         'Mandatory critical priority for live or fallen electrical wires',
         None, ['live wire', 'electric wire', 'electrical wire', 'fallen wire', 'exposed wire'],
         'critical', True),
        ('Fire or Gas Leak',
         'Mandatory critical priority for fire or gas leak reports',
         None, ['fire', 'gas leak', 'explosion', 'smoke'],
         'critical', True),
        ('Flooding',
         'Mandatory critical priority for flooding reports',
         None, ['flooding', 'flood', 'inundation'],
         'critical', True),
        ('Electrical Safety Hazard',
         'High priority for general electrical hazards',
         None, ['electrocution', 'electric shock', 'electric pole fell'],
         'high', False),
        ('Sewage Overflow',
         'High priority for sewage overflow',
         None, ['sewage overflow', 'sewage spill', 'open drain overflow'],
         'high', False),
        ('No Water Supply',
         'High priority for complete water supply failure',
         None, ['no water', 'no water supply', 'water not coming'],
         'high', False),
    ]
    for name, desc, cat_id, keywords, priority, mandatory in pr_data:
        pr = PriorityRule(name=name, description=desc, category_id=cat_id,
                          keywords=json.dumps(keywords),
                          assigned_priority=priority, is_mandatory=mandatory)
        db.session.add(pr)
    db.session.flush()

    # ── Users ──────────────────────────────────────────────────────────────
    users_data = [
        ('Admin User', 'admin@civicease.demo', 'Admin@123', 'admin', None),
        ('Supervisor Singh', 'supervisor@civicease.demo', 'Super@123', 'supervisor', 'SAFETY'),
        ('Staff Suresh', 'staff.pwd@civicease.demo', 'Staff@123', 'staff', 'PWD'),
        ('Staff Priya', 'staff.elec@civicease.demo', 'Staff@123', 'staff', 'ELEC'),
        ('Staff Rajan', 'staff.water@civicease.demo', 'Staff@123', 'staff', 'WATER'),
        ('Staff Kavitha', 'staff.sanit@civicease.demo', 'Staff@123', 'staff', 'SANIT'),
        ('Staff Mohammed', 'staff.drain@civicease.demo', 'Staff@123', 'staff', 'DRAIN'),
        ('Staff Anita', 'staff.parks@civicease.demo', 'Staff@123', 'staff', 'PARKS'),
        ('Staff Vikram', 'staff.safety@civicease.demo', 'Staff@123', 'staff', 'SAFETY'),
        ('Staff Lakshmi', 'staff.gen@civicease.demo', 'Staff@123', 'staff', 'GEN'),
        ('Aisha Citizen', 'citizen1@civicease.demo', 'Citizen@123', 'citizen', None),
        ('Ramesh Kumar', 'citizen2@civicease.demo', 'Citizen@123', 'citizen', None),
        ('Meera Devi', 'citizen3@civicease.demo', 'Citizen@123', 'citizen', None),
    ]
    users = {}
    for fname, email, pwd, role_name, dept_code in users_data:
        u = User(
            full_name=fname,
            email=email,
            password_hash=generate_password_hash(pwd),
            role_id=roles[role_name].id,
            department_id=depts[dept_code].id if dept_code else None,
        )
        db.session.add(u)
        users[email] = u
    db.session.flush()

    # ── Demo Complaints ────────────────────────────────────────────────────
    citizen1 = users['citizen1@civicease.demo']
    citizen2 = users['citizen2@civicease.demo']
    citizen3 = users['citizen3@civicease.demo']
    staff_elec = users['staff.elec@civicease.demo']
    staff_water = users['staff.water@civicease.demo']
    staff_sanit = users['staff.sanit@civicease.demo']
    staff_pwd = users['staff.pwd@civicease.demo']

    now = datetime.utcnow()

    # 1. Resolved road complaint
    c1 = Complaint(
        tracking_ref='CIV-2026-DEMO01',
        title='Large pothole on MG Road near bus stop',
        description='There is a large pothole about 2 feet wide on MG Road near the City Bus Stop No. 14. It is causing accidents during night time. Vehicles are getting damaged.',
        category_id=cats['ROADS'].id,
        citizen_id=citizen1.id,
        department_id=depts['PWD'].id,
        assigned_staff_id=staff_pwd.id,
        status='resolved',
        priority='high',
        priority_reason='Issue description indicates high urgency',
        address='MG Road, near Bus Stop 14',
        locality='MG Road', landmark='City Bus Stop 14',
        resolution_notes='Pothole filled with bitumen. Road surface leveled and tested.',
        submitted_at=now - timedelta(days=5),
        acknowledged_at=now - timedelta(days=4, hours=12),
        resolved_at=now - timedelta(days=2),
    )
    db.session.add(c1)
    db.session.flush()
    for ev in [
        ('submitted', None, None, None, now - timedelta(days=5)),
        ('under_review', 'submitted', None, None, now - timedelta(days=4, hours=12)),
        ('assigned', 'under_review', None, staff_pwd.id, now - timedelta(days=4)),
        ('in_progress', 'assigned', staff_pwd.id, None, now - timedelta(days=3)),
        ('resolved', 'in_progress', staff_pwd.id, None, now - timedelta(days=2)),
    ]:
        h = StatusHistory(complaint_id=c1.id, to_status=ev[0], from_status=ev[1],
                          changed_by_id=ev[3], created_at=ev[4],
                          remarks=f'Status updated to {ev[0]}')
        db.session.add(h)

    # 2. Critical — live electrical wire (main demo scenario)
    c2 = Complaint(
        tracking_ref='CIV-2026-DEMO02',
        title='Live electrical wire fallen near Rajajinagar Bus Stop',
        description='A live electrical wire has fallen on the road near Rajajinagar Bus Stop No. 5. It is sparking and posing extreme danger to pedestrians and vehicles passing by. Immediate action required.',
        category_id=cats['LIGHTS'].id,
        citizen_id=citizen2.id,
        department_id=depts['ELEC'].id,
        assigned_staff_id=staff_elec.id,
        status='in_progress',
        priority='critical',
        priority_reason='Critical safety hazard detected — mandatory urgent priority applied',
        address='Rajajinagar, near Bus Stop No. 5',
        locality='Rajajinagar', landmark='Bus Stop No. 5',
        submitted_at=now - timedelta(hours=3),
        acknowledged_at=now - timedelta(hours=2),
    )
    db.session.add(c2)
    db.session.flush()
    for ev in [
        ('submitted', None, None, None, now - timedelta(hours=3)),
        ('under_review', 'submitted', None, None, now - timedelta(hours=2, minutes=30)),
        ('assigned', 'under_review', None, staff_elec.id, now - timedelta(hours=2)),
        ('in_progress', 'assigned', staff_elec.id, None, now - timedelta(hours=1)),
    ]:
        h = StatusHistory(complaint_id=c2.id, to_status=ev[0], from_status=ev[1],
                          changed_by_id=ev[3], created_at=ev[4],
                          remarks=f'Status: {ev[0]}')
        db.session.add(h)

    # 3. Escalated water complaint
    c3 = Complaint(
        tracking_ref='CIV-2026-DEMO03',
        title='No water supply for 3 days in Indiranagar',
        description='Our entire street in Indiranagar, 100 Feet Road, has had no water supply for the past 3 days. Multiple residents are severely affected. Requests to the local office have not been addressed.',
        category_id=cats['WATER'].id,
        citizen_id=citizen3.id,
        department_id=depts['WATER'].id,
        assigned_staff_id=staff_water.id,
        status='escalated',
        priority='high',
        priority_reason='Priority rule matched: No Water Supply',
        address='Indiranagar 100 Feet Road',
        locality='Indiranagar',
        is_escalated=True,
        submitted_at=now - timedelta(days=4),
        acknowledged_at=now - timedelta(days=3, hours=20),
    )
    db.session.add(c3)
    db.session.flush()
    esc = Escalation(
        complaint_id=c3.id,
        reason='SLA exceeded: 96h elapsed (threshold: 48h)',
        created_at=now - timedelta(hours=6),
    )
    db.session.add(esc)
    for ev in [
        ('submitted', None, None, None, now - timedelta(days=4)),
        ('under_review', 'submitted', None, None, now - timedelta(days=3, hours=20)),
        ('assigned', 'under_review', None, staff_water.id, now - timedelta(days=3)),
        ('escalated', 'assigned', None, None, now - timedelta(hours=6)),
    ]:
        h = StatusHistory(complaint_id=c3.id, to_status=ev[0], from_status=ev[1],
                          changed_by_id=ev[3], created_at=ev[4],
                          remarks=f'Status: {ev[0]}')
        db.session.add(h)

    # 4. Under review — garbage
    c4 = Complaint(
        tracking_ref='CIV-2026-DEMO04',
        title='Garbage not collected for a week in HSR Layout',
        description='Garbage bins in HSR Layout Sector 2 have not been collected for over a week. The area smells terrible and is attracting stray animals.',
        category_id=cats['GARBAGE'].id,
        citizen_id=citizen1.id,
        department_id=depts['SANIT'].id,
        assigned_staff_id=staff_sanit.id,
        status='assigned',
        priority='medium',
        priority_reason='Default priority for Garbage & Sanitation',
        address='HSR Layout Sector 2',
        locality='HSR Layout',
        submitted_at=now - timedelta(days=2),
        acknowledged_at=now - timedelta(days=1, hours=18),
    )
    db.session.add(c4)
    db.session.flush()
    for ev in [
        ('submitted', None, None, None, now - timedelta(days=2)),
        ('under_review', 'submitted', None, None, now - timedelta(days=1, hours=18)),
        ('assigned', 'under_review', None, staff_sanit.id, now - timedelta(days=1)),
    ]:
        h = StatusHistory(complaint_id=c4.id, to_status=ev[0], from_status=ev[1],
                          changed_by_id=ev[3], created_at=ev[4],
                          remarks=f'Status: {ev[0]}')
        db.session.add(h)

    # 5. Submitted — new complaint in queue
    c5 = Complaint(
        tracking_ref='CIV-2026-DEMO05',
        title='Broken park bench in Cubbon Park area',
        description='A park bench near the central fountain in the public park on Palace Road is completely broken. It is a safety hazard for elderly visitors.',
        category_id=cats['PARKS'].id,
        citizen_id=citizen3.id,
        department_id=depts['PARKS'].id,
        status='submitted',
        priority='low',
        priority_reason='Default priority for Public Parks & Facilities',
        address='Palace Road Public Park',
        locality='Palace Road', landmark='Central Fountain',
        submitted_at=now - timedelta(hours=6),
    )
    db.session.add(c5)
    db.session.flush()
    h = StatusHistory(complaint_id=c5.id, to_status='submitted', created_at=now - timedelta(hours=6),
                      remarks='Request submitted by citizen')
    db.session.add(h)

    # ── Notifications ──────────────────────────────────────────────────────
    notifs = [
        (citizen1.id, c1.id, 'Request Resolved', f'Your request {c1.tracking_ref} has been resolved.', 'success'),
        (citizen2.id, c2.id, 'Request In Progress', f'Your request {c2.tracking_ref} is now being addressed urgently.', 'info'),
        (citizen3.id, c3.id, 'Request Escalated', f'Your request {c3.tracking_ref} has been escalated due to delays.', 'warning'),
        (staff_elec.id, c2.id, 'Critical Request Assigned', f'Critical request {c2.tracking_ref} has been assigned to you.', 'error'),
        (staff_water.id, c3.id, 'Escalation Alert', f'Request {c3.tracking_ref} has been escalated. Immediate action required.', 'warning'),
    ]
    for uid, cid, title, msg, ntype in notifs:
        n = Notification(user_id=uid, complaint_id=cid, title=title, message=msg, type=ntype)
        db.session.add(n)

    db.session.commit()
    print("Demo data seeded successfully!")
    print("\nDemo Accounts:")
    print("   admin@civicease.demo     | Admin@123   (Administrator)")
    print("   supervisor@civicease.demo| Super@123   (Supervisor)")
    print("   staff.elec@civicease.demo| Staff@123   (Electrical Dept Staff)")
    print("   citizen1@civicease.demo  | Citizen@123 (Citizen - Aisha)")
    print("   citizen2@civicease.demo  | Citizen@123 (Citizen - Ramesh)")
