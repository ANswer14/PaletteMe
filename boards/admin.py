"""
boards/admin.py
- /admin/ 에서 모델을 관리할 수 있게 등록하는 파일
- ImportError가 나지 않게 models.py에 Like/PostImage 등이 반드시 존재해야 함
"""

from django.contrib import admin
from .models import Post, PostImage, Like, Qna, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    # 목록에 보여줄 컬럼들
    list_display = ("id", "category", "qna_type", "title", "author", "is_secret", "is_anonymous", "created_at")
    # 오른쪽 필터
    list_filter = ("category", "qna_type", "is_secret", "is_anonymous")
    # 검색 대상
    search_fields = ("title", "body_html", "author__username")
    # 정렬
    ordering = ("-id",)


@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ("id", "post", "image", "created_at")
    ordering = ("-id",)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "created_at")
    ordering = ("-id",)


@admin.register(Qna)
class QnaAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "created_at")
    ordering = ("-id",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "post", "qna", "created_at")
    ordering = ("-id",)
