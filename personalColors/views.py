from datetime import datetime, timedelta
from numbers import Number

from django.http import JsonResponse
from django.shortcuts import render, redirect
from .service.personalColorCalc import *
from .models import ColorHistory
import json
import os
import requests
from dotenv import load_dotenv
from .service.dfs_xy_converter import mapToGrid

load_dotenv()

# colorInfo 렌더링 함수
def getColorInfo(request):
    color, date, mood, good_color, bad_color = None, None, None, None, None
    try:
        # executed_at 필드를 기준으로 가장 최신 데이터 1건 가져오기
        latest_history = request.user.personal_colors.latest('executed_at')

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
        userHistory = request.user.personal_colors.all() # 유저의 기존 퍼스널 컬러 모두 가져오기
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
