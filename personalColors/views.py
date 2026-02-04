from django.shortcuts import render

# Create your views here.

# colorInfo 렌더링 함수
def getColorInfo(request):

    return render(request, 'personalColors/infoColor.html')

