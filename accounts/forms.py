from allauth.account.forms import SignupForm
from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()


# 프로필 페이지 전용 정보 수정 및 닉네임 중복 심사대
class MyPageForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['nickname', 'phone_number', 'gender', 'profile_image']

    def clean_nickname(self):
        nickname = self.cleaned_data.get('nickname')  # 폼에 입력된 닉네임 값 가져옴
        # 나를 제외한 다른 사람 중에 이 닉네임이 있는지 딱 한 줄로 체크
        if User.objects.exclude(pk=self.instance.pk).filter(nickname=nickname).exists():
            raise forms.ValidationError("이미 사용 중인 닉네임입니다.")
        return nickname


# 일반/소셜 회원가입 과정에서 커스텀 필드를 아래와 같이 조건에 맞게 입력받아 저장하는 클래스
class CustomSignupForm(SignupForm):
    phone_number = forms.CharField(max_length=20, required=True, label="연락처")
    gender = forms.ChoiceField(
        choices=(("M", "남성"),("F", "여성")),required=True,label="성별")
    nickname = forms.CharField(max_length=30,required=True,label="닉네임")

    # 소셜 가입 일때 self.sociallogin에 보관 / 일반 가입일때 평범하게 부모 로직 사용 (일반/소셜 회원가입 전환가능)
    def __init__(self, *args, **kwargs):
        # 소셜 가입 시 allauth가 넘겨주는 'sociallogin' 인자를 안전하게 뽑아냅니다.
        self.sociallogin = kwargs.pop('sociallogin', None)
        super(CustomSignupForm, self).__init__(*args, **kwargs)
        # 소셜 가입일 때만 초기값 강제 주입
        if self.sociallogin:
            email = self.sociallogin.user.email
            base_name = email.split('@')[0]

            # 템플릿의 {{ form.nickname.value }}가 이 값을 읽게 됩니다.
            if not self.initial.get('nickname'):
                self.initial['nickname'] = base_name
            if not self.initial.get('username'):
                self.initial['username'] = base_name

        # [수정] 소셜 가입인 경우, 필수 필드들을 선택 사항으로 변경하여 에러 방지
        if self.sociallogin:
            # 소셜 가입은 비밀번호가 필요 없음
            if 'password1' in self.fields:
                self.fields['password1'].required = False
            if 'password2' in self.fields:
                self.fields['password2'].required = False
            # 아이디와 이메일은 구글에서 이미 가져왔으므로 폼 검증에서 제외
            if 'username' in self.fields:
                self.fields['username'].required = False
            if 'email' in self.fields:
                self.fields['email'].required = False

    # 아이디(username) 중복 심사대 (2차, 1차는 views.py 에서)
    def clean_username(self):
        username = self.cleaned_data.get('username')
        # 소셜 가입 시 username 필드가 폼에 없다면 검증 패스
        if not username:
            return username

        from .models import CustomUser
        if CustomUser.objects.filter(username=username).exists():  # DB에 동일한 아이디가 있는지 확인
            raise forms.ValidationError("이미 사용 중인 아이디입니다.")
        return username

    # 닉네임 중복 심사대 (2차, 1차는 views.py 에서)
    def clean_nickname(self):
        nickname = self.cleaned_data.get('nickname')
        from .models import CustomUser
        if CustomUser.objects.filter(nickname=nickname).exists():  # DB에 동일한 닉네임이 있는지 확인
            raise forms.ValidationError("이미 사용 중인 닉네임입니다.")
        return nickname

    # 이메일 중복 심사대
    def clean_email(self):
        email = self.cleaned_data.get('email')
        # 소셜 가입 시 email 필드가 폼에 없다면 검증 패스
        if not email:
            return email

        from .models import CustomUser
        if CustomUser.objects.filter(email=email).exists():  # DB에 동일한 이메일이 있는지 확인
            raise forms.ValidationError("이미 등록된 이메일 주소입니다.")
        return email

    # 연락처 중복 심사대
    def clean_phone_number(self):
        phone = self.cleaned_data.get('phone_number')
        from .models import CustomUser
        if phone and CustomUser.objects.filter(phone_number=phone).exists():  # DB에 동일한 연락처가 있는지 확인
            raise forms.ValidationError("이미 등록된 연락처입니다.")
        return phone

    # 일반 회원가입 시 추가 정보를 실제로 DB에 저장하기 위한 로직
    def save(self, request):
        # 1. allauth의 기본 저장 로직을 타지 않고, 소셜/일반 공통 유저 객체를 가져옵니다.
        # 소셜 가입이면 sociallogin에서, 일반이면 새로 생성합니다.
        if self.sociallogin:
            user = self.sociallogin.user
        else:
            user = super(CustomSignupForm, self).save(request)

        # 2. 공통 커스텀 필드 주입
        user.phone_number = self.cleaned_data.get('phone_number')
        user.nickname = self.cleaned_data.get('nickname')
        user.gender = self.cleaned_data.get('gender')

        # 3. 소셜 가입 전용 추가 처리
        if self.sociallogin:
            user.email = self.sociallogin.user.email
            if not user.username:
                user.username = user.email.split('@')[0]

        # 4. [매우 중요] 여기서 명시적으로 save()를 호출해서 PK를 확실히 만듭니다.
        user.save()
        return user

    def signup(self, request, user):
        """
        allauth 내부에서 호출하는 메서드입니다.
        이미 save()에서 데이터를 다 넣었으므로, 여기서는 혹시 모를 누락 데이터만 확인합니다.
        """
        user.phone_number = self.cleaned_data.get('phone_number')
        user.nickname = self.cleaned_data.get('nickname')
        user.gender = self.cleaned_data.get('gender')