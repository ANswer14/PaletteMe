from django.db import models
from django.conf import settings  # AUTH_USER_MODEL 참조를 위해 필요


class ColorHistory(models.Model):
    history_id = models.AutoField(primary_key=True)

    # CustomUser의 기본키를 외래키로 설정
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='color_history'
    )

    # 퍼스널 컬러 관련 필드 예시
    executed_at = models.DateTimeField(auto_now_add=True)
    color_type = models.CharField(max_length=30)  # 예: '봄 웜'
    mood = models.CharField(max_length=50) # 분위기
    good_color = models.CharField(max_length=100) # 어울리는 색감
    bad_color = models.CharField(max_length=100) # 어울리지 않는 색감
    is_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"History #{self.history_id}: {self.user.username}'s {self.color_type}"

# 최근 이미지 테이블
class RecentImages(models.Model):
    recent_id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recent_images'
    )

    result_image = models.ImageField(blank=True, upload_to='personalColors/recent/%Y/%m/%d/')
    created_at = models.DateTimeField(auto_now_add=True)

class FavoriteImages(models.Model):
    favorite_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorite_images'
    )

    favorite_image = models.ImageField(blank=True, upload_to='personalColors/consistency/%Y/%m/%d/')