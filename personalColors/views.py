import threading
from datetime import datetime, timedelta
import base64
from PIL import Image as PILImage
from django.http import JsonResponse
from django.shortcuts import render, redirect
from requests.auth import HTTPBasicAuth
import io
from .service.personalColorCalc import *
from .models import ColorHistory
import json
import os
import requests
from dotenv import load_dotenv
from .service.dfs_xy_converter import mapToGrid
from google import genai
from google.genai import types

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

# colorInfo 렌더링 함수
def getColorInfo(request):
    color, date, mood, good_color, bad_color = None, None, None, None, None
    try:
        # executed_at 필드를 기준으로 가장 최신 데이터 1건 가져오기
        latest_history = request.user.color_history.latest('executed_at')

        # 데이터 받아오기
        color = latest_history.color_type
        date = latest_history.executed_at
        mood = latest_history.mood
        good_color = latest_history.good_color
        bad_color = latest_history.bad_color
        isSaved = True

    except ColorHistory.DoesNotExist:
        # 아직 진단 기록이 없는 경우에 대한 예외 처리
        isSaved = False
    return render(request, 'personalColors/infoColor.html', {'color':color,
                                                             'date': date, 'mood': mood,
                                                             'good_color': good_color,
                                                             'bad_color': bad_color,
                                                             'isSaved': isSaved})


def testColor(request):
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

def getResultColor(request):
    if request.method == 'POST':
        # 설문 결과 받아오기
        tone, mood, goodColor, badColor = calcColor(request)

        return render(request, 'personalColors/colorResult.html', {'tone': tone, 'mood': mood, 'goodColor': goodColor, 'badColor': badColor})
    return redirect(request, 'personalColors/infoColor.html')

def saveInfo(request):
    if request.method == 'POST':
        userHistory = request.user.color_history.all() # 유저의 기존 퍼스널 컬러 모두 가져오기
        historyCount = userHistory.count() # 가져온 row 수 세기

        if historyCount == 5: # 5개 이상 못하게 제한
            oldest_history = userHistory.order_by('executed_at').first() # 가장 처음 만들어진 퍼스널 컬러 전적
            if oldest_history:
                oldest_history.delete() # 해당 row 삭제

        # 새로운 결과 저장
        data = json.loads(request.body)
        colorType = data.get('colorType')
        mood = data.get('mood')
        goodColor = data.get('goodColor')
        badColor = data.get('badColor')
        new_history = ColorHistory(
            user_id=request.user,
            color_type=colorType,
            mood=mood,
            good_color=goodColor,
            bad_color=badColor
        )

        # DB에 저장
        new_history.save()
        return JsonResponse({'status': 'success', 'message': f'{colorType} 저장 완료!'})
    return JsonResponse({'status': 'fail', 'message': '저장 실패'})

def getMap(request):
    KAKAO_MAP_API_KEY = os.getenv('KAKAO_MAP_API_KEY')
    return render(request, 'personalColors/weatherInfo.html', {'KAKAO_MAP_API_KEY': KAKAO_MAP_API_KEY})

def getWeather(request):
    # print('도착 완료!')
    if request.method == 'POST':
        # print('정상적인 POST 요청!')
        data = json.loads(request.body)
        x, y = data['latitude'], data['longitude']
        # print('x좌표, y좌표', x, y)
        x, y = float(x), float(y)
        nx, ny = mapToGrid(x, y)

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
        print(base_time)

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

def genearteStart(request):
    if request.method == 'POST':
        temp = request.POST['temp']
        weather = request.POST['weather']
        sky = request.POST['sky']
        address = request.POST['address']

        session_id = request.session.session_key

        # [방어 로직] 이미 해당 세션의 작업이 진행 중인지 확인
        if session_id in temp_storage and temp_storage[session_id]['status'] == 'processing':
            return redirect('/personalColors/map')

        temp_storage[session_id] = {'status': 'processing', 'image': None}

        thread = threading.Thread(
            target=generateImgThread,
            args=(request, session_id, temp, weather, sky)
        )
        thread.start()

        colorType = request.user.color_history.all().values('color_type').order_by('-executed_at').first()['color_type']

        return render(request, 'personalColors/finalResult.html', {'temp': temp + '°C', 'weather': weather, 'sky': sky, 'colorType': colorType, 'address': address})

def checkStatus(request):
    session_id = request.session.session_key

    auth = HTTPBasicAuth(os.getenv("SD_API_USER"), os.getenv("SD_API_PASSWORD"))

    # 1. SD 서버에 현재 진행 상황 물어보기
    prog_res = requests.get(os.getenv('SD_API_URL') + "progress", auth=auth)
    prog_data = prog_res.json()

    result = temp_storage.get(session_id)

    if result and result['status'] == 'completed':
        # 최종 완료 데이터 반환
        # 결과 반환 후 메모리 관리를 위해 데이터 삭제 (선택 사항)
        data = temp_storage.pop(session_id)
        return JsonResponse(data)

    # 진행 중이라면 라이브 프리뷰 데이터 반환
    return JsonResponse({'status': 'processing',
                         'progress': prog_data['progress'], # 0.0 ~ 1.0 사이의 값
                         'current_image': prog_data['current_image'] # Base64 미리보기 이미지
                         })

def generateImgThread(request, session_id, temp, weather, sky):
    url_options = os.getenv('SD_API_URL') + "options"
    url_txt2img = os.getenv('SD_API_URL') + "txt2img"
    auth = HTTPBasicAuth(os.getenv("SD_API_USER"), os.getenv("SD_API_PASSWORD"))
    print('generate_img_thread 진입!!')

    colorList = request.user.color_history.all().values('color_type', 'good_color', 'bad_color').order_by('-executed_at').first()
    print(colorList) # 해당 유저의 퍼스널 컬러 정보 갖고오기
    

    response = client.models.generate_content(
        model=model,
        contents=f"{system_prompt}\n날씨 정보: 하늘의 상태 - {sky}, 체감온도 - {temp}, 강수 상태 - {weather}\n"
                 f"사용자 정보: 성별 - {request.user.gender}, "
                 f"color_type - {colorList['color_type']}, "
                 f"잘 어울리는 색 - {colorList['good_color']}, "
                 f"어울리지 않는 색 - {colorList['bad_color']}\n"
                 f"위 정보를 바탕으로잘 어울리는 의상을 입은 사진을 만들어줘"
    )
    print('gemini 연동!')
    option_payload = {"sd_model_checkpoint": 'majicmixRealistic_v7.safetensors'}
    requests.post(url_options, json=option_payload, auth=auth)
    print('SD 연결!! ')

    json_text = response.text.replace('```json', '').replace('```', '').strip()
    data = json.loads(json_text)

    print(data)
    # 2. 추출된 데이터 활용
    optimized_prompt = data.get('sd_prompt')
    description = data.get('description')
    # --- [단계 2] 실제 이미지 생성 요청 ---
    payload = {
        "prompt": f"simple casual outfit, korean, everyday wear {optimized_prompt}",
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

    sd_res = requests.post(url_txt2img, json=payload, auth=auth)

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

        analysis_res = client.models.generate_content(
            model=model,  # 멀티모달에 최적화된 모델 권장
            contents=[analysis_prompt, img_obj],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        print('5')

        search_data = json.loads(analysis_res.text)
        print(search_data)

        # 4. [추가] 이제 이 키워드로 네이버/쿠팡 API를 호출하여 진짜 URL을 가져옵니다.
        # (아래 get_real_shopping_link 함수는 별도로 구현 필요)
        real_outer_url = get_real_shopping_link(request.user.gender + ' ' + search_data['outer_query'])
        real_top_url = get_real_shopping_link(request.user.gender + ' ' + search_data['top_query'])
        real_pants_url = get_real_shopping_link(request.user.gender + ' ' + search_data['pants_query'])
        real_shoes_url = get_real_shopping_link(search_data['shoes_query'])

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
        print(real_top_url)
        print(real_outer_url)
        print(real_shoes_url)
        print(real_pants_url)


def get_real_shopping_link(query):
    headers = {
        "X-Naver-Client-Id": os.getenv('NAVER_CLIENT_ID'),
        "X-Naver-Client-Secret": os.getenv('NAVER_CLIENT_SECRET')
    }
    url = f"https://openapi.naver.com/v1/search/shop.json?query={query}&display=1"
    res = requests.get(url, headers=headers)
    print(res.json())

    if res.status_code == 200:
        items = res.json().get('items', [])
        if items:
            return items[0]['link']  # 가장 유사한 첫 번째 상품 링크 반환
    return "연결 가능한 상품을 찾지 못했습니다."