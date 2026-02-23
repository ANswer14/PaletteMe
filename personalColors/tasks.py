# tasks.py
from random import random

from google.genai import types
import os, json, base64, io
from celery import shared_task
import requests
from PIL import Image as PILImage
from django.core.cache import cache
from django.core.files.base import ContentFile
from requests.auth import HTTPBasicAuth
from google import genai
from accounts.models import CustomUser
from personalColors.models import RecentImages
import uuid

# 필요한 분석 라이브러리 및 네이버 API 함수 import
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY')) # API 연결
model = 'gemini-3-flash-preview' # api 모델
system_prompt = f""" 
        당신은 Stable Diffusion 프롬프트 전문가입니다. 
        사용자의 요청을 받아서 이미지를 생성하기 위한 영어 프롬프트와 
        그 이미지에 대한 한국어 설명을 JSON 형식으로 응답하세요.
        사용자가 전신이라는 말을 안 해도 무조건 전신 구도로 생성해주세요.
        응답 형식: 
        {{
            "sd_prompt": "english prompt here",
            "description": "이미지 속 의상과 사람에 대한 한국어 설명"
        }}
        """ # 프롬프트
# 이미지 저장 로직
def save_image(user, image_url):
    user_results = RecentImages.objects.filter(user=user).order_by('created_at') # 최근 이미지 레코드 모두 가져오기

    if user_results.count() >= 5: # 개수가 5개 이상일 때
        oldest_result = user_results.first() # 가장 예전 기록
        oldest_result.delete() # 행 삭제 (django-cleanup이 실제 파일도 삭제함)

    file_name = f'{uuid.uuid4()}.png' # 파일명은 중복 방지를 위해 UUID 사용
    image_data = ContentFile(base64.b64decode(image_url), name=file_name) # Base64를 장고가 이해하는 파일 객체로 변환

    result_instance = RecentImages(
        user = user,
    ) # 저장 객체

    result_instance.result_image.save(file_name, image_data, save=True) # 저장

# 네이버 검색 API 활용한 쇼핑 링크 반환 함수
def get_real_shopping_link(gender, query):
    headers = {
        "X-Naver-Client-Id": os.getenv('NAVER_CLIENT_ID'),
        "X-Naver-Client-Secret": os.getenv('NAVER_CLIENT_SECRET')
    }
    url = f"https://openapi.naver.com/v1/search/shop.json?query={gender, query}&display=30&start={random.randint(1, 900)}"
    res = requests.get(url, headers=headers)
    # print(res.json())

    if res.status_code == 200:
        items = res.json().get('items', [])
        if items:
            for item in items:
                if gender == '남성의류' or gender == '남성신발':
                    if item['category2'] == gender:
                        print(item['link'])
                        print(item)
                        return item['link']
                elif gender == '여성의류' or gender == '여성신발':
                    if item['category2'] == gender:
                        return item['link']
    return "연결 가능한 상품을 찾지 못했습니다."

@shared_task(bind=True)
def async_generate_process(self, user_id, session_id, weather_data, color_data):
    """
    기존 generate_img_thread + generate_img 로직을 비동기로 수행
    """

    url_options = os.getenv('SD_API_URL') + "options"
    url_txt2img = os.getenv('SD_API_URL') + "txt2img"
    auth = HTTPBasicAuth(os.getenv("SD_API_USER"), os.getenv("SD_API_PASSWORD"))
    user = CustomUser.objects.get(id=user_id)
    print('generate_img_thread 진입!!')

    color_list = user.color_history.all().values('color_type', 'good_color', 'bad_color').order_by(
        '-executed_at').first()
    print(color_list)  # 해당 유저의 퍼스널 컬러 정보 갖고오기

    if user.gender == 'M':
        gender = '남성'
    else:
        gender = '여성'
    # if stop_event.is_set(): return  # Gemini 연동 전 중단 요청이 들어왔는지 확인
    response = client.models.generate_content(
        model=model,
        contents=f"{system_prompt}\n날씨 정보: 하늘의 상태 - {weather_data['sky']}, 체감온도 - {weather_data['temp']}, 강수 상태 - {weather_data['weather']}\n"
                 f"사용자 정보: 성별 - {gender}, "
                 f"color_type - {color_list['color_type']}, "
                 f"잘 어울리는 색 - {color_list['good_color']}, "
                 f"어울리지 않는 색 - {color_list['bad_color']}\n"
                 f"위 정보를 바탕으로잘 어울리는 의상을 입은 사진을 만들어줘"
    )
    print('gemini 연동!')

    option_payload = {"sd_model_checkpoint": 'majicmixRealistic_v7.safetensors'}

    # if stop_event.is_set(): return  # SD 모델 설정 전 중단 요청이 들어왔는지 확인
    requests.post(url_options, json=option_payload, auth=auth)
    print('SD 연결!! ')

    json_text = response.text.replace('```json', '').replace('```', '').strip()
    data = json.loads(json_text)

    print(data)
    # 2. 추출된 데이터 활용
    optimized_prompt = data.get('sd_prompt')
    description = data.get('description')

    # --- [단계 2] 실제 이미지 생성 요청 ---
    # 1. Gemini 연동 로직 (의상 추천 프롬프트 생성)
    # 2. SD 모델 설정 (Options)
    # 3. SD 이미지 생성 요청 (txt2img)
    # 4. 생성된 이미지 Gemini 멀티모달 분석
    # 5. 쇼핑몰 링크 추출
    try:
        payload = {
            "prompt": f"simple casual outfit, asian, everyday wear, full body:1.4, full body view:1.4, full body view from head to toe, {optimized_prompt}",
            "negative_prompt": "(worst quality:2), (low quality:2), (normal quality:2), lowres, watermark",
            "steps": 20,
            'seed': 4216575493,
            'cfg_scale': 7,
            "sampler_name": "Restart",
            "enable_hr": True,
            "hr_upscaler": "8x_NMKD-Superscale_150000_G",  # 확장자 제외, 업스케일러
            "hr_scale": 2,
            'hr_second_pass_steps': 15,
            "denoising_strength": 0.4,
            "override_settings": {"CLIP_stop_at_last_layers": 2,
                                  "sd_vae": 'vae-ft-mse-840000-ema-pruned.ckpt'},  # VAE
        }

        # if stop_event.is_set(): return # 실제 이미지 생성 요청 전 중단 요청 확인
        sd_res = requests.post(url_txt2img, json=payload, auth=auth, timeout=60)

        if sd_res.status_code != 200:
            print("SD 작업이 외부(Interrupt)에 의해 중단되었습니다.")
            return
        # if stop_event.is_set(): return  # 분석 수행 전 체크
        if sd_res.status_code == 200:
            print('1')
            # 1. 생성된 이미지(Base64) 가져오기
            base64_image = sd_res.json()['images'][0]
            print('2')

            # 2. Base64를 PIL 이미지 객체로 변환 (Gemini 분석용)
            img_data = base64.b64decode(base64_image)
            print('3')
            img_obj = PILImage.open(io.BytesIO(img_data))
            print('4')

            # 3. [추가] 생성된 이미지를 Gemini 멀티모달로 정밀 분석
            # 이제 Gemini는 실제 이미지를 보고 검색 키워드를 뽑습니다.
            analysis_prompt = """
                    이미지를 정밀 분석하여 다음 카테고리별로 최적의 네이버 쇼핑 검색어를 뽑아줘.
                    해당 아이템이 없는 경우 빈 문자열("")로 응답해.

                    1. outer: 코트, 자켓, 가디건 등 겉에 입은 옷
                    2. top: 셔츠, 블라우스, 티셔츠 등 안의 상의
                    3. pants: 바지, 스커트 등 하의
                    4. shoes: 신발

                    응답 형식(JSON):
                    {
                        "outer_query": "베이지 오버핏 핸드메이드 코트",
                        "top_query": "화이트 실크 리본 블라우스",
                        "pants_query": "세미 와이드 슬랙스",
                        "shoes_query": "화이트 스틸레토 힐"
                    }
                    """

            # if stop_event.is_set(): return  # 이미지 분석 전 중단 요청 확인
            # 이미지 분석
            analysis_res = client.models.generate_content(
                model=model,  # 멀티모달에 최적화된 모델 권장
                contents=[analysis_prompt, img_obj],
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            print('5')

            # 분석된 결과
            search_data = json.loads(analysis_res.text)
            print(search_data)

            # 4. [추가] 이제 이 키워드로 네이버/쿠팡 API를 호출하여 진짜 URL을 가져옵니다.
            # (아래 get_real_shopping_link 함수는 별도로 구현 필요)
            gender = ''
            if user.gender == 'M':
                gender = '남성'
            elif user.gender == 'F':
                gender = '여성'
            real_outer_url = get_real_shopping_link(gender + '의류', search_data['outer_query'])
            real_top_url = get_real_shopping_link(gender + '의류', search_data['top_query'])
            real_pants_url = get_real_shopping_link(gender + '의류', search_data['pants_query'])
            real_shoes_url = get_real_shopping_link(gender + '신발', search_data['shoes_query'])

            # 결과를 전역 변수에 저장 (나중에 View가 가져갈 수 있게)
            result_data = {
                'status': 'completed',
                'image': sd_res.json()['images'][0],
                'description': description,
                'descriptionDetail': {
                    'outer': search_data['outer_query'],
                    'top': search_data['top_query'],
                    'pants': search_data['pants_query'],
                    'shoes': search_data['shoes_query']
                },
                'recommendations': [
                    {'label': '외투', 'url': real_outer_url},
                    {'label': '상의', 'url': real_top_url},
                    {'label': '하의', 'url': real_pants_url},
                    {'label': '신발', 'url': real_shoes_url},
                ]
            }
            # print(real_top_url)
            # print(real_outer_url)
            # print(real_shoes_url)
            # print(real_pants_url)

            cache.set(f"result_{session_id}", result_data, timeout=600)
            save_image(user, base64_image)  # 해당 이미지 최근 이미지 테이블에 저장
    except Exception as e:
        print(f'이미지 생성 중단 혹은 에러 발생: {e}')

    # 결과를 캐시에 저장 (JS가 꺼내갈 수 있게)
    cache.set(f"result_{session_id}", result_data, timeout=600)

    return f"Task for session {session_id} completed"
