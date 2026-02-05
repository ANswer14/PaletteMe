from allauth.account.forms import SignupForm
from django import forms

class CustomSignupForm(SignupForm):

    phone_number = forms.CharField(max_length=20, required=True, label="연락처")

    gender = forms.ChoiceField(
        choices=(("M", "남성"),("F", "여성")),required=True,label="성별")

    nickname = forms.CharField(max_length=30,required=True,label="닉네임")

    # 닉네임 중복 심사대
    def clean_nickname(self):
        nickname = self.cleaned_data.get('nickname')
        from .models import CustomUser
        if CustomUser.objects.filter(nickname=nickname).exists():
            # 여기서 에러를 내야 서버가 안 터지고 alert이 뜹니다!
            raise forms.ValidationError("이미 사용 중인 닉네임입니다.")
        return nickname

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