from allauth.account.forms import SignupForm
from django import forms

class CustomSignupForm(SignupForm):

    phone_number = forms.CharField(max_length=20, required=True, label="연락처")

    gender = forms.ChoiceField(
        choices=(("M", "남성"),("F", "여성")),required=True,label="성별")

    nickname = forms.CharField(max_length=30,required=True,label="닉네임")

    def save(self, request):
        user = super().save(request)
        user.phone_number = self.cleaned_data["phone_number"]
        user.gender = self.cleaned_data["gender"]
        user.nickname = self.cleaned_data["nickname"]
        user.save()
        return user