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
# from allauth.account.views import SignupView, LoginView, LogoutView

urlpatterns = [
    path("admin/", admin.site.urls),
    # path("signup/", include('account.urls'), name='account'),
    path('', include('core.urls'), name='core'),
    path('accounts/custom/', include(('accounts.urls', 'accounts'), namespace='accounts')),  # 약관, 프로필 등 커스텀 페이지는 account 앱이 담당
    path('accounts/', include('allauth.urls')),  # 인증 관련 기본 기능은 allauth가 담당
    # path('accounts/signup/', SignupView.as_view(template_name="accounts/signup.html"), name='signup'),
]
