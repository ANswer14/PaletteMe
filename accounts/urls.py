from django.urls import path, re_path, include
from . import views  # 본인 앱의 views
from allauth.account import views as allauth_views  # allauth의 views를 별칭으로 구분

urlpatterns = [
    # 일반/소셜 회원가입 관련 url
    path('login-success/', views.login_success_view, name='login_success'),  # 소셜 로그인 시 로그인 창이 닫히지 않는 오류 방지용
    path('3rdparty/signup/', views.MySocialSignupView.as_view(), name='custom_social_signup'),  # 소셜 회원가입 추가정보 입력 페이지
    path("agreement/", views.agreement_view, name="agreement"),  # 약관동의 페이지
    path('signup/', views.MySignupView.as_view(template_name="accounts/signup.html"), name='account_signup'),  # 약관동의 페이지 무시하지 않고 불러오는 일반 회원가입 페이지
    path('check-username/', views.check_username, name='check_username'),  # 아이디/닉네임 중복확인 로직용

    # 로그인/로그아웃 관련 url (allauth 기본 뷰 사용 + 커스텀 템플릿)
    path('login/', allauth_views.LoginView.as_view(template_name="accounts/login.html"), name='account_login'),  # 로그인 페이지
    path('logout/', allauth_views.LogoutView.as_view(), name='account_logout'),  #로그아웃 (탬플릿 없이 바로 로그아웃)

    # 회원정보 페이지 관련 url
    path("profile/", views.profile_view, name="profile"),  # 회원정보 페이지
    path('delete/', views.delete_account, name='delete_account'),  # 회원탈퇴 (탬플릿 없이 바로 메인페이지로)
    path('check-password-ajax/', views.check_password_ajax, name='check_password_ajax'),  # 현재 비밀번호 확인 AJAX 로직
    path('change-password/', views.change_password_custom, name='change_password_custom'), # 회원정보 페이지 비밀번호 변경 저장 로직

    # --- 비밀번호 재설정 (allauth 로직 + 커스텀 템플릿 연결) ---
    path("password/reset/",  # 이메일 입력 페이지
         views.MyPasswordResetView.as_view(template_name="accounts/password_reset.html"),
         name="account_reset_password"),
    re_path(r"^password/reset/key/(?P<uidb36>[0-9A-Za-z]+)-(?P<key>.+)/$",  # 이메일 링크 클릭 시 들어오는 '새 비밀번호 입력' 페이지 (이메일로 발송되는 링크는 동적이며 매우 가변적이라 re_path로 확실하게 잡아냄)
         allauth_views.PasswordResetFromKeyView.as_view(template_name="accounts/password_reset_key.html"),
         name="account_reset_password_from_key"),
    path("password/reset/key/done/",  # 비밀번호 변경 완료 페이지
         allauth_views.PasswordResetFromKeyDoneView.as_view(template_name="accounts/password_reset_key_done.html"),
         name="account_reset_password_from_key_done"),

    # allauth 나머지 기능 (이메일 인증 등)
    path('', include('allauth.urls')),
]