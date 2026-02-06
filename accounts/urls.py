from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    # 약관 동의 페이지
    path("agreement/", views.agreement_view, name="agreement"),
    # 로그인 페이지
    path("login/", views.login_view, name="login"),
    # 회원가입
    path("signup/", views.signup_view, name="signup"),
]
