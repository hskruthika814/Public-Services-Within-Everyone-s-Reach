from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from extensions import db, jwt, cors, limiter
from config import Config
from models import User
from seed import seed_all
import os

def create_app(config_class=Config):
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    app = Flask(__name__, static_folder=dist_dir, static_url_path='')
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    limiter.init_app(app)
    Migrate(app, db)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.public import public_bp
    from routes.complaints import complaints_bp
    from routes.staff import staff_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(complaints_bp)
    app.register_blueprint(staff_bp)

    @app.route('/api/health')
    def health_check():
        return jsonify({"status": "ok", "version": "1.0.0"})

    # Serve Unified Frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api'):
            return jsonify({'error': 'Not found'}), 404
        target = os.path.join(app.static_folder, path)
        if path != "" and os.path.exists(target):
            return send_from_directory(app.static_folder, path)
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        return "CivicEase AI Frontend build not found. Run 'npm run build' in frontend directory.", 404

    @app.errorhandler(404)
    def handle_404(e):
        from flask import request
        if request.path.startswith('/api'):
            return jsonify({'error': 'API endpoint not found'}), 404
        if os.path.exists(os.path.join(dist_dir, 'index.html')):
            return send_from_directory(dist_dir, 'index.html'), 200
        return "Not found", 404

    # Create tables and seed data if not exists
    with app.app_context():
        db.create_all()
        seed_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
