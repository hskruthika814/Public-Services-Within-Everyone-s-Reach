"""Auth routes — register, login, refresh, logout, profile."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                 jwt_required, get_jwt_identity, get_jwt)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from models import User, Role, AuditLog
from extensions import db, limiter
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def _validate_email(email):
    return re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email)


def _validate_password(pwd):
    return len(pwd) >= 8


@auth_bp.route('/register', methods=['POST'])
@limiter.limit("10 per hour")
def register():
    data = request.get_json() or {}
    errors = {}

    full_name = (data.get('full_name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    phone = (data.get('phone') or '').strip()

    if not full_name or len(full_name) < 2:
        errors['full_name'] = 'Full name must be at least 2 characters'
    if not email or not _validate_email(email):
        errors['email'] = 'Valid email address is required'
    if not password or not _validate_password(password):
        errors['password'] = 'Password must be at least 8 characters'

    if errors:
        return jsonify({'success': False, 'errors': errors}), 422

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'errors': {'email': 'Email already registered'}}), 409

    citizen_role = Role.query.filter_by(name='citizen').first()
    if not citizen_role:
        return jsonify({'success': False, 'message': 'System not configured. Please contact admin.'}), 503

    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        password_hash=generate_password_hash(password),
        role_id=citizen_role.id,
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict(),
    }), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("20 per hour")
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    if not user.is_active:
        return jsonify({'success': False, 'message': 'Account is deactivated. Contact support.'}), 403

    user.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'success': True,
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict(),
    })


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({'access_token': access_token})


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    return jsonify({'success': True, 'user': user.to_dict()})


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    data = request.get_json() or {}
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'language_pref' in data and data['language_pref'] in ('en', 'kn'):
        user.language_pref = data['language_pref']
    if 'new_password' in data and data['new_password']:
        current_pwd = data.get('current_password', '')
        if not check_password_hash(user.password_hash, current_pwd):
            return jsonify({'success': False, 'errors': {'current_password': 'Current password is incorrect'}}), 400
        if not _validate_password(data['new_password']):
            return jsonify({'success': False, 'errors': {'new_password': 'Password must be at least 8 characters'}}), 400
        user.password_hash = generate_password_hash(data['new_password'])

    db.session.commit()
    return jsonify({'success': True, 'user': user.to_dict()})
