import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import api.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(URLRouter(api.routing.websocket_urlpatterns)),
    }
)
# This file is the entry point for ASGI-compatible web servers to serve your project. It should be referenced from your ASGI server, and should not be run directly. It is the equivalent of a WSGI file for ASGI.
