from django.shortcuts import render


#회원가입 동의서
def agreement_view(request):
    return render(request, "accounts/agreement.html")
#로그인 기본창
def login_view(request):
    return render(request, "accounts/login.html")
#회원가입 창
def signup_view(request):
    return render(request, "accounts/signup.html")