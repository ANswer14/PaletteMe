from django.urls import path

from personalColors import views

app_name = 'personalColors'

urlpatterns = [
    path('', views.getColorInfo, name='personalColors'), # colrInfo 렌더링 용 path
    path('check/', views.testColor, name='testColor'),
    path('result/', views.getResultColor, name='getResultColor'),
    path('map/', views.getMap, name='getWeather'),
    path('map/weather/', views.getWeather, name='getWeather'),
    # path('thisWeather/', views.getThisWeather, name='getThisWeather'),
    path('saveInfo/', views.saveInfo, name='saveInfo'),
    path('generateImg/', views.genearteStart, name='genearte_start'),
    path('checkStatus/', views.checkStatus, name='checkStatus'),
    path('saveFavorite/', views.saveFavorite, name='saveFavorite'),
]