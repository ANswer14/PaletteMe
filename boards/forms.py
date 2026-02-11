from django import forms
import bleach
from .models import Post, Qna, Comment

ALLOWED_TAGS = [
    "p","br","b","strong","i","em","u","s",
    "blockquote","pre","code","ul","ol","li",
    "span","div","img"
]
ALLOWED_ATTRS = {"*": ["style"], "img": ["src", "alt"]}
ALLOWED_PROTOCOLS = ["http", "https", "data"]  # base64 이미지 유지용(운영형이면 data 제거 권장)


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["title", "body_html", "category", "is_secret", "is_anonymous"]

    def clean_body_html(self):
        html = self.cleaned_data.get("body_html") or ""
        return bleach.clean(
            html,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRS,
            protocols=ALLOWED_PROTOCOLS,
            strip=True,
        )


class QnaForm(forms.ModelForm):
    class Meta:
        model = Qna
        fields = ["title", "body_html", "is_anonymous"]

    def clean_body_html(self):
        html = self.cleaned_data.get("body_html") or ""
        return bleach.clean(
            html,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRS,
            protocols=ALLOWED_PROTOCOLS,
            strip=True,
        )


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["body"]
