from django.http import JsonResponse
from django.shortcuts import render, redirect
from .service.personalColorCalc import *
from .models import ColorHistory
import json

# Create your views here.

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

def getWeather(request):
    return render(request, 'personalColors/weatherInfo.html')

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