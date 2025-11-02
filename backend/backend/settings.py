from pathlib import Path
import os
import dotenv
from asgiref.sync import async_to_sync

BASE_DIR = Path(__file__).resolve().parent.parent
# Environment
dotenv.load_dotenv(BASE_DIR / ".env")
# Port configuration
PORT = int(os.getenv("PORT", "8000"))
SECRET_KEY = os.getenv("PRODUCTION_KEY", "django-insecure-fallback-key")
DEBUG = os.getenv("DEBUG", "False") == "True"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
BACKEND_HOST = os.getenv("ALLOWED_HOSTS", "localhost").split(",")

ALLOWED_HOSTS = BACKEND_HOST

CORS_ALLOWED_ORIGINS = [FRONTEND_URL]
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "sec-websocket-key",
    "sec-websocket-version",
    "sec-websocket-extensions",
    "sec-websocket-protocol",
]

CSRF_TRUSTED_ORIGINS = [
    "https://convoroom-backend.onrender.com",
    "http://localhost:8000",
]
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        "TEST": {
            "NAME": BASE_DIR / "test_db.sqlite3",
        },
    }
}
INSTALLED_APPS = [
    "daphne",
    "channels",
    "corsheaders",
    "api",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]
# Disable database completely

# Disable auth and migrations
AUTH_PASSWORD_VALIDATORS = []
MIGRATION_MODULES = {
    "auth": None,
    "contenttypes": None,
    "admin": None,
    "sessions": None,
}
WSGI_APPLICATION = "backend.asgi.application"

# WebSocket and ASGI Configuration
ASGI_APPLICATION = "backend.asgi.application"

# Get Redis URL from environment
REDIS_URL = os.environ.get("REDIS_URL") or os.environ.get(
    "redis_host", "redis://localhost:6379/0"
)

# Channel Layers Configuration
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
            "capacity": 1500,
            "expiry": 10,
            # Add these for better WebSocket handling
            "symmetric_encryption_keys": [SECRET_KEY],
        },
    },
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # Add this BEFORE CommonMiddleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# URLs and templates
ROOT_URLCONF = "backend.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Security Settings
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
