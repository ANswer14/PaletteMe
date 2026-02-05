from django.shortcuts import render
from allauth.account.views import SignupView

# 회원가입 페이지 로드 함수
def agreement_view(request):
    return render(request, "accounts/agreement.html")


# 프로필 페이지 로드 함수
def profile_view(request):
    return render(request, "accounts/profile.html")

# 약관 동의 없이 회원가입 페이지 강제이동 방지
class MySignupView(SignupView):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)