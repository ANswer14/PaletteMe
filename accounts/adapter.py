# accounts/adapter.py  - 이미 가입된 이메일로 구글 로그인 시 막는 역할
import uuid
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.contrib import messages  # 메시지 프레임워크
from allauth.exceptions import ImmediateHttpResponse

User = get_user_model()

# 구글(소셜) 회원가입 클래스
class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):  # 가입 전 검사
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


    def populate_user(self, request, sociallogin, data):  # 구글 로그인 시 닉네임 세팅
        """
        닉네임 자동 설정 및 중복 방지
        신규 가입 시 구글 이메일 앞부분을 닉네임에 넣되, 중복 시 랜덤 값을 붙입니다.
        """
        # 기본 필드(email, username 등)를 먼저 채운 유저 객체 생성
        user = super().populate_user(request, sociallogin, data)

        email = data.get('email', '')
        if email:
            # 이메일 앞부분 추출 (예: gemini@gmail.com -> gemini)
            base_nickname = email.split('@')[0]

            # DB에 동일한 닉네임이 있는지 확인
            if User.objects.filter(nickname=base_nickname).exists():
                # 중복이 있다면: gemini_a1b2 형태로 저장 (uuid 활용)
                unique_suffix = uuid.uuid4().hex[:4]
                user.nickname = f"{base_nickname}_{unique_suffix}"
            else:
                # 중복이 없다면: 깔끔하게 이메일 아이디 그대로 저장
                user.nickname = base_nickname

        return user


    def save_user(self, request, sociallogin, form=None):  # 구글 로그인으로 회원가입 완료 시 메세지 출력
        # 부모 클래스의 save_user를 호출하여 기본 유저 객체를 생성하고 저장함
        user = super().save_user(request, sociallogin, form)

        #  구글 로그인 시 성별 데이터가 없는 경우 '남성(M)'을 디폴트로 설정
        if not user.gender:
            user.gender = "M"
            user.save()  # 변경된 성별 값을 DB에 최종 반영

        #  회원가입 성공 메시지 예약 로직
        messages.success(request, f"{user.username}님, 구글 계정으로 회원가입이 완료되었습니다!")
        return user