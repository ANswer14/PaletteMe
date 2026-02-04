from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models


# AbstractUser로 allauth의 기본 정보를 가져오고 CustomUser에서 추가필드(연락처, 성별, 닉네임)를 가져와 저장
class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True)
    GENDER_CHOICES = [
        ('M', '남성'),
        ('F', '여성'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)

    nickname = models.CharField(max_length=30, unique=True, null=True, blank=True)

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