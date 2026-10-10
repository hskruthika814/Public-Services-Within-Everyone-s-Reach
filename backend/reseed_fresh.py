"""
Script to wipe old complaints/history and seed:
1. 8 Dedicated Officers (1 for each department)
2. Fresh realistic complaints for each department with department-specific codes
3. System Admin and Citizens
"""
from app import create_app
from extensions import db
from models import (Role, User, Department, ServiceCategory, Complaint, 
                    StatusHistory, Escalation, Notification, PriorityRule, RoutingRule)
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    print("Clearing old complaint history and notifications...")
    Notification.query.delete()
    Escalation.query.delete()
    StatusHistory.query.delete()
    Complaint.query.delete()
    db.session.commit()

    # Ensure Roles
    roles = {r.name: r for r in Role.query.all()}
    if not roles:
        for name, desc in [
            ('admin', 'Full system administrator'),
            ('supervisor', 'Department supervisor'),
            ('staff', 'Department staff member'),
            ('citizen', 'Registered citizen'),
        ]:
            r = Role(name=name, description=desc)
            db.session.add(r)
        db.session.commit()
        roles = {r.name: r for r in Role.query.all()}

    # Ensure Departments
    depts = {d.code: d for d in Department.query.all()}
    dept_specs = [
        ('Public Works Department', 'PWD', 'Roads, bridges, and public infrastructure', 'Suresh Kumar', 'pwd@civicease.demo', '+91-80-1234-5678', 48),
        ('Electrical Department', 'ELEC', 'Street lighting and electrical infrastructure', 'Priya Sharma', 'elec@civicease.demo', '+91-80-1234-5679', 24),
        ('Water Supply Department', 'WATER', 'Drinking water supply and pipeline maintenance', 'Rajan Pillai', 'water@civicease.demo', '+91-80-1234-5680', 48),
        ('Sanitation Department', 'SANIT', 'Garbage collection and solid waste management', 'Kavitha Nair', 'sanit@civicease.demo', '+91-80-1234-5681', 36),
        ('Drainage Department', 'DRAIN', 'Sewage and stormwater drainage systems', 'Mohammed Ali', 'drain@civicease.demo', '+91-80-1234-5682', 48),
        ('Parks & Public Facilities', 'PARKS', 'Public parks, gardens, and civic amenities', 'Anita Desai', 'parks@civicease.demo', '+91-80-1234-5683', 72),
        ('Public Safety Department', 'SAFETY', 'Public safety hazards and emergency response coordination', 'Vikram Singh', 'safety@civicease.demo', '+91-80-1234-5684', 12),
        ('General Services', 'GEN', 'Miscellaneous and unclassified service requests', 'Lakshmi Rao', 'gen@civicease.demo', '+91-80-1234-5685', 72),
    ]
    for name, code, desc, head, hemail, phone, sla in dept_specs:
        if code not in depts:
            d = Department(name=name, code=code, description=desc, head_name=head, head_email=hemail, phone=phone, sla_hours=sla)
            db.session.add(d)
    db.session.commit()
    depts = {d.code: d for d in Department.query.all()}

    # Ensure Categories
    cats = {c.code: c for c in ServiceCategory.query.all()}
    cat_specs = [
        ('Roads and Potholes', 'ರಸ್ತೆ ಮತ್ತು ಗುಂಡಿಗಳು', 'ROADS', 'Road damage, potholes, and pavement issues', 'Road', 'high', 1),
        ('Streetlights & Electrical', 'ಬೀದಿದೀಪಗಳು ಮತ್ತು ವಿದ್ಯುತ್', 'LIGHTS', 'Streetlight failures and electrical infrastructure', 'Zap', 'high', 2),
        ('Water Supply & Leakage', 'ನೀರು ಸರಬರಾಜು ಮತ್ತು ಸೋರಿಕೆ', 'WATER', 'Water supply disruptions and pipeline leakage', 'Droplets', 'medium', 3),
        ('Garbage & Sanitation', 'ಕಸ ಮತ್ತು ನೈರ್ಮಲ್ಯ', 'GARBAGE', 'Garbage collection and sanitation issues', 'Trash2', 'medium', 4),
        ('Drainage & Sewage', 'ಒಳಚರಂಡಿ ಮತ್ತು ಮಲಿನನೀರು', 'DRAINAGE', 'Drainage blockages and sewage overflow', 'Waves', 'medium', 5),
        ('Public Parks & Facilities', 'ಸಾರ್ವಜನಿಕ ಉದ್ಯಾನಗಳು ಮತ್ತು ಸೌಕರ್ಯಗಳು', 'PARKS', 'Parks, playgrounds, and public facilities', 'Trees', 'low', 6),
        ('Public Safety Hazards', 'ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತಾ ಅಪಾಯಗಳು', 'SAFETY', 'Dangerous conditions and public safety risks', 'AlertTriangle', 'critical', 7),
        ('Other Public Services', 'ಇತರ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು', 'OTHER', 'Other civic service requests not listed above', 'FileText', 'medium', 8),
    ]
    for name, name_kn, code, desc, icon, prio, order in cat_specs:
        if code not in cats:
            c = ServiceCategory(name=name, name_kn=name_kn, code=code, description=desc, icon=icon, default_priority=prio, sort_order=order)
            db.session.add(c)
    db.session.commit()
    cats = {c.code: c for c in ServiceCategory.query.all()}

    # ── 8 Dedicated Officers (1 for each Department) + Admin + Citizens ──
    officers_data = [
        ('Officer Suresh Kumar (PWD)', 'staff.pwd@civicease.demo', 'Staff@123', 'staff', 'PWD', '+91-98801-00001'),
        ('Officer Priya Sharma (Electrical)', 'staff.elec@civicease.demo', 'Staff@123', 'staff', 'ELEC', '+91-98801-00002'),
        ('Officer Rajan Pillai (Water Supply)', 'staff.water@civicease.demo', 'Staff@123', 'staff', 'WATER', '+91-98801-00003'),
        ('Officer Kavitha Nair (Sanitation)', 'staff.sanit@civicease.demo', 'Staff@123', 'staff', 'SANIT', '+91-98801-00004'),
        ('Officer Mohammed Ali (Drainage)', 'staff.drain@civicease.demo', 'Staff@123', 'staff', 'DRAIN', '+91-98801-00005'),
        ('Officer Anita Desai (Parks)', 'staff.parks@civicease.demo', 'Staff@123', 'staff', 'PARKS', '+91-98801-00006'),
        ('Officer Vikram Singh (Safety)', 'staff.safety@civicease.demo', 'Staff@123', 'staff', 'SAFETY', '+91-98801-00007'),
        ('Officer Lakshmi Rao (General)', 'staff.gen@civicease.demo', 'Staff@123', 'staff', 'GEN', '+91-98801-00008'),
        ('System Administrator', 'admin@civicease.demo', 'Admin@123', 'admin', None, '+91-98801-99999'),
        ('Aisha Citizen', 'citizen1@civicease.demo', 'Citizen@123', 'citizen', None, '+91-98802-11111'),
        ('Ramesh Kumar', 'citizen2@civicease.demo', 'Citizen@123', 'citizen', None, '+91-98802-22222'),
    ]

    users = {}
    for fname, email, pwd, role_name, dept_code, phone in officers_data:
        u = User.query.filter_by(email=email).first()
        dept_id = depts[dept_code].id if dept_code else None
        if not u:
            u = User(
                full_name=fname,
                email=email,
                phone=phone,
                password_hash=generate_password_hash(pwd),
                role_id=roles[role_name].id,
                department_id=dept_id,
            )
            db.session.add(u)
        else:
            u.full_name = fname
            u.password_hash = generate_password_hash(pwd)
            u.role_id = roles[role_name].id
            u.department_id = dept_id
            u.phone = phone
        db.session.flush()
        users[email] = u
    db.session.commit()

    print("Seeded 8 dedicated department officers.")

    # ── Create Fresh Complaints for Each Department with Dept Codes ──
    now = datetime.utcnow()
    citizen1 = users['citizen1@civicease.demo']
    citizen2 = users['citizen2@civicease.demo']

    complaints_to_create = [
        # 1. PWD (Public Works)
        {
            'tracking_ref': 'CIV-PWD-001',
            'title': 'Dangerous Deep Pothole & Caved Pavement on MG Road Flyover',
            'description': 'A 3-foot wide deep pothole crater has caved in on the MG Road Flyover descent. Two two-wheelers have slipped at night. Immediate asphalt re-laying required.',
            'category': 'ROADS', 'dept': 'PWD', 'staff': 'staff.pwd@civicease.demo',
            'status': 'under_review', 'priority': 'high', 'prio_reason': 'Accident risk on high-traffic elevated corridor',
            'address': 'MG Road Flyover, Pier 18', 'locality': 'Central Zone',
            'citizen': citizen1, 'sub_days': 2
        },
        {
            'tracking_ref': 'CIV-PWD-002',
            'title': 'Broken Pedestrian Bridge Footpath & Missing Concrete Slabs',
            'description': 'Several walkway concrete slabs have cracked and fallen off on the pedestrian overbridge near City Railway Station. Commuters are forced to walk on main road.',
            'category': 'ROADS', 'dept': 'PWD', 'staff': 'staff.pwd@civicease.demo',
            'status': 'in_progress', 'priority': 'medium', 'prio_reason': 'Pedestrian safety and structural pathway repair',
            'address': 'Railway Station Overbridge, Platform 1 road', 'locality': 'Railway Division',
            'citizen': citizen2, 'sub_days': 4
        },

        # 2. Electrical Department
        {
            'tracking_ref': 'CIV-ELC-001',
            'title': 'Live High Voltage Wire Sparking Near Rajajinagar Bus Stop 5',
            'description': 'A live 440V overhead distribution wire snapped and is sparking intermittently on the wet road pavement next to the crowded bus queue. Severe electrocution danger.',
            'category': 'LIGHTS', 'dept': 'ELEC', 'staff': 'staff.elec@civicease.demo',
            'status': 'in_progress', 'priority': 'critical', 'prio_reason': 'Emergency life hazard: Live sparking conductor in public area',
            'address': 'Rajajinagar 1st Block, Bus Stop 5', 'locality': 'West Division',
            'citizen': citizen1, 'sub_days': 1
        },
        {
            'tracking_ref': 'CIV-ELC-002',
            'title': 'Complete 800m Streetlight Blackout on 14th Cross Avenue',
            'description': 'All 18 LED streetlight poles on 14th Cross residential avenue are completely off for the 4th consecutive night due to feeder junction trip.',
            'category': 'LIGHTS', 'dept': 'ELEC', 'staff': 'staff.elec@civicease.demo',
            'status': 'submitted', 'priority': 'high', 'prio_reason': 'Public security and darkness across entire residential stretch',
            'address': '14th Cross Avenue, 2nd Stage', 'locality': 'Indiranagar Zone',
            'citizen': citizen2, 'sub_days': 3
        },

        # 3. Water Supply Department
        {
            'tracking_ref': 'CIV-WAT-001',
            'title': 'Burst Main Drinking Water Line Flooding Commercial Market',
            'description': 'The 600mm main drinking water distribution pipeline has burst under high pressure. Clean potable water is gushing onto the market square, causing flood and pressure drop.',
            'category': 'WATER', 'dept': 'WATER', 'staff': 'staff.water@civicease.demo',
            'status': 'under_review', 'priority': 'critical', 'prio_reason': 'Massive water wastage and commercial flooding',
            'address': 'Commercial Street Market Square', 'locality': 'East Zone',
            'citizen': citizen1, 'sub_days': 1
        },
        {
            'tracking_ref': 'CIV-WAT-002',
            'title': 'Contaminated Discolored Tap Water Supply in Sector 4',
            'description': 'Residents in Sector 4 are receiving turbid, foul-smelling tap water for 48 hours. Sewage line suspected to have cross-contaminated supply pipe.',
            'category': 'WATER', 'dept': 'WATER', 'staff': 'staff.water@civicease.demo',
            'status': 'assigned', 'priority': 'high', 'prio_reason': 'Public health hazard: Suspected drinking water contamination',
            'address': 'Sector 4, 7th Main Lane', 'locality': 'HSR Zone',
            'citizen': citizen2, 'sub_days': 2
        },

        # 4. Sanitation Department
        {
            'tracking_ref': 'CIV-SAN-001',
            'title': 'Massive Uncollected Municipal Garbage Heap Outside School Gate',
            'description': 'Solid municipal waste bins outside Government Primary School have not been cleared for 6 days. Foul odor is entering classrooms and stray animals are aggressive.',
            'category': 'GARBAGE', 'dept': 'SANIT', 'staff': 'staff.sanit@civicease.demo',
            'status': 'assigned', 'priority': 'high', 'prio_reason': 'Health and hygiene hazard for school children',
            'address': 'Opposite Govt Primary School, 8th Main', 'locality': 'Jayanagar Zone',
            'citizen': citizen1, 'sub_days': 2
        },
        {
            'tracking_ref': 'CIV-SAN-002',
            'title': 'Illegal Commercial Waste Dumping on Pedestrian Sidewalk',
            'description': 'Restaurant and packaging waste dumped illegally across 50 meters of pedestrian sidewalk. Blocks morning commuters and pedestrians.',
            'category': 'GARBAGE', 'dept': 'SANIT', 'staff': 'staff.sanit@civicease.demo',
            'status': 'submitted', 'priority': 'medium', 'prio_reason': 'Sanitation clearance and sidewalk obstruction',
            'address': '100ft Road Footpath near Metro Pillar 140', 'locality': 'Indiranagar Zone',
            'citizen': citizen2, 'sub_days': 1
        },

        # 5. Drainage Department
        {
            'tracking_ref': 'CIV-DRN-001',
            'title': 'Open Overflowing Sewer Manhole at Main Traffic Junction',
            'description': 'Manhole cover displaced with heavy black sewage bubbling over the intersection. Pedestrians cannot cross and foul stench is unbearable.',
            'category': 'DRAINAGE', 'dept': 'DRAIN', 'staff': 'staff.drain@civicease.demo',
            'status': 'in_progress', 'priority': 'critical', 'prio_reason': 'Hazardous fall risk and biohazard sewage spill on roadway',
            'address': 'Station Road & Tank Bund Junction', 'locality': 'Central Ward',
            'citizen': citizen1, 'sub_days': 1
        },
        {
            'tracking_ref': 'CIV-DRN-002',
            'title': 'Clogged Stormwater Silt Drain Causing Localized Inundation',
            'description': 'Stormwater drainage culvert is completely silted up with debris. Normal rains lead to knee-deep water stagnation for hours.',
            'category': 'DRAINAGE', 'dept': 'DRAIN', 'staff': 'staff.drain@civicease.demo',
            'status': 'under_review', 'priority': 'medium', 'prio_reason': 'Monsoon pre-clearing and waterlogging prevention',
            'address': 'Cross 9, low-lying colony', 'locality': 'Koramangala Ward',
            'citizen': citizen2, 'sub_days': 3
        },

        # 6. Parks & Public Facilities
        {
            'tracking_ref': 'CIV-PRK-001',
            'title': 'Fallen Old Banyan Tree Branch Blocking Central Park Walkway',
            'description': 'A large 20-foot tree limb snapped during yesterday storm and is blocking the primary jogging and wheelchair track inside Central Public Park.',
            'category': 'PARKS', 'dept': 'PARKS', 'staff': 'staff.parks@civicease.demo',
            'status': 'assigned', 'priority': 'medium', 'prio_reason': 'Accessibility obstruction for morning walkers and disabled citizens',
            'address': 'Central Civic Park, South Gate Track', 'locality': 'Park Division',
            'citizen': citizen1, 'sub_days': 1
        },
        {
            'tracking_ref': 'CIV-PRK-002',
            'title': 'Broken Children Swings & Sharp Rusty Metal on Playground Slides',
            'description': 'Two children swing chains broken and metal slide sheet has sharp rusted edges exposed. Two children suffered minor scratches.',
            'category': 'PARKS', 'dept': 'PARKS', 'staff': 'staff.parks@civicease.demo',
            'status': 'submitted', 'priority': 'high', 'prio_reason': 'Child safety and park amenity repair',
            'address': 'Community Garden Children Play Area', 'locality': 'Malleswaram Ward',
            'citizen': citizen2, 'sub_days': 2
        },

        # 7. Public Safety Department
        {
            'tracking_ref': 'CIV-SFT-001',
            'title': 'Deep Unfenced 12ft Excavation Pit without Warning Signs or Barricades',
            'description': 'A deep 12-foot utility excavation pit left completely open and unguarded beside a crowded pavement and playground. High risk of fatal falls.',
            'category': 'SAFETY', 'dept': 'SAFETY', 'staff': 'staff.safety@civicease.demo',
            'status': 'under_review', 'priority': 'critical', 'prio_reason': 'Immediate fall hazard to pedestrians and children',
            'address': 'Ring Road Service Lane, near Play School', 'locality': 'Outer Zone',
            'citizen': citizen1, 'sub_days': 1
        },
        {
            'tracking_ref': 'CIV-SFT-002',
            'title': 'Heavy Rusted Billboard Iron Frame Dangling Precariously',
            'description': 'High wind has unfastened two brackets of a 15-foot commercial billboard frame above a busy pedestrian crossing. Dangling directly over traffic.',
            'category': 'SAFETY', 'dept': 'SAFETY', 'staff': 'staff.safety@civicease.demo',
            'status': 'in_progress', 'priority': 'critical', 'prio_reason': 'Overhead collapse hazard over pedestrian road',
            'address': 'Bannerghatta Junction, overhead gantry', 'locality': 'South Zone',
            'citizen': citizen2, 'sub_days': 2
        },

        # 8. General Services
        {
            'tracking_ref': 'CIV-GEN-001',
            'title': 'Citizen Self-Service Public Kiosk Display Malfunctioning & Frozen',
            'description': 'The digital public service touch-screen kiosk at the Sub-Registrar office entrance is rebooting in a loop and touch screen is unresponsive.',
            'category': 'OTHER', 'dept': 'GEN', 'staff': 'staff.gen@civicease.demo',
            'status': 'under_review', 'priority': 'low', 'prio_reason': 'Digital civic amenity hardware maintenance',
            'address': 'Civic Amenity Center, Ground Floor lobby', 'locality': 'City Center',
            'citizen': citizen1, 'sub_days': 3
        },
        {
            'tracking_ref': 'CIV-GEN-002',
            'title': 'Vandalized Municipal Directional Signage to District Hospital',
            'description': 'Key directional signboards showing emergency ambulance route to District General Hospital are sprayed with graffiti and bent backwards.',
            'category': 'OTHER', 'dept': 'GEN', 'staff': 'staff.gen@civicease.demo',
            'status': 'assigned', 'priority': 'medium', 'prio_reason': 'Emergency hospital route orientation for ambulance and public',
            'address': 'Hospital Approach Road, 3rd Circle', 'locality': 'Medical Zone',
            'citizen': citizen2, 'sub_days': 2
        },
    ]

    for item in complaints_to_create:
        c = Complaint(
            tracking_ref=item['tracking_ref'],
            title=item['title'],
            description=item['description'],
            category_id=cats[item['category']].id,
            citizen_id=item['citizen'].id,
            department_id=depts[item['dept']].id,
            assigned_staff_id=users[item['staff']].id,
            status=item['status'],
            priority=item['priority'],
            priority_reason=item['prio_reason'],
            address=item['address'],
            locality=item['locality'],
            submitted_at=now - timedelta(days=item['sub_days']),
            acknowledged_at=now - timedelta(days=item['sub_days'], hours=-4) if item['status'] != 'submitted' else None
        )
        db.session.add(c)
        db.session.flush()

        # History events
        h1 = StatusHistory(
            complaint_id=c.id,
            to_status='submitted',
            from_status=None,
            created_at=now - timedelta(days=item['sub_days']),
            remarks='Complaint submitted by citizen'
        )
        db.session.add(h1)

        if item['status'] in ['under_review', 'assigned', 'in_progress', 'resolved']:
            h2 = StatusHistory(
                complaint_id=c.id,
                to_status=item['status'],
                from_status='submitted',
                changed_by_id=users[item['staff']].id,
                created_at=now - timedelta(hours=12),
                remarks=f'Status set to {item["status"].replace("_", " ")} by assigned department officer'
            )
            db.session.add(h2)

    db.session.commit()
    print("Successfully reseeded 16 fresh complaints across all 8 departments!")
