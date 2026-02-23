# consumers.py
from base64 import b64encode
import httpx
from channels.db import database_sync_to_async
from channels.generic.websocket import JsonWebsocketConsumer
from celery.worker.control import revoke
import requests
from django.core.cache import cache
from requests.auth import HTTPBasicAuth
import os
from PaletteMe.celery import app
from dotenv import load_dotenv

load_dotenv()

class GenerationConsumer(JsonWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope["session"].session_key
        await self.accept()
        print(f"✅ 웹소켓 연결 시도됨: {self.session_id}", flush=True)  # flush 추가

    @database_sync_to_async
    def get_stored_task_id(self):
        session_id = self.scope["session"].session_key
        # 캐시에서 해당 세션의 task_id를 가져옵니다.
        return cache.get(f"task_id_{session_id}")

    async def interrupt_sd_webui(self):
        # 1. SD API 주소 및 인증 정보 가져오기
        url = os.getenv('SD_API_URL') + "interrupt"
        user = os.getenv("SD_API_USER")
        password = os.getenv("SD_API_PASSWORD")

        # 2. Basic Auth 헤더 생성 (API-AUTH 설정이 되어있는 경우)
        auth_str = f"{user}:{password}"
        auth_header = b64encode(auth_str.encode()).decode()
        headers = {"Authorization": f"Basic {auth_header}"}

        async with httpx.AsyncClient() as client:
            try:
                # 3. POST 요청으로 중단 신호 전송
                response = await client.post(url, headers=headers, timeout=5.0)
                if response.status_code == 200:
                    print("SD_WEBUI 연산이 성공적으로 중단되었습니다.")
            except Exception as e:
                print(f"SD_WEBUI 중단 요청 중 에러 발생: {e}")

    async def disconnect(self, close_code):
        # 1. 저장해둔 task_id를 가져옴
        task_id = await self.get_stored_task_id()

        if task_id:
            # 2. Celery 작업 강제 종료
            # terminate=True: 현재 실행 중인 프로세스를 즉시 중단
            # signal='SIGKILL': 가차없이 종료 (필요에 따라 SIGTERM 사용)
            app.control.revoke(task_id, terminate=True, signal='SIGKILL')

            # 3. SD_WEBUI에게도 중단 신호 (선택사항)
            # A1111의 /sdapi/v1/interrupt API를 호출하여 GPU 연산 중단
            await self.interrupt_sd_webui()

            # 4. 사용이 끝난 task_id 삭제
            cache.delete(f"task_id_{self.scope['session'].session_key}")