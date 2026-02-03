from django.urls import path

from personalColors import views

app_name = 'personalColors'

urlpatterns = [
    path('', views.getColorInfo, name='personalColors'),
]