"""Complaints routes - submit and track."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models import Complaint, ServiceCategory, generate_tracking_ref, User, PriorityRule, StatusHistory
from extensions import db, limiter
from routing_engine import determine_priority, route_complaint, record_status_change
from datetime import datetime

complaints_bp = Blueprint('complaints', __name__, url_prefix='/api/complaints')

@complaints_bp.route('/', methods=['POST'])
@limiter.limit("5 per hour")
def submit_complaint():
    data = request.get_json() or {}
    
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    category_id = data.get('category_id')
    address = data.get('address')
    locality = data.get('locality')
    
    if not title or not description or not category_id:
        return jsonify({'success': False, 'message': 'Title, description, and category are required'}), 400
        
    category = ServiceCategory.query.get(category_id)
    if not category:
        return jsonify({'success': False, 'message': 'Invalid category'}), 400

    citizen_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            citizen_id = int(identity)
    except:
        pass

    tracking_ref = generate_tracking_ref()
    
    # Run Priority Engine
    rules = PriorityRule.query.all()
    priority_level, priority_reason = determine_priority(title, description, category.code, rules)

    complaint = Complaint(
        tracking_ref=tracking_ref,
        title=title,
        description=description,
        category_id=category_id,
        citizen_id=citizen_id,
        guest_name=data.get('guest_name'),
        guest_email=data.get('guest_email'),
        guest_phone=data.get('guest_phone'),
        priority=priority_level,
        priority_reason=priority_reason,
        address=address,
        locality=locality,
        landmark=data.get('landmark'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude')
    )
    
    # Run Routing Engine
    dept = route_complaint(complaint)
    if dept:
        complaint.department_id = dept.id
        complaint.status = 'assigned'
    
    db.session.add(complaint)
    db.session.flush()

    # Initial history
    h1 = StatusHistory(complaint_id=complaint.id, to_status='submitted', remarks='Request submitted')
    db.session.add(h1)
    if dept:
        h2 = StatusHistory(complaint_id=complaint.id, from_status='submitted', to_status='assigned', to_department_id=dept.id, remarks=f'Auto-routed to {dept.name}')
        db.session.add(h2)
        
    db.session.commit()
    
    return jsonify({
        'success': True,
        'tracking_ref': tracking_ref,
        'complaint': complaint.to_dict()
    }), 201


@complaints_bp.route('/track/<tracking_ref>', methods=['GET'])
@limiter.limit("20 per minute")
def track_complaint(tracking_ref):
    complaint = Complaint.query.filter_by(tracking_ref=tracking_ref).first()
    if not complaint:
        return jsonify({'success': False, 'message': 'Complaint not found'}), 404
        
    return jsonify({
        'success': True,
        'complaint': complaint.to_dict(include_history=True)
    })

@complaints_bp.route('/mine', methods=['GET'])
@jwt_required()
def my_complaints():
    user_id = int(get_jwt_identity())
    complaints = Complaint.query.filter_by(citizen_id=user_id).order_by(Complaint.submitted_at.desc()).all()
    return jsonify({
        'success': True,
        'complaints': [c.to_dict() for c in complaints]
    })

@complaints_bp.route('/all', methods=['GET'])
def get_all_complaints():
    """Retrieve submitted complaints for the tracker dashboard with department isolation."""
    dept_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user = User.query.get(int(identity))
            if user and user.role.name in ['staff', 'supervisor'] and user.department_id:
                dept_id = user.department_id
    except Exception:
        pass

    query = Complaint.query
    if dept_id:
        query = query.filter_by(department_id=dept_id)
    else:
        req_dept = request.args.get('department_id')
        if req_dept:
            query = query.filter_by(department_id=int(req_dept))

    complaints = query.order_by(Complaint.submitted_at.desc()).all()
    return jsonify({
        'success': True,
        'count': len(complaints),
        'complaints': [c.to_dict(include_history=True) for c in complaints]
    })

@complaints_bp.route('/<int:complaint_id>/review', methods=['PUT', 'PATCH'])
def review_complaint(complaint_id):
    """Review and update status / notes for a complaint from the tracker dashboard."""
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'success': False, 'message': 'Complaint not found'}), 404
        
    data = request.get_json() or {}
    new_status = data.get('status')
    remarks = data.get('remarks') or data.get('notes') or f"Status updated to {new_status}"
    
    if new_status:
        old_status = complaint.status
        complaint.status = new_status
        if new_status == 'resolved':
            complaint.resolved_at = datetime.utcnow()
            complaint.resolution_notes = remarks
        elif new_status == 'closed':
            complaint.closed_at = datetime.utcnow()
            
        history = StatusHistory(
            complaint_id=complaint.id,
            from_status=old_status,
            to_status=new_status,
            remarks=remarks
        )
        db.session.add(history)
        db.session.commit()
        
    return jsonify({
        'success': True,
        'message': 'Complaint status updated successfully',
        'complaint': complaint.to_dict(include_history=True)
    })

