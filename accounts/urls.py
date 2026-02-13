# account/urls.py
from django.urls import path, include
from . import views  # views.py에 있는 기능 불러옴
from allauth.account.views import LoginView, LogoutView  # allauth의 회원가입, 로그인, 로그아웃 기능 불러옴

urlpatterns = [
    path('login-success/', views.login_success_view, name='login_success'),  # 추가: /accounts/login-success/ 주소로 접속하면 login_success_view 실행

    path('3rdparty/signup/', views.MySocialSignupView.as_view(), name='custom_social_signup'),

    path("agreement/", views.agreement_view, name="agreement"),  # url에서 accounts/agreement/ 찾으면 views.py에 있는 agreement.view 함수 실행하기

    path('signup/', views.MySignupView.as_view(template_name="accounts/signup.html"), name='account_signup'),  # 경로 찾으면 views.py의 커스텀 로직을 사용하며 탬플릿은 내 accounts앱 안에 signup.html사용

    path('check-username/', views.check_username, name='check_username'),

    path('login/', LoginView.as_view(template_name="accounts/login.html"), name='account_login'),  # 경로 찾으면 allauth가 제공하는 로그인 로직을 사용하며 탬플릿은 내 accounts앱 안에 login.html사용

    path('logout/', LogoutView.as_view(), name='account_logout'),   # url에서 accounts/logout/ 찾으면 allauth가 제공하는 로그아웃 로직을 사용

    path("profile/", views.profile_view, name="profile"),  # url에서 accounts/profile/ 찾으면 함수 실행하기

    path('delete/', views.delete_account, name='delete_account'),  # 회원 탈퇴 경로

    path('change-password/', views.change_password_custom, name='change_password_custom'),  # 비밀번호 변경 경로

    path('', include('allauth.urls')),  # allauth의 나머지 기능들(이메일 인증..etc)은 무조건 마지막에 지정. (overriding 때문)
]
