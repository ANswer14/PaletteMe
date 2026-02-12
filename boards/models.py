"""
boards/models.py
- DB 테이블(스키마)을 정의하는 파일
- ⚠️ 절대 forms.py나 자기 자신(.models)을 import 하면 안 됩니다 (순환 import 발생)
"""

from django.conf import settings
from django.db import models


class Post(models.Model):
    """게시글 모델 (자유게시판/ QnA 겸용)"""

    # 카테고리(게시판 종류)
    CATEGORY_CHOICES = [
        ("FREE", "자유게시판"),
        ("QNA", "QnA"),
    ]

    # QnA 세부 타입 (QNA일 때만 의미 있음)
    QNA_TYPE_CHOICES = [
        ("bug", "버그 제보"),
        ("question", "사이트 관련 질문"),
        ("suggestion", "건의 사항"),
    ]

    # 작성자 (User 모델과 연결)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )

    # 게시판 종류
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default="FREE")

    # QnA 유형(자유게시판이면 비워둠)
    qna_type = models.CharField(max_length=20, choices=QNA_TYPE_CHOICES, blank=True)

    # 제목/내용
    title = models.CharField(max_length=200)
    body_html = models.TextField()

    # 옵션
    is_secret = models.BooleanField(default=False)      # 비밀글
    is_anonymous = models.BooleanField(default=False)   # 익명글

    # 조회수
    view_count = models.PositiveIntegerField(default=0)

    # 작성 시간
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.category}] {self.title}"


class PostImage(models.Model):
    """게시글에 첨부되는 이미지(여러 장 가능)"""

    # 어떤 게시글에 속한 이미지인지
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="images")

    # 업로드 이미지 파일
    image = models.ImageField(upload_to="post_images/")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PostImage(post_id={self.post_id})"


class Like(models.Model):
    """게시글 좋아요"""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # 한 유저가 같은 게시글에 좋아요를 여러 번 못 누르게 제한
        unique_together = ("user", "post")

    def __str__(self):
        return f"Like(user_id={self.user_id}, post_id={self.post_id})"


class Qna(models.Model):
    """QnA 전용 모델(별도 게시판처럼 쓸 때)"""

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="qnas",
    )
    title = models.CharField(max_length=200)
    body_html = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Comment(models.Model):
    """
    댓글 모델
    - Post 댓글 또는 Qna 댓글 둘 중 하나에만 연결되도록 설계
    - 둘 다 nullable로 열어두고, views에서 어느 쪽인지 지정해서 저장
    """

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    # Post 댓글일 때 사용
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments", null=True, blank=True)

    # Qna 댓글일 때 사용
    qna = models.ForeignKey(Qna, on_delete=models.CASCADE, related_name="comments", null=True, blank=True)

    # 댓글 내용
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = f"post={self.post_id}" if self.post_id else f"qna={self.qna_id}"
        return f"Comment({target})"
