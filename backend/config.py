import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-change-me')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 86400 * 7  # 7 days

    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///civicease.db')
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 5242880))
    ALLOWED_EXTENSIONS = set(os.environ.get('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,pdf').split(','))

    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    AI_PROVIDER = os.environ.get('AI_PROVIDER', 'none')
    AI_API_KEY = os.environ.get('AI_API_KEY', '')

    RATELIMIT_DEFAULT = "10000 per day;2000 per hour"
    RATELIMIT_STORAGE_URL = "memory://"
