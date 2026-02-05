# account/urls.py
from django.urls import path
from . import views  # views.py에 있는 기능 불러옴
from allauth.account.views import SignupView, LoginView, LogoutView  # allauth의 회원가입, 로그인, 로그아웃 기능 불러옴


urlpatterns = [
    path("agreement/", views.agreement_view, name="agreement"),  # url에서 accounts/agreement/ 찾으면 함수 실행하기

    # url에서 accounts/signup/ 찾으면 views.py의 커스텀 로직을 사용하며 탬플릿은 내 accounts앱 안에 signup.html사용
    path('signup/', views.MySignupView.as_view(template_name="accounts/signup.html"), name='account_signup'),

    # url에서 accounts/login/ 찾으면 allauth가 제공하는 로그인 로직을 사용하며 탬플릿은 내 accounts앱 안에 login.html사용
    path('login/', LoginView.as_view(template_name="accounts/login.html"), name='account_login'),

    # url에서 accounts/logout/ 찾으면 allauth가 제공하는 로그아웃 로직을 사용
    path('logout/', LogoutView.as_view(), name='account_logout'),

    path("profile/", views.profile_view, name="profile"),  # url에서 accounts/profile/ 찾으면 함수 실행하기
]
