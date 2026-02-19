from django.contrib import admin
from django.contrib.auth.admin import UserAdmin  # 회원 관리용
from .models import CustomUser  # allauth는 제공하지 않는 커스텀 정보 (연락처, 성별)
from django.utils.html import format_html  # HTML 출력을 위해 필요


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):  # 커스텀 정보 (연락처, 성별, 닉네임) 출력
    fieldsets = UserAdmin.fieldsets + (
        ("추가 정보", {
            "fields": ("phone_number", "gender", "nickname", "profile_image"),
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("추가 정보", {
            "fields": ("phone_number", "gender", "nickname", "profile_image"),
        }),
    )

    # 목록에서 미리보기 이미지를 그려주는 함수 (클래스 내부 메서드)
    def profile_tag(self, obj):
        # 우리가 만든 모델의 profile_url은 static/media를 이미 구분함
        if obj.profile_url:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />',
                obj.profile_url
            )
        return "No Image"

    profile_tag.short_description = "프사 미리보기"  # 컬럼 제목 설정

    list_display = ("username", "email", "phone_number", "gender", "nickname", "profile_tag", "is_staff")
