from django.shortcuts import render, redirect
from allauth.account.views import SignupView
from allauth.socialaccount.views import SignupView as SocialSignupView # allauth의 소셜 회원가입을 SocialSignupView로 명시.
from django.http import JsonResponse
from .forms import MyPageForm
from .models import CustomUser
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from .forms import CustomSignupForm
from allauth.account.utils import perform_login
from django.urls import reverse

# 소셜 로그인 시 로그인 창이 닫히지 않아 추가한 로직
def login_success_view(request):
    # render를 사용하여 만든 html을 띄워줍니다.
    return render(request, 'accounts/login_success.html')

# 회원가입 페이지 로드 함수
def agreement_view(request):
    return render(request, "accounts/agreement.html")


# 아이디/닉네임 중복확인 로직 (1차, 2차는 forms.py에서)
def check_username(request):
    val = request.GET.get('value', None)  # 입력된 값
    check_type = request.GET.get('type', None)  # 'username' 인지 'nickname' 인지 구분

    if not val or not check_type:
        return JsonResponse({'exists': False})

    if check_type == 'username':
        # 아이디(username) 중복 확인
        exists = CustomUser.objects.filter(username=val).exists()
    elif check_type == 'nickname':
        # 닉네임(nickname) 중복 확인
        exists = CustomUser.objects.filter(nickname=val).exists()
    else:
        exists = False

    return JsonResponse({'exists': exists})


# 프로필 페이지 로드 함수
@login_required
def profile_view(request):  # 저장, 중복확인 버튼을 눌렀을 때 (POST)
    if request.method == 'POST':
        form = MyPageForm(request.POST, request.FILES, instance=request.user)

        if 'check_nickname' in request.POST:  # '중복 확인' 버튼을 눌렀을 때
            if form.is_valid():
                nickname_ok = "사용 가능한 닉네임입니다."  # 중복이 아니면 context에 성공 메시지를 담음
                return render(request, "accounts/mypage.html", {'form': form, 'nickname_ok': nickname_ok})
            else:
                # 중복이면 기존처럼 에러가 담긴 채로 리턴 (mypage.html의 form.nickname.errors.0 부분)
                return render(request, "accounts/mypage.html", {'form': form})

        if 'save_info' in request.POST:  # '정보 수정 저장' 버튼을 눌렀을 때
            if form.is_valid():
                form.save()  # 변경된 내용 실제로 DB에 저장
                messages.success(request, "정보가 성공적으로 수정되었습니다.")
                return redirect('profile')

    else:  # 처음 프로필 페이지에 접속했을 때 (GET)
        form = MyPageForm(instance=request.user)  # 현재 로그인한 유저의 정보를 폼에 채워서 생성

    return render(request, "accounts/mypage.html", {'form': form})


# 약관 동의 없이 회원가입 페이지 강제이동 방지
class MySignupView(SignupView):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


#  소셜 로그인 후 추가 정보를 입력받을 커스텀 뷰
class MySocialSignupView(SocialSignupView):
    template_name = "accounts/social_signup.html"  # 템플릿 경로를 accounts 폴더 안으로 지정 (allauth 기본과 겹치지 않게)
    form_class = CustomSignupForm  # 소셜 가입 시 이 폼을 사용하도록 지정

    def form_valid(self, form):
        # 1. 소셜 로그인 객체에서 유저를 가져옵니다.
        # 이때 이미 adapter.populate_user 덕분에 username은 예쁘게 채워져 있습니다.
        user = self.sociallogin.user

        # 2. 폼에서 입력받은 추가 정보(phone_number, nickname, gender 등)를 유저 객체에 주입합니다.
        form.signup(self.request, user)

        # 3. 소셜 로그인 연결 및 유저 정보를 DB에 저장합니다. (PK 생성 시점)
        self.sociallogin.save(self.request)

        # 4. [안전장치] 가끔 세션 문제로 데이터가 튀는 걸 방지하기 위해 최종 저장
        user.refresh_from_db()
        form.signup(self.request, user)  # 커스텀 필드들 재확인
        user.save()

        # [추가] 이 유저를 현재 세션에 로그인시킵니다.
        # signup 프로세스이므로 'signup' 단계임을 명시합니다.
        perform_login(
            self.request,
            user,
            email_verification='optional',  # 설정에 맞게 조절
            redirect_url=reverse('login_success'),  # 로그인 후 목적지
            signup=True
        )

        # complete_social_signup을 호출하는 대신, 직접 login_success로 보냅니다.
        from django.shortcuts import redirect
        return redirect('login_success')


# 프로필 페이지의 회원 탈퇴 로직 함수
def delete_account(request):
    if request.method == 'POST':
        user = request.user
        # 1. DB에서 유저 삭제 (연동된 소셜 계정도 함께 삭제됨)
        user.delete()
        # 2. 삭제 후 세션 로그아웃 처리
        logout(request)
        messages.success(request, "회원 탈퇴가 완료되었습니다.")
        return redirect('/')  # 탈퇴 확인하면 메인 페이지로 이동

    return redirect('profile')  # GET 접근 시(취소 누르면) 프로필로 리다이렉트


# 프로필 페이지의 비밀번호 변경 로직 함수
def change_password_custom(request):
    if request.method == 'POST':
        user = request.user
        old_pw = request.POST.get('old_password')
        pw1 = request.POST.get('password1')
        pw2 = request.POST.get('password2')

        # 1. 현재 비밀번호 확인
        if not user.check_password(old_pw):
            messages.error(request, "현재 비밀번호가 일치하지 않습니다.")
            return redirect('profile')

        # 2. 새 비밀번호 일치 확인
        if pw1 != pw2:
            messages.error(request, "새 비밀번호가 서로 일치하지 않습니다.")
            return redirect('profile')

        # 3. 비밀번호 변경 적용
        user.set_password(pw1)
        user.save()

        # 중요: 비밀번호 변경 후 로그아웃되지 않도록 세션 업데이트
        update_session_auth_hash(request, user)
        messages.success(request, "비밀번호가 성공적으로 변경되었습니다.")
        return redirect('profile')

    return redirect('profile')