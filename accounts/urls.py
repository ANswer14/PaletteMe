# account/urls.py
from django.urls import path, include
from . import views  # views.py에 있는 기능 불러옴
from allauth.account.views import SignupView, LoginView, LogoutView  # allauth의 회원가입, 로그인, 로그아웃 기능 불러옴
from allauth.account.views import PasswordChangeView, PasswordSetView


urlpatterns = [
    path("agreement/", views.agreement_view, name="agreement"),  # url에서 accounts/agreement/ 찾으면 함수 실행하기

    # url에서 accounts/signup/ 찾으면 views.py의 커스텀 로직을 사용하며 탬플릿은 내 accounts앱 안에 signup.html사용
    path('signup/', views.MySignupView.as_view(template_name="accounts/signup.html"), name='account_signup'),

    path('check-username/', views.check_username, name='check_username'),

    # url에서 accounts/login/ 찾으면 allauth가 제공하는 로그인 로직을 사용하며 탬플릿은 내 accounts앱 안에 login.html사용
    path('login/', LoginView.as_view(template_name="accounts/login.html"), name='account_login'),

    # url에서 accounts/logout/ 찾으면 allauth가 제공하는 로그아웃 로직을 사용
    path('logout/', LogoutView.as_view(), name='account_logout'),

    path("profile/", views.profile_view, name="profile"),  # url에서 accounts/profile/ 찾으면 함수 실행하기

    # ✅ 구글 소셜 로그인을 위한 내부 경로들을 추가
    path('social/', include('allauth.socialaccount.urls')),

    # 회원 탈퇴 경로
    path('delete/', views.delete_account, name='delete_account'),

    # 비밀번호 변경 경로
    path('change-password/', views.change_password_custom, name='change_password_custom'),
]
