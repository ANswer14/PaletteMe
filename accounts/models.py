from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.templatetags.static import static


# AbstractUser로 allauth의 기본 정보를 가져오고 CustomUser에서 추가필드(연락처, 성별, 닉네임)를 가져와 저장
class CustomUser(AbstractUser):
    # 1. 이메일: unique=True로 중복 차단 / 후에 구글 로그인 추가 시 settings.py에서 자동연결 설정 필요
    email = models.EmailField(unique=True,
                              error_messages={'unique': "이미 등록된 이메일입니다."}
    )
    nickname = models.CharField(max_length=30, unique=True, null=True, blank=True,
                                error_messages={'unique': "이미 사용 중인 닉네임입니다."}
    )
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True,
                                    error_messages={'unique': "이미 등록된 연락처입니다."}
    )
    GENDER_CHOICES = [ ('M', '남성'),('F', '여성'),]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)

    # 프로필 페이지의 프로필 사진 저장 로직 (기본/커스텀 이미지 구분 가능, html에서 if/else 없이 간략화 가능.)
    @property  # 함수를 변수처럼 쓸 수 있게 해줌
    def profile_url(self):
        if self.profile_image:
            # 유저가 직접 업로드한 사진인 경우
            if 'profiles/' in self.profile_image.name:
                return self.profile_image.url
            # 기본 이미지 문자열(img/profileImg1.png)인 경우
            return static(self.profile_image.name)
        # 필드가 아예 비어있는 경우
        return static('img/profileImg1.png')


    # 역참조 이름 충돌(오류) 방지를 위해 related_name 추가
    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set",
        blank=True,
    )

    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_set",
        blank=True,
    )