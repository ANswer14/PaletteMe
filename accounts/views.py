from django.shortcuts import render

# 회원가입 페이지 로드 함수
def agreement_view(request):
    return render(request, "account/agreement.html")


# 프로필 페이지 로드 함수
def profile_view(request):
    return render(request, "account/profile.html")

