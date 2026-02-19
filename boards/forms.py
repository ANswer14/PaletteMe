"""
boards/forms.py
- 사용자 입력(POST)을 검증/정리(clean)하는 곳
- ✅ forms.py는 models.py를 import해도 OK
- ❌ models.py는 forms.py를 import하면 안 됨 (순환 import)
"""

from django import forms
from django.utils.html import strip_tags

from .models import Post, Qna, Comment


class PostForm(forms.ModelForm):
    """
    Post 생성/수정 폼
    - write.html에서 넘어오는 title/body_html/is_secret/is_anonymous 등을 검증
    """

    class Meta:
        model = Post
        fields = ["category", "qna_type", "title", "body_html", "is_secret", "is_anonymous"]

    def clean_title(self):
        """제목 앞뒤 공백 제거"""
        return (self.cleaned_data.get("title") or "").strip()

    def clean_body_html(self):
        """
        body_html 정리:
        - 에디터/textarea에서 들어오는 HTML 문자열
        - 최소 안전장치로 <script> 포함 시 태그 제거
        """
        body_html = (self.cleaned_data.get("body_html") or "").strip()
        if "<script" in body_html.lower():
            body_html = strip_tags(body_html)
        return body_html

    def clean(self):
        """
        폼 전체 검증(필드 간 규칙)
        - FREE 게시판이면 qna_type 강제로 비움
        """
        cleaned = super().clean()
        category = cleaned.get("category") or "FREE"
        if category == "FREE":
            cleaned["qna_type"] = ""
        return cleaned


class QnaForm(forms.ModelForm):
    """QnA 글 작성/수정 폼"""

    class Meta:
        model = Qna
        fields = ["title", "body_html"]


class CommentForm(forms.ModelForm):
    """댓글 폼 (Post/Qna 공용)"""

    class Meta:
        model = Comment
        fields = ["body"]
