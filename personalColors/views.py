from django.shortcuts import render

def weather_info(request):
    return render(request, "personalColors/weatherInfo.html")

def info_color(request):
    return render(request, "personalColors/InfoColor.html")

def final_result(request):
    return render(request, "personalColors/finalResult.html")

def color_test(request):
    return render(request, "personalColors/colorTest.html")

def color_result(request):
    return render(request, "personalColors/colorResult.html")
