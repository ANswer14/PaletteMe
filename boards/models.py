from django.db import models

# Create your models here.
from django.db import models

class QnaPost(models.Model):
    title = models.CharField(max_length=200)
    writer = models.CharField(max_length=50, default="익명")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.id} - {self.title}"
