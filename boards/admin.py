from django.contrib import admin
from .models import Post, Qna, Comment, Like


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "category", "is_secret", "is_anonymous", "view_count", "created_at")
    list_filter = ("category", "is_secret", "is_anonymous")
    search_fields = ("title", "body_html", "author__username")
    ordering = ("-id",)


@admin.register(Qna)
class QnaAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "is_anonymous", "created_at")
    list_filter = ("is_anonymous",)
    search_fields = ("title", "body_html", "author__username")
    ordering = ("-id",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "post", "qna", "created_at")
    search_fields = ("body", "author__username")
    ordering = ("-id",)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "created_at")
    search_fields = ("user__username", "post__title")
    ordering = ("-id",)
