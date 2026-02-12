# personalColors/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # 프론트엔드에서 new WebSocket('ws://.../ws/generation/') 으로 요청 보낼 주소
    re_path(r'ws/generation/?$', consumers.GenerationConsumer.as_asgi()),
]