from django.shortcuts import render

# Create your views here.

def getColorInfo(request):
    return render(request, 'personalColors/infoColor.html')

