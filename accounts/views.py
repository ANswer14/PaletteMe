from django.shortcuts import render, redirect
from allauth.account.views import SignupView
from django.http import JsonResponse
from .models import CustomUser
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib import messages

# 회원가입 페이지 로드 함수
def agreement_view(request):
    return render(request, "accounts/agreement.html")


# 아이디 중복확인 로직
def check_username(request):
    # GET 요청에서 username 파라미터를 가져옴
    username = request.GET.get('username', None)

    # DB에서 해당 아이디가 있는지 확인
    exists = CustomUser.objects.filter(username=username).exists()

    # 결과를 JSON 형태로 반환 (JS의 data.exists와 이름 맞춤)
    return JsonResponse({'exists': exists})


# 프로필 페이지 로드 함수
@login_required  # 👈 이 줄을 추가해서 로그인을 강제해야 합니다.
def profile_view(request):
    return render(request, "accounts/mypage.html")


# 약관 동의 없이 회원가입 페이지 강제이동 방지
class MySignupView(SignupView):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

# 회원 탈퇴 로직 함수
def delete_account(request):
    if request.method == 'POST':
        user = request.user
        # 1. DB에서 유저 삭제 (연동된 소셜 계정도 함께 삭제됨)
        user.delete()
        # 2. 삭제 후 세션 로그아웃 처리
        logout(request)
        messages.success(request, "회원 탈퇴가 완료되었습니다.")
        return redirect('/')  # 메인 페이지로 이동

    return redirect('profile')  # GET 접근 시 프로필로 리다이렉트