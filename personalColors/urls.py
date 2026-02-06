from django.urls import path
from . import views

app_name = "personalColors"

urlpatterns = [
    path("weather/", views.weather_info, name="weather_info"),
    path("info/", views.info_color, name="info_color"),
    path("result/", views.final_result, name="final_result"),
    path("color-test/", views.color_test, name="color_test"),
    path("color-result/", views.color_result, name="color_result"),
]
