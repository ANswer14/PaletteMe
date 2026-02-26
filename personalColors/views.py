import threading
from datetime import datetime, timedelta
import base64
from PIL import Image as PILImage
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect
from requests.auth import HTTPBasicAuth
import io
from .service.personalColorCalc import *
from .models import ColorHistory, RecentImages, FavoriteImages
import json
import os
import requests
from dotenv import load_dotenv
from .service.dfs_xy_converter import map_to_grid
from .service.colorCodeCalc import calc_color_codes
from google import genai
from google.genai import types
import uuid
from django.core.files.base import ContentFile
import random
from tenacity import retry, stop_after_attempt, wait_random_exponential, retry_if_exception_type
from google.genai.errors import ServerError

load_dotenv() # .env 파일 로드
temp_storage = {} # 스레드 정보 임시 저장소
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

# colorInfo.html 렌더링 함수
@login_required(login_url='/accounts/login/')
def get_color_info(request):
    color, date, mood, good_color, bad_color = None, None, None, None, None
    try:
        # executed_at 필드를 기준으로 가장 최신 데이터 1건 가져오기
        selected_history = request.user.color_history.filter(user=request.user, is_enabled=True).first()
        print(selected_history)

        # 데이터 받아오기
        color = selected_history.color_type
        date = selected_history.executed_at
        mood = selected_history.mood
        good_color = selected_history.good_color
        bad_color = selected_history.bad_color
        is_saved = True # 데이터 있는지 없는지 판별용 변수
    except AttributeError as e:
        # 아직 진단 기록이 없는 경우에 대한 예외 처리
        is_saved = False
    return render(request, 'personalColors/infoColor.html', {'color':color,
                                                             'date': date, 'mood': mood,
                                                             'good_color': good_color,
                                                             'bad_color': bad_color,
                                                             'is_saved': is_saved,})

@login_required(login_url='/accounts/login/')
def enable_color_info(request):
    history_id = request.GET.get('history_id')
    true_history = request.user.color_history.filter(user=request.user, is_enabled=True).first()
    if true_history:
        true_history.is_enabled = False
        true_history.save()

    selected_history = request.user.color_history.filter(history_id=history_id).first()
    selected_history.is_enabled = True
    selected_history.save()

    return JsonResponse({'status': 'success'})


# colorTest.html 렌더링 함수
@login_required(login_url='/accounts/login/')
def test_color(request):
    user = request.user
    if request.method == 'POST':
        page = int(request.POST.get('page', 1)) # 만약 pageNo를 쿼리 파라미터(URI)에서 찾지 못하면 기본값 1
        warm = int(request.POST.get('warm', 1))
        cool = int(request.POST.get('cool', 1))
        light = int(request.POST.get('light', 1))
        dark = int(request.POST.get('dark', 1))
        mute = int(request.POST.get('mute', 1))
        vivid = int(request.POST.get('vivid', 1))
        idk = int(request.POST.get('idk', 1))
        gender = user.gender # 유저 성별 받아옴
        return render(request, 'personalColors/colorTest.html', {'page': page, 'warm': warm, 'cool': cool, 'light': light,
                                                                 'dark': dark, 'mute': mute, 'vivid': vivid, 'idk': idk, 'gender': gender})
    return render(request, 'personalColors/colorTest.html',
                  {'page': 1, 'warm': 0, 'cool': 0, 'light': 0,
                   'dark': 0, 'mute': 0, 'vivid': 0, 'idk': 0})

# 설문 결과 받아온 후 colorResult.html 렌더링 함수
@login_required(login_url='/accounts/login/')
def get_result_color(request):
    if request.method == 'POST':
        # 설문 결과 받아오기
        tone, mood, good_color, bad_color = calc_color(request)
        color_codes = [calc_color_codes(good_color)]

        return render(request, 'personalColors/colorResult.html', {'tone': tone, 'mood': mood, 'good_color': good_color, 'bad_color': bad_color, 'color_codes': color_codes})
    return redirect(request, 'personalColors/infoColor.html')

# 설문 결과 저장 함수(AJAX)
@login_required(login_url='/accounts/login/')
def save_info(request):
    if request.method == 'POST':
        user_history = request.user.color_history.all() # 유저의 기존 퍼스널 컬러 모두 가져오기
        history_count = user_history.count() # 가져온 row 수 세기

        if history_count == 5: # 5개 이상 못하게 제한
            oldest_history = user_history.order_by('executed_at').first() # 가장 처음 만들어진 퍼스널 컬러 전적
            if oldest_history:
                oldest_history.delete() # 해당 row 삭제

        prior_history = user_history.filter(is_enabled=True).first()
        if prior_history:
            prior_history.is_enabled = False
            prior_history.save()
        # 새로운 결과 데이터 지정
        data = json.loads(request.body)
        color_type = data.get('colorType')
        mood = data.get('mood')
        good_color = data.get('goodColor')
        bad_color = data.get('badColor')
        new_history = ColorHistory(
            user=request.user,
            color_type=color_type,
            mood=mood,
            good_color=good_color,
            bad_color=bad_color,
        )

        # DB에 저장
        new_history.save()
        return JsonResponse({'status': 'success', 'message': f'{color_type} 저장 완료!'})
    return JsonResponse({'status': 'fail', 'message': '저장 실패'})

# 지도 화면 렌더링 함수: weatherInfo.html 렌더링 함수
@login_required(login_url='/accounts/login/')
def get_map(request):
    KAKAO_MAP_API_KEY = os.getenv('KAKAO_MAP_API_KEY') # 카카오 맵 API KEY
    return render(request, 'personalColors/weatherInfo.html', {'KAKAO_MAP_API_KEY': KAKAO_MAP_API_KEY})

# 기상청 API 통한 날씨 데이터 받아오는 AJAX용 함수
@login_required(login_url='/accounts/login/')
def get_weather(request):
    # print('도착 완료!')
    if request.method == 'POST':
        # print('정상적인 POST 요청!')
        data = json.loads(request.body)
        x, y = data['latitude'], data['longitude']
        # print('x좌표, y좌표', x, y)
        x, y = float(x), float(y)
        nx, ny = map_to_grid(x, y)

        now = datetime.now()
        base_times = [2, 5, 8, 11, 14, 17, 20, 23]
        # 안전하게 데이터가 올라오는 15분을 뺀 시각으로 계산
        check_time = now - timedelta(minutes=15)
        last_base_hour = [bt for bt in base_times if bt <= check_time.hour]

        if not last_base_hour:  # 만약 02시 이전이라면 어제 23시 데이터를 가져옴
            base_date = (now - timedelta(days=1)).strftime('%Y%m%d')
            base_time = "2300"
        else:
            base_date = now.strftime('%Y%m%d')
            # base_time = f"{max(last_base_hour):02d}00"
            base_time = '0200'
        # print(base_time)

        url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'
        params = {
            'serviceKey': os.getenv('FCST_API_KEY'),
            'pageNo': '1',
            'numOfRows': '1000',  # 3일치를 다 받으려면 넉넉히 설정
            'dataType': 'JSON',
            'base_date': base_date,
            'base_time': base_time,
            'nx': nx,
            'ny': ny
        }


        response = requests.get(url, params=params)
        cond_time = f"{max(last_base_hour):02d}00"

        if response.status_code == 200:
            res_json = response.json()
            # 응답 구조가 정상인지 확인 (header의 resultCode가 00인 경우)
            if res_json.get('response').get('header').get('resultCode') == '00':
                items = res_json.get('response').get('body').get('items').get('item')
                forecast_dict = {}
                TMNTMX_dict = {}
                for item in items:
                    # 날짜와 시간을 합쳐서 키로 사용 (예: "202405201500")
                    key1 = item['fcstDate'] + item['fcstTime']
                    key2 = item['fcstDate']
                    # if int(key1) >= int(base_date + cond_time):
                    if key1 not in forecast_dict:
                        forecast_dict[key1] = {
                            'date': item['fcstDate'],
                            'time': item['fcstTime'],
                        }
                    if key2 not in TMNTMX_dict:
                        TMNTMX_dict[key2] = {}

                    if item['fcstTime'] == '0600':
                        if item['category'] == 'TMN':
                            TMNTMX_dict[key2]['TMN'] = item['fcstValue']
                    if item['fcstTime'] == '1500':
                        if item['category'] == 'TMX':
                            TMNTMX_dict[key2]['TMX'] = item['fcstValue']

                    forecast_dict[key1][item['category']] = item['fcstValue']
                    # print(TMNTMX_dict)

                sorted_forecast = sorted(forecast_dict.values(), key=lambda a: (a['date'], a['time']))
            else:
                print("API 응답 에러:", res_json.get('response').get('header').get('resultMsg'))
        jsonRes = {
            'status': 'success',
            'forecast_list': sorted_forecast,
            'TMNTMX_dict': TMNTMX_dict,
            'condition': base_date + cond_time,
        }
        # print(sorted_forecast)

        return JsonResponse(jsonRes, safe=False)

# 멀티스레드 작업 시작 및 finalResult.html 렌더링 함수
@login_required(login_url='/accounts/login/')
def generate_start(request):
    if request.method == 'POST':
        temp = request.POST['temp'] # 기온
        weather = request.POST['weather'] # 강수 상태
        sky = request.POST['sky'] # 하늘 상태
        address = request.POST['address'] # 주소(대략적 주소)

        session_id = request.session.session_key # 현재 유저 세션 id
        # print('generateStart POST 방식')
        # [방어 로직] 이미 해당 세션의 작업이 진행 중인지 확인
        if session_id in temp_storage and temp_storage[session_id]['status'] == 'processing':
            return redirect('/personalColors/map')

        # stop_event: 중단 신호용 플래그(Event 객체 저장)
        stop_event = threading.Event()

        temp_storage[session_id] = {'status': 'processing', 'image': None, 'stop_event': stop_event}

        thread = threading.Thread(
            target=generate_img_thread,
            args=(request, session_id, temp, weather, sky, stop_event)
        )
        thread.daemon = True # 프로세스 종료 시 함께 종료되도록 설정
        thread.start() # 작업 떠넘기기 시작
        temp_storage[session_id]['thread'] = thread  # 스레드 객체 저장


        color_type = request.user.color_history.all().values('color_type').order_by('-executed_at').first()['color_type']

        return render(request, 'personalColors/finalResult.html', {'temp': temp + '°C', 'weather': weather, 'sky': sky, 'colorType': color_type, 'address': address})
    elif request.method == 'GET':
        # print('generateStart GET')
        return redirect('/personalColors/map')

# livepreview 기능 활용 위한 주기적인 이미지 상태 확인 함수
@login_required(login_url='/accounts/login/')
def check_status(request):
    session_id = request.session.session_key
    auth = HTTPBasicAuth(os.getenv("SD_API_USER"), os.getenv("SD_API_PASSWORD")) # SD_API 인증용 변수
    result = temp_storage.get(session_id)

    if not result or (result.get('stop_event') and result['stop_event'].is_set()):
        return JsonResponse({
            'status': 'stopped',
            'message': '작업이 중단되었거나 세션이 만료되었습니다.'
        }, status=410)  # 410 Gone 또는 200으로 보내고 JS에서 처리

    # 1. SD 서버에 현재 진행 상황 물어보기
    prog_res = requests.get(os.getenv('SD_API_URL') + "progress", auth=auth)
    prog_data = prog_res.json()
    if result and result['status'] == 'completed':
        data = temp_storage.get(session_id)
        return JsonResponse(data)

    # 진행 중이라면 라이브 프리뷰 데이터 반환
    return JsonResponse({'status': 'processing',
                         'progress': prog_data['progress'], # 0.0 ~ 1.0 사이의 값
                         'current_image': prog_data['current_image'] # Base64 미리보기 이미지
                         })

# 떠넘겨진 작업
@retry(
    retry=retry_if_exception_type(ServerError),
    wait=wait_random_exponential(min=1, max=60),
    stop=stop_after_attempt(5),
    before_sleep=lambda retry_state: print(f"재시도 중... {retry_state.attempt_number}회차")
)
def generate_img_thread(request, session_id, temp, weather, sky, stop_event):


    url_options = os.getenv('SD_API_URL') + "options"
    url_txt2img = os.getenv('SD_API_URL') + "txt2img"
    auth = HTTPBasicAuth(os.getenv("SD_API_USER"), os.getenv("SD_API_PASSWORD"))
    # print('generate_img_thread 진입!!')

    color_list = request.user.color_history.all().values('color_type', 'good_color', 'bad_color').order_by('-executed_at').first()
    print(color_list) # 해당 유저의 퍼스널 컬러 정보 갖고오기

    if request.user.gender == 'M':
        gender = '남성'
    else:
        gender = '여성'
    print(gender)
    if stop_event.is_set(): return # Gemini 연동 전 중단 요청이 들어왔는지 확인
    response = client.models.generate_content(
        model=model,
        contents=f"{system_prompt}\n날씨 정보: 하늘의 상태 - {sky}, 체감온도 - {temp}, 강수 상태 - {weather}\n"
                 f"사용자 정보: 성별 - {gender}, "
                 f"color_type - {color_list['color_type']}, "
                 f"잘 어울리는 색 - {color_list['good_color']}, "
                 f"어울리지 않는 색 - {color_list['bad_color']}\n"
                 f"위 정보를 바탕으로잘 어울리는 의상을 입은 사진을 만들어줘"
    )
    # print('gemini 연동!')

    option_payload = {"sd_model_checkpoint": 'majicmixRealistic_v7.safetensors'}

    if stop_event.is_set(): return # SD 모델 설정 전 중단 요청이 들어왔는지 확인
    requests.post(url_options, json=option_payload, auth=auth)
    # print('SD 연결!! ')

    json_text = response.text.replace('```json', '').replace('```', '').strip()
    data = json.loads(json_text)

    # print(data)
    # 2. 추출된 데이터 활용
    optimized_prompt = data.get('sd_prompt')
    print('sd_prompt', optimized_prompt)
    description = data.get('description')

    # --- [단계 2] 실제 이미지 생성 요청 ---
    generate_img(request, session_id, stop_event, optimized_prompt, url_txt2img, auth, description)

# 실제 이미지 생성 요청 함수
def generate_img(request, session_id, stop_event, optimized_prompt, url_txt2img, auth, description):

    try:
        if request.user.gender == 'F':
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
        else:
            print('남성')
            payload = {
                "prompt": f"simple casual outfit, 1boy, handsome male, asian, everyday wear, full body:1.4, full body view:1.4, full body view from head to toe, {optimized_prompt}",
                "negative_prompt": "(worst quality:2), (low quality:2), (normal quality:2), lowres, watermark",
                "steps": 20,
                'seed': 3550513535,
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

        if stop_event.is_set(): return # 실제 이미지 생성 요청 전 중단 요청 확인
        sd_res = requests.post(url_txt2img, json=payload, auth=auth, timeout=60)

        if sd_res.status_code != 200:
            print("SD 작업이 외부(Interrupt)에 의해 중단되었습니다.")
            return
        if stop_event.is_set(): return  # 분석 수행 전 체크
        if sd_res.status_code == 200:
            # print('1')
            # 1. 생성된 이미지(Base64) 가져오기
            base64_image = sd_res.json()['images'][0]
            # print('2')

            # 2. Base64를 PIL 이미지 객체로 변환 (Gemini 분석용)
            img_data = base64.b64decode(base64_image)
            # print('3')
            img_obj = PILImage.open(io.BytesIO(img_data))
            # print('4')

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

            if stop_event.is_set(): return  # 이미지 분석 전 중단 요청 확인
            # 이미지 분석
            analysis_res = client.models.generate_content(
                model=model,  # 멀티모달에 최적화된 모델 권장
                contents=[analysis_prompt, img_obj],
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            # print('5')

            # 분석된 결과
            search_data = json.loads(analysis_res.text)
            # print(search_data)

            # 4. [추가] 이제 이 키워드로 네이버/쿠팡 API를 호출하여 진짜 URL을 가져옵니다.
            # (아래 get_real_shopping_link 함수는 별도로 구현 필요)
            gender = ''
            if request.user.gender == 'M':
                gender = '남성'
            elif request.user.gender == 'F':
                gender = '여성'
            real_outer_url = get_real_shopping_link(gender + '의류', search_data['outer_query'])
            real_top_url = get_real_shopping_link(gender + '의류', search_data['top_query'])
            real_pants_url = get_real_shopping_link(gender + '의류', search_data['pants_query'])
            real_shoes_url = get_real_shopping_link(gender + '신발', search_data['shoes_query'])

            # 결과를 전역 변수에 저장 (나중에 View가 가져갈 수 있게)
            temp_storage[session_id] = {
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
            save_image(request, base64_image)  # 해당 이미지 최근 이미지 테이블에 저장
    except Exception as e:
        print(f'이미지 생성 중단 혹은 에러 발생: {e}')
        return

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
        # print(0)
        if items:
            # print(0)
            for item in items:
                if gender == '남성의류' or gender == '남성신발':
                    # print(0)
                    if item['category2'] == gender:
                        # print(item['link'])
                        if 'catalog' in item['link']:
                            return f'https://search.shopping.naver.com/ns/search?query={query}'
                        return item['link']
                elif gender == '여성의류' or gender == '여성신발':
                    if item['category2'] == gender:
                        if 'catalog' in item['link']:
                            return f'https://search.shopping.naver.com/ns/search?query={query}'
                        return item['link']
    return f'https://search.shopping.naver.com/ns/search?query={query}'

# 이미지 저장 로직
def save_image(request, image_url):
    user_results = RecentImages.objects.filter(user=request.user).order_by('created_at') # 최근 이미지 레코드 모두 가져오기

    if user_results.count() >= 5: # 개수가 5개 이상일 때
        oldest_result = user_results.first() # 가장 예전 기록
        oldest_result.delete() # 행 삭제 (django-cleanup이 실제 파일도 삭제함)

    file_name = f'{uuid.uuid4()}.png' # 파일명은 중복 방지를 위해 UUID 사용
    image_data = ContentFile(base64.b64decode(image_url), name=file_name) # Base64를 장고가 이해하는 파일 객체로 변환

    result_instance = RecentImages(
        user = request.user,
    ) # 저장 객체

    result_instance.result_image.save(file_name, image_data, save=True) # 저장

# 즐겨찾기 저장 로직(AJAX)
@login_required(login_url='/accounts/login/')
def save_favorite(request):
    session_id = request.session.session_key
    img = temp_storage[session_id]['image']
    file_name = f'{uuid.uuid4()}.png'  # 파일명은 중복 방지를 위해 UUID 사용


    favorite_instance = FavoriteImages(
        user = request.user,
    )


    favorite_instance.favorite_image.save(file_name, ContentFile(base64.b64decode(img), name=file_name), save=True)
    return JsonResponse({'status': 'success'})