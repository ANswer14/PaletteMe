from django.db import models
from django.conf import settings

# 게시글
class Post(models.Model):
    """게시글 모델 (자유게시판/ QnA 겸용)"""

    # 카테고리(게시판 종류)
    CATEGORY_CHOICES = [
        ("FREE", "자유게시판"),
        ("QNA", "QnA"),
        ("NOTICE", "Notice")
    ]

    post_id = models.AutoField(primary_key=True)

    # 작성자 (User 모델과 연결)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )

    body = models.TextField(null=False)

    # 제목/내용
    title = models.CharField(max_length=200, null=False)

    # 게시판 종류
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default="FREE")

    # 옵션
    is_secret = models.BooleanField(default=False)      # 비밀글
    is_anonymous = models.BooleanField(default=False)   # 익명글

    # 통계 및 시간
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 좋아요를 누른 유저들
    like_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='like_posts',
        blank=True
    )

    def __str__(self):
        return f"[{self.category}] {self.title}"


# 게시글 이미지
class PostImage(models.Model):
    """게시글에 포함된 이미지들"""
    # admin.py의 에러를 방지하기 위해 필드명을 post_img_id로 수정했습니다.
    post_img_id = models.AutoField(primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(blank=True, upload_to='post_images/%Y/%m/%d/')


# 좋아요 기록용 모델
class Like(models.Model):
    """게시글 좋아요 (별도 기록용)"""
    like_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    is_thumbs_up = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['post', 'user'],
                name='unique_enrollment'
            )
        ]

    def __str__(self):
        return f"Like(user_id={self.user_id}, post_id={self.post_id})"


# 댓글
class Comment(models.Model):
    """댓글 모델"""
    comment_id = models.AutoField(primary_key=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.author.username if hasattr(self.author, 'username') else 'Anonymous'}: {self.body[:20]}"