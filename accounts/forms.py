from allauth.account.forms import SignupForm
from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()

class MyPageForm(forms.ModelForm):  # 프로필 페이지 닉네임 중복 심사대
    class Meta:
        model = User
        fields = ['nickname', 'phone_number', 'gender']  # 나중에 'profile_image' 추가

    def clean_nickname(self):
        nickname = self.cleaned_data.get('nickname')  # 폼에 입력된 닉네임 값 가져옴
        # 나를 제외한 다른 사람 중에 이 닉네임이 있는지 딱 한 줄로 체크
        if User.objects.exclude(pk=self.instance.pk).filter(nickname=nickname).exists():
            raise forms.ValidationError("이미 사용 중인 닉네임입니다.")
        return nickname


class CustomSignupForm(SignupForm):  # 커스텀 필드를 아래와 같이 입력받음
    phone_number = forms.CharField(max_length=20, required=True, label="연락처")
    gender = forms.ChoiceField(
        choices=(("M", "남성"),("F", "여성")),required=True,label="성별")
    nickname = forms.CharField(max_length=30,required=True,label="닉네임")

    # 닉네임 중복 심사대
    def clean_nickname(self):
        nickname = self.cleaned_data.get('nickname')
        from .models import CustomUser
        if CustomUser.objects.filter(nickname=nickname).exists():
            raise forms.ValidationError("이미 사용 중인 닉네임입니다.")
        return nickname

    # 이메일 중복 심사대
    def clean_email(self):
        email = self.cleaned_data.get('email')
        from .models import CustomUser
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError("이미 등록된 이메일 주소입니다.")
        return email

    # 연락처 중복 심사대
    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number')
        from .models import CustomUser
        if phone and CustomUser.objects.filter(phone_number=phone).exists():
            raise forms.ValidationError("이미 등록된 연락처입니다.")
        return phone

    def save(self, request):
        user = super().save(request)
        phone = self.cleaned_data.get('phone_number')
        user.phone_number = phone if phone else None
        nick = self.cleaned_data.get('nickname')
        user.nickname = nick if nick else None
        user.gender = self.cleaned_data.get('gender')
        user.save()
        return user