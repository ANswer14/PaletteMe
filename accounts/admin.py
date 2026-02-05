from django.contrib import admin
from django.contrib.auth.admin import UserAdmin  # 회원 관리용
from .models import CustomUser  # allauth는 제공하지 않는 커스텀 정보 (연락처, 성별)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):  # 커스텀 정보 (연락처, 성별, 닉네임) 출력
    fieldsets = UserAdmin.fieldsets + (
        ("추가 정보", {
            "fields": ("phone_number", "gender", "nickname"),
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("추가 정보", {
            "fields": ("phone_number", "gender", "nickname"),
        }),
    )

    list_display = ("username", "email", "phone_number", "gender", "nickname", "is_staff")
