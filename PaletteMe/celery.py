import os
from celery import Celery

# 장고 설정 파일 로드
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PaletteMe.settings')

app = Celery('PaletteMe')

# Redis를 브로커(대기실)로 사용
app.config_from_object('django.conf:settings', namespace='CELERY')

# 장고 앱 내부의 tasks.py를 자동으로 찾음
app.autodiscover_tasks()