from django.shortcuts import render, redirect
from allauth.account.views import SignupView
from django.http import JsonResponse
from .forms import MyPageForm
from .models import CustomUser
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash


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
@login_required
def profile_view(request):
    if request.method == 'POST':
        form = MyPageForm(request.POST, request.FILES, instance=request.user)

        # 1. '중복 확인' 버튼을 눌렀을 때
        if 'check_nickname' in request.POST:
            form.is_valid()  # 검증만 수행 (에러가 있으면 폼에 담김)
            # 저장(form.save())을 안 하고 그대로 다시 페이지를 보여줌
            return render(request, "accounts/mypage.html", {'form': form})

        # 2. '정보 수정 저장' 버튼을 눌렀을 때
        if 'save_info' in request.POST:
            if form.is_valid():
                form.save()  # 실제로 DB에 저장
                messages.success(request, "정보가 성공적으로 수정되었습니다.")
                return redirect('accounts:profile')
    else:
        form = MyPageForm(instance=request.user)

    return render(request, "accounts/mypage.html", {'form': form})


# 약관 동의 없이 회원가입 페이지 강제이동 방지
class MySignupView(SignupView):
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

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
            return redirect('/accounts/profile/')

        # 2. 새 비밀번호 일치 확인
        if pw1 != pw2:
            messages.error(request, "새 비밀번호가 서로 일치하지 않습니다.")
            return redirect('/accounts/profile/')

        # 3. 비밀번호 변경 적용
        user.set_password(pw1)
        user.save()

        # 중요: 비밀번호 변경 후 로그아웃되지 않도록 세션 업데이트
        update_session_auth_hash(request, user)
        messages.success(request, "비밀번호가 성공적으로 변경되었습니다.")
        return redirect('/accounts/profile/')

    return redirect('/accounts/profile/')