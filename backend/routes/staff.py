"""Staff routes - dashboard, updates, escalations."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Complaint, User, Department, StatusHistory
from extensions import db
from routing_engine import record_status_change
from datetime import datetime

staff_bp = Blueprint('staff', __name__, url_prefix='/api/staff')

def get_staff_user(user_id):
    user = User.query.get(user_id)
    if not user or user.role.name not in ['staff', 'supervisor', 'admin']:
        return None
    return user

@staff_bp.route('/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    user_id = int(get_jwt_identity())
    user = get_staff_user(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    query = Complaint.query
    if user.role.name in ['staff', 'supervisor'] and user.department_id:
        query = query.filter_by(department_id=user.department_id)

    complaints = query.order_by(Complaint.submitted_at.desc()).all()
    return jsonify({
        'success': True,
        'complaints': [c.to_dict() for c in complaints]
    })

@staff_bp.route('/complaints/<int:complaint_id>/status', methods=['PUT'])
@jwt_required()
def update_status(complaint_id):
    user_id = int(get_jwt_identity())
    user = get_staff_user(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    data = request.get_json() or {}
    new_status = data.get('status')
    remarks = data.get('remarks')
    
    if not new_status:
        return jsonify({'success': False, 'message': 'Status is required'}), 400

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'success': False, 'message': 'Complaint not found'}), 404
        
    if user.role.name in ['staff', 'supervisor'] and user.department_id != complaint.department_id:
         return jsonify({'success': False, 'message': 'Cannot modify complaints from other departments'}), 403

    if new_status == 'resolved':
        complaint.resolved_at = datetime.utcnow()
        complaint.resolution_notes = remarks
    elif new_status == 'closed':
        complaint.closed_at = datetime.utcnow()
        
    if new_status == 'in_progress' and not complaint.acknowledged_at:
        complaint.acknowledged_at = datetime.utcnow()

    record_status_change(complaint, new_status, changed_by=user, remarks=remarks)
    db.session.commit()

    return jsonify({
        'success': True,
        'complaint': complaint.to_dict(include_history=True)
    })
