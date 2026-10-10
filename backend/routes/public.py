"""Public routes - categories, departments, stats."""
from flask import Blueprint, jsonify
from models import ServiceCategory, Department, Complaint
from extensions import limiter

public_bp = Blueprint('public', __name__, url_prefix='/api/public')

@public_bp.route('/categories', methods=['GET'])
@limiter.exempt
def get_categories():
    categories = ServiceCategory.query.filter_by(is_active=True).order_by(ServiceCategory.sort_order).all()
    return jsonify({'success': True, 'categories': [c.to_dict() for c in categories]})

@public_bp.route('/departments', methods=['GET'])
@limiter.exempt
def get_departments():
    departments = Department.query.filter_by(is_active=True).all()
    return jsonify({'success': True, 'departments': [d.to_dict() for d in departments]})

@public_bp.route('/stats', methods=['GET'])
@limiter.exempt
def get_stats():
    total_complaints = Complaint.query.count()
    resolved_complaints = Complaint.query.filter_by(status='resolved').count()
    return jsonify({
        'success': True, 
        'stats': {
            'total': total_complaints,
            'resolved': resolved_complaints
        }
    })
