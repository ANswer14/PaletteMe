from django.conf import settings
from django.db import models
from django.db.models import Q

UserModel = settings.AUTH_USER_MODEL


class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class Post(TimeStamped):
    CATEGORY_CHOICES = [
        ("FREE", "자유"),
        ("INFO", "정보"),
        ("QNA", "질문"),
    ]

    author = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=80)
    body_html = models.TextField()

    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default="FREE")
    is_secret = models.BooleanField(default=False)
    is_anonymous = models.BooleanField(default=False)

    view_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title


class Qna(TimeStamped):
    author = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="qnas")
    title = models.CharField(max_length=200)
    body_html = models.TextField()
    is_anonymous = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Comment(TimeStamped):
    author = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE, related_name="comments")
    qna = models.ForeignKey(Qna, null=True, blank=True, on_delete=models.CASCADE, related_name="comments")
    body = models.TextField()

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=((Q(post__isnull=False) & Q(qna__isnull=True)) |
                       (Q(post__isnull=True) & Q(qna__isnull=False))),
                name="comment_exactly_one_parent",
            )
        ]


class Like(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "post"], name="unique_like_user_post")
        ]
