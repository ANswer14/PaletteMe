"""
ASGI config for PaletteMe project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
import personalColors.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "PaletteMe.settings")

application = ProtocolTypeRouter({
    # 1. 일반 HTTP 요청 처리
    "http": get_asgi_application(),

    # 2. 웹소켓 요청 처리
    "websocket": AuthMiddlewareStack(
        URLRouter(
            personalColors.routing.websocket_urlpatterns
        )
    ),
})
