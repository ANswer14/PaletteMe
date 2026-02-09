"""
URL configuration for PaletteMe project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('personalColors/', include('personalColors.urls'), name='personalColors'),
    path("admin/", admin.site.urls), # 장고 관리자 화면으로 이동
    # path("signup/", include('account.urls'), name='account'),
    path('', include('core.urls'), name='core'), # 메인페이지로 이동
    path('accounts/', include('accounts.urls')),  # accounts 경로 보이면 accounts앱의 urls.py로 이동
    path('accounts/', include('allauth.urls')),
]
