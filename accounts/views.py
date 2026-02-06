from django.shortcuts import render
from allauth.account.views import SignupView
from django.http import JsonResponse
from .models import CustomUser

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
def profile_view(request):
    return render(request, "accounts/mypage.html")


# 약관 동의 없이 회원가입 페이지 강제이동 방지
class MySignupView(SignupView):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)