import os
from pathlib import Path
from dotenv import load_dotenv
from django.core.exceptions import ImproperlyConfigured

import environ
from corsheaders.defaults import default_headers

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

env = environ.Env(
    DEBUG=(bool, False),
)

env_file = BASE_DIR / ".env"
if env_file.exists():
    environ.Env.read_env(env_file)

SECRET_KEY = env("DJANGO_SECRET_KEY", default="unsafe-secret-key")
DEBUG = env("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["*"])

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'rest_framework',
    'project_app',
    'corsheaders',
    'storages',
    'interior',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'myproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {'context_processors': []},
    },
]

WSGI_APPLICATION = 'myproject.wsgi.application'

if env("DATABASE_URL", default=None):
    DATABASES = {
        "default": env.db("DATABASE_URL"),
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": env("DB_ENGINE", default="django.db.backends.postgresql"),
            "NAME": env("POSTGRES_DB", default="mydb"),
            "USER": env("POSTGRES_USER", default="goodfellow"),
            "PASSWORD": env("POSTGRES_PASSWORD", default="123"),
            "HOST": env("POSTGRES_HOST", default="3.38.94.148"),
            "PORT": env("POSTGRES_PORT", default="5432"),
        }
    }

LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_HEADERS = list(default_headers) + ["x-user-id"]


# === AWS S3 설정 ===
AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID", default=None)
AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY", default=None)
AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME", default=None)
AWS_S3_REGION_NAME = env("AWS_S3_REGION_NAME", default="ap-northeast-2")

if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and AWS_STORAGE_BUCKET_NAME:
    AWS_S3_CUSTOM_DOMAIN = env(
        "AWS_S3_CUSTOM_DOMAIN",
        default=f"{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.amazonaws.com",
    )
    AWS_DEFAULT_ACL = None
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
    AWS_LOCATION = env("AWS_LOCATION", default="project-images")
    MEDIA_URL = env(
        "MEDIA_URL",
        default=f"https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_LOCATION}/",
    )

    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        }
    }
else:
    MEDIA_URL = env("MEDIA_URL", default="/media/")
    MEDIA_ROOT = env("MEDIA_ROOT", default=str(BASE_DIR / "media"))
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        }
    }

# === Logging ===
LOG_DIR = Path(env("DJANGO_LOG_DIR", default=BASE_DIR / "logs"))
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / env("DJANGO_LOG_FILE", default="backend.log")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[%(asctime)s] %(levelname)s %(name)s:%(lineno)d | %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": str(LOG_FILE),
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "project_app": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "interior": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
# ==== SAFETY MODE ====
# prevent Django from running migrations automatically
MIGRATION_MODULES = {
    app: None for app in INSTALLED_APPS
}

OPENAI_TEAM_API_KEY = os.environ.get("OPENAI_TEAM_API_KEY")
if not OPENAI_TEAM_API_KEY:
    raise ImproperlyConfigured("OPENAI_TEAM_API_KEY 환경변수가 설정되어 있지 않습니다.")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ImproperlyConfigured("GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.")

SLLM_MODEL_DIR = os.environ.get("SLLM_MODEL_DIR", str(BASE_DIR / "sllm"))
SLLM_MAX_NEW_TOKENS = int(os.environ.get("SLLM_MAX_NEW_TOKENS", 384))
SLLM_TEMPERATURE = float(os.environ.get("SLLM_TEMPERATURE", 0.7))
SLLM_TOP_P = float(os.environ.get("SLLM_TOP_P", 0.85))
SLLM_TOP_K = int(os.environ.get("SLLM_TOP_K", 40))
SLLM_DEVICE = os.environ.get("SLLM_DEVICE", "auto")

_gemini_timeout_raw = os.environ.get("DESIGN_PIPELINE_GEMINI_TIMEOUT")
if _gemini_timeout_raw:
    _gemini_timeout_value = int(_gemini_timeout_raw)
    DESIGN_PIPELINE_GEMINI_TIMEOUT = _gemini_timeout_value if _gemini_timeout_value > 0 else None
else:
    DESIGN_PIPELINE_GEMINI_TIMEOUT = None  # None = effectively unlimited
