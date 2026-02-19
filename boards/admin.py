from django.contrib import admin
# models.py에 정의된 클래스명과 대소문자를 일치시켜야 합니다.
# 만약 models.py에 QnA라고 되어 있다면 아래처럼 QnA로 수정하세요.
from .models import Post, PostImage, Like, Comment

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("post_id", "category", "title", "author", "is_secret", "is_anonymous", "created_at")
    list_filter = ("category", "is_secret", "is_anonymous")
    search_fields = ("title", "body", "author__username")
    ordering = ("-post_id",)

@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ("post_img_id", "post", "image")
    ordering = ("-post_img_id",)

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("like_id", "user", "post", "is_thumbs_up")
    ordering = ("-like_id",)

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("comment_id", "author", "post", "created_at")
    ordering = ("-comment_id",)

