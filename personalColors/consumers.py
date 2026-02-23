# consumers.py
import json
import requests
import os
from channels.generic.websocket import JsonWebsocketConsumer
from .views import temp_storage
from requests.auth import HTTPBasicAuth


class GenerationConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.session_id = self.scope["session"].session_key
        self.accept()
        print(f"✅ 웹소켓 연결 시도됨: {self.session_id}", flush=True)  # flush 추가

    def disconnect(self, close_code):
        print(f"⚠️ 웹소켓 연결 끊김 감지 (코드: {close_code})")

        if self.session_id in temp_storage:
            print(f"🚀 {self.session_id} 작업 중단 프로세스 시작")

            # 1. 파이썬 스레드 플래그 중단
            if 'stop_event' in temp_storage[self.session_id]:
                temp_storage[self.session_id]['stop_event'].set()
                print("--- 스레드 중단 플래그(stop_event) Set 완료")

            # 2. SD WebUI API 인터럽트
            try:
                # URL 주소 정규화 (끝에 /가 있든 없든 정확하게 생성)
                base_url = os.getenv('SD_API_URL').rstrip('/')
                interrupt_url = f"{base_url}/interrupt"

                auth = HTTPBasicAuth(os.getenv("SD_API_USER"), os.getenv("SD_API_PASSWORD"))

                print(f"--- 인터럽트 요청 시도: {interrupt_url}")
                response = requests.post(interrupt_url, auth=auth, timeout=5)

                if response.status_code == 200:
                    print(f"--- ✅ SD 인터럽트 성공 (Status: {response.status_code})")
                else:
                    print(f"--- ❌ SD 인터럽트 실패 (Status: {response.status_code}, Response: {response.text})")
                temp_storage.pop(self.session_id, None)
            except Exception as e:
                print(f"--- ❌ SD 인터럽트 중 예외 발생: {e.__str__()}")
