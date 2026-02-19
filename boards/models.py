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

    # # QnA 유형(자유게시판이면 비워둠)
    # qna_type = models.CharField(max_length=20, choices=QNA_TYPE_CHOICES, blank=True)


    # 옵션
    is_secret = models.BooleanField(default=False)      # 비밀글
    is_anonymous = models.BooleanField(default=False)   # 익명글

    # 작성 시간
    created_at = models.DateTimeField(auto_now_add=True)

    # 조회수
    view_count = models.PositiveIntegerField(default=0)

    # 좋아요 수
    thumbs_up_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"[{self.category}] {self.title}"


# 게시글 이미지
class PostImage(models.Model):
    """게시글에 첨부되는 이미지(여러 장 가능)"""
    post_img_id = models.AutoField(primary_key=True) # PK
    # 어떤 게시글에 속한 이미지인지
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="images")

    # 업로드 이미지 파일
    image = models.ImageField(blank=True, upload_to='post_images/%Y/%m/%d/')

# 좋아요
class Like(models.Model):
    """게시글 좋아요"""
    like_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    is_thumbs_up = models.BooleanField(default=False)

    class Meta:
        # 한 유저가 같은 게시글에 좋아요를 여러 번 못 누르게 제한
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
    """
    댓글 모델
    - Post 댓글 또는 Qna 댓글 둘 중 하나에만 연결되도록 설계
    - 둘 다 nullable로 열어두고, views에서 어느 쪽인지 지정해서 저장
    """

    comment_id = models.AutoField(primary_key=True)

    # 게시글
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments", null=True, blank=True)

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    # 댓글 내용
    body = models.TextField()
    # 생성 날짜
    created_at = models.DateTimeField(auto_now_add=True)
