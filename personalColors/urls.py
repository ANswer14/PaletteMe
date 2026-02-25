from django.urls import path

from personalColors import views

app_name = 'personalColors'

urlpatterns = [
    path('', views.get_color_info, name='personalColors'), # colrInfo 렌더링 용 path
    path('enable_history', views.get_color_info, name='personalColors'), # colrInfo 렌더링 용 path
    path('check/', views.test_color, name='test_color'),
    path('result/', views.get_result_color, name='get_result_color'),
    path('map/', views.get_map, name='get_map'),
    path('map/weather/', views.get_weather, name='get_weather'),
    # path('thisWeather/', views.getThisWeather, name='getThisWeather'),
    path('saveInfo/', views.save_info, name='save_info'),
    path('generateImg/', views.generate_start, name='generate_start'),
    path('checkStatus/', views.check_status, name='check_status'),
    path('saveFavorite/', views.save_favorite, name='save_favorite'),
]