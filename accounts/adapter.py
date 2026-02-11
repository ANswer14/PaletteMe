# accounts/adapter.py  - 일반/소셜 로그인 시 중간 커스텀 로직 역할
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.contrib import messages  # 메시지 프레임워크
from allauth.exceptions import ImmediateHttpResponse
from allauth.account.adapter import get_adapter as get_account_adapter

User = get_user_model()

# 구글(소셜) 회원가입 클래스
class MySocialAccountAdapter(DefaultSocialAccountAdapter):

    # allauth 내부에서 작동하는 아이디 중복방지 하는 아이디 생성 로직 (중복확인, 랜덤 숫자 생성)
    def generate_unique_username(self, txts, regex=None):
        # 소셜 어댑터 부모에게 묻지 말고, 일반 계정 어댑터를 불러와서 실행하여 아이디 생성
        return get_account_adapter().generate_unique_username(txts, regex)

    # 소셜 회원가입 폼 화면 초기값 설정 (닉네임)
    def get_signup_form_initial_data(self, sociallogin):
        initial = super().get_signup_form_initial_data(sociallogin)
        email = sociallogin.user.email or sociallogin.account.extra_data.get('email')
        if email:
            base_name = email.split('@')[0]
            initial['username'] = base_name  # 폼 username 칸에 이메일 앞부분을 미리 채워둠
            initial['nickname'] = base_name  # 폼 nickname 칸에 이메일 앞부분을 미리 채워둠
        return initial

    # 구글 이메일로 가입 후 로그인 전 검사
    def pre_social_login(self, request, sociallogin):
        # 이미 정상 연결된 구글 계정이면 통과 후 로그인 진행
        if sociallogin.is_existing:
            return
        # 현재 유저가 이미 로그인 상태인지 확인 (즉, 마이페이지에서 연동하기를 누른 경우)
        if request.user.is_authenticated:
            # 이미 로그인된 유저가 구글연동을 시도 -> 이메일 중복 체크를 하지 않고 넘김.(allauth가 알아서 연동)
            return
        # 이메일 추출
        email = sociallogin.account.extra_data.get('email')
        if email:
            if User.objects.filter(email=email).exists():  # 일반로그인으로 생성한 이메일과 중복되는지 체크
                messages.error(request, "해당 이메일로 이미 가입된 계정이 있습니다. \n일반 로그인 후 연동해주세요.")
                raise ImmediateHttpResponse(redirect('account_login'))

    # 유저 객체에 데이터 주입 (아이디 생성, 중복 처리)
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        email = data.get('email') or sociallogin.user.email  # 구글 이메일 주소 가져오기
        if email:
            base_name = email.split('@')[0]  # 이메일의 @앞부분만 가져옴
            # 중복을 피한 새로운 아이디 생성한걸 unique_username 변수에 입력
            unique_username = self.generate_unique_username([base_name, email, 'user'])  # [1순위,2순위,3순위]
            # 생성된 "안 겹치는 아이디"를 유저 객체에 직접 할당
            user.username = unique_username
            # 폼 화면에 처음 보여줄 닉네임 값을 이메일 앞자리로 설정
            if not getattr(user, 'nickname', None):
                user.nickname = base_name  # 이메일 @앞부분
        return user

    def save_user(self, request, sociallogin, form=None):  # 구글 로그인으로 회원가입 완료 시 메세지 출력
        # 부모 클래스의 save_user를 호출하여 기본 유저 객체를 생성하고 저장함
        user = super().save_user(request, sociallogin, form)
        #  회원가입 성공 메시지 예약 로직
        messages.success(request, f"{user.username}님, 구글 계정으로 회원가입이 완료되었습니다!")
        return user

    # 신규 구글 가입 허용 여부
    def is_open_for_signup(self, request, sociallogin):
        return True