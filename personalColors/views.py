from django.shortcuts import render, redirect
from .service.personalColorCalc import *

# Create your views here.

# colorInfo 렌더링 함수
def getColorInfo(request):

    return render(request, 'personalColors/infoColor.html')

def testColor(request):
    if request.method == 'POST':
        page = int(request.POST.get('page', 1)) # 만약 pageNo를 쿼리 파라미터에서 찾지 못하면 기본값 1
        worm = int(request.POST.get('worm', 1))
        cool = int(request.POST.get('cool', 1))
        light = int(request.POST.get('light', 1))
        dark = int(request.POST.get('dark', 1))
        mute = int(request.POST.get('mute', 1))
        vivid = int(request.POST.get('vivid', 1))
        idk = int(request.POST.get('idk', 1))
        return render(request, 'personalColors/colorTest.html', {'page': page, 'worm': worm, 'cool': cool, 'light': light,
                                                                 'dark': dark, 'mute': mute, 'vivid': vivid, 'idk': idk})
    return render(request, 'personalColors/colorTest.html',
                  {'page': 1, 'worm': 0, 'cool': 0, 'light': 0,
                   'dark': 0, 'mute': 0, 'vivid': 0, 'idk': 0})

def getResultColor(request):
    if request.method == 'POST':
        tone, mood, goodColor, badColor = calcColor(request)
        return render(request, 'personalColors/colorResult.html', {'tone': tone, 'mood': mood, 'goodColor': goodColor, 'badColor': badColor})
    return redirect(request, 'personalColors/infoColor.html')
