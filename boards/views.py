"""
boards/views.py
- URL로 들어오는 요청을 처리하는 함수들
- urls.py에서 연결한 이름(post_edit 등)이 여기 반드시 존재해야 서버가 켜짐
"""

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden
from django.core.paginator import Paginator
from django.db.models import Q, F
from django.db import IntegrityError, transaction

from .forms import PostForm, QnaForm, CommentForm
from .models import Post, Qna, Comment, Like, PostImage


# -------------------------
# 게시글 목록
# -------------------------
def post_list(request):
    """
    GET /boards/
    - 검색(q)이 있으면 제목/본문에서 검색
    - 최신글이 위로 오도록 -id 정렬
    - page 파라미터로 페이지네이션
    """
    q = (request.GET.get("q") or "").strip()

    qs = Post.objects.select_related("author").order_by("-id")
    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(body_html__icontains=q))

    page_obj = Paginator(qs, 10).get_page(request.GET.get("page"))
    return render(request, "boards/board1.html", {"page_obj": page_obj, "q": q})


# -------------------------
# 게시글 작성
# -------------------------
@login_required
@require_http_methods(["GET", "POST"])
def post_create(request):
    """
    GET  -> 글쓰기 페이지 렌더
    POST -> 폼 검증 후 DB 저장

    write.html 폼에서 오는 주요 name:
    - title, body_html
    - is_secret (체크면 value=1)
    - is_anonymous (체크면 value=1)
    - qna_type (라디오 선택값)
    - images (multiple 파일 업로드)
    """
    if request.method == "POST":
        data = request.POST.copy()

        # 입력값 정리
        data["title"] = (data.get("title") or "").strip()
        data["body_html"] = (data.get("body_html") or "").strip()

        # 체크박스는 체크되면 "1" / 아니면 None
        data["is_secret"] = "true" if data.get("is_secret") == "1" else ""
        data["is_anonymous"] = "true" if data.get("is_anonymous") == "1" else ""

        # write.html에 category input이 없으니 qna_type 있으면 QNA, 없으면 FREE
        data["category"] = "QNA" if data.get("qna_type") else "FREE"

        form = PostForm(data)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user  # 작성자 지정
            post.save()

            # 이미지 여러 장 저장
            for f in request.FILES.getlist("images"):
                PostImage.objects.create(post=post, image=f)

            # 저장 후 상세 페이지로 이동
            return redirect("boards:post_detail", post_id=post.id)

        # 유효성 실패 시 다시 글쓰기 페이지로
        return render(request, "boards/write.html", {"form": form})

    # GET: 빈 폼
    return render(request, "boards/write.html", {"form": PostForm()})


# -------------------------
# 게시글 상세
# -------------------------
def post_detail(request, post_id):
    """
    GET /boards/<post_id>/
    - 비밀글이면 작성자/관리자만 허용(그 외 403)
    - 조회수 +1 (F 표현식 사용)
    - 댓글/좋아요 상태도 같이 전달
    """
    post = get_object_or_404(Post.objects.select_related("author"), id=post_id)

    # 비밀글 처리
    if post.is_secret:
        if not request.user.is_authenticated:
            return HttpResponseForbidden("비밀글은 로그인 후 볼 수 있습니다.")
        if post.author_id != request.user.id and not request.user.is_staff:
            return HttpResponseForbidden("비밀글입니다.")

    # 조회수 +1
    Post.objects.filter(id=post.id).update(view_count=F("view_count") + 1)
    post.refresh_from_db(fields=["view_count"])

    # 댓글 조회
    comments = post.comments.select_related("author").order_by("id")

    # 좋아요 여부
    liked = False
    if request.user.is_authenticated:
        liked = Like.objects.filter(user=request.user, post=post).exists()

    return render(request, "boards/board2.html", {
        "post": post,
        "comments": comments,
        "liked": liked,
        "comment_form": CommentForm(),
    })


# -------------------------
# 게시글 수정 (urls.py가 이 이름을 찾음)
# -------------------------
@login_required
@require_http_methods(["GET", "POST"])
def post_edit(request, post_id):
    """
    GET  -> 기존 값 채운 write 화면
    POST -> 수정 저장
    """
    post = get_object_or_404(Post, id=post_id)

    # 작성자/관리자만 수정
    if post.author_id != request.user.id and not request.user.is_staff:
        return HttpResponseForbidden("권한이 없습니다.")

    if request.method == "POST":
        data = request.POST.copy()

        data["title"] = (data.get("title") or "").strip()
        data["body_html"] = (data.get("body_html") or "").strip()
        data["is_secret"] = "true" if data.get("is_secret") == "1" else ""
        data["is_anonymous"] = "true" if data.get("is_anonymous") == "1" else ""

        # 수정 시 카테고리 유지(원하면 qna_type으로 바꾸는 로직 추가 가능)
        data["category"] = post.category

        form = PostForm(data, instance=post)
        if form.is_valid():
            form.save()
            return redirect("boards:post_detail", post_id=post.id)

        return render(request, "boards/write.html", {"form": form, "post": post})

    # GET
    return render(request, "boards/write.html", {"form": PostForm(instance=post), "post": post})


# -------------------------
# 게시글 삭제
# -------------------------
@login_required
@require_POST
def post_delete(request, post_id):
    """POST /boards/<post_id>/delete/"""
    post = get_object_or_404(Post, id=post_id)

    if post.author_id != request.user.id and not request.user.is_staff:
        return HttpResponseForbidden("권한이 없습니다.")

    post.delete()
    return redirect("boards:post_list")


# -------------------------
# 댓글 작성 (Post)
# -------------------------
@login_required
@require_POST
def post_comment_create(request, post_id):
    """POST /boards/<post_id>/comment/"""
    post = get_object_or_404(Post, id=post_id)

    form = CommentForm(request.POST)
    if form.is_valid():
        c = form.save(commit=False)
        c.author = request.user
        c.post = post
        c.save()

    return redirect("boards:post_detail", post_id=post_id)


# -------------------------
# 좋아요 토글
# -------------------------
@login_required
@require_POST
def post_toggle_like(request, post_id):
    """
    POST /boards/<post_id>/like/
    - 이미 좋아요가 있으면 삭제(취소)
    - 없으면 생성
    - transaction으로 동시성에 조금 더 안전하게
    """
    post = get_object_or_404(Post, id=post_id)

    try:
        with transaction.atomic():
            like, created = Like.objects.get_or_create(user=request.user, post=post)
            if not created:
                like.delete()
    except IntegrityError:
        # 혹시 꼬인 경우 정리
        Like.objects.filter(user=request.user, post=post).delete()

    return redirect("boards:post_detail", post_id=post_id)


# ==========================================================
# QnA (필요 없으면 urls.py에서 지워도 됨)
# ==========================================================
def qna_list(request):
    qs = Qna.objects.select_related("author").order_by("-id")
    page_obj = Paginator(qs, 10).get_page(request.GET.get("page"))
    return render(request, "boards/QnA1.html", {"page_obj": page_obj})


@login_required
@require_http_methods(["GET", "POST"])
def qna_create(request):
    if request.method == "POST":
        form = QnaForm(request.POST)
        if form.is_valid():
            qna = form.save(commit=False)
            qna.author = request.user
            qna.save()
            return redirect("boards:qna_detail", qna_id=qna.id)
        return render(request, "boards/QnAWrite.html", {"form": form})
    return render(request, "boards/QnAWrite.html", {"form": QnaForm()})


def qna_detail(request, qna_id):
    qna = get_object_or_404(Qna.objects.select_related("author"), id=qna_id)
    comments = qna.comments.select_related("author").order_by("id")
    return render(request, "boards/QnA2.html", {"qna": qna, "comments": comments, "comment_form": CommentForm()})


@login_required
@require_http_methods(["GET", "POST"])
def qna_edit(request, qna_id):
    qna = get_object_or_404(Qna, id=qna_id)

    if qna.author_id != request.user.id and not request.user.is_staff:
        return HttpResponseForbidden("권한이 없습니다.")

    if request.method == "POST":
        form = QnaForm(request.POST, instance=qna)
        if form.is_valid():
            form.save()
            return redirect("boards:qna_detail", qna_id=qna.id)
        return render(request, "boards/QnAWrite.html", {"form": form, "qna": qna})

    return render(request, "boards/QnAWrite.html", {"form": QnaForm(instance=qna), "qna": qna})


@login_required
@require_POST
def qna_delete(request, qna_id):
    qna = get_object_or_404(Qna, id=qna_id)

    if qna.author_id != request.user.id and not request.user.is_staff:
        return HttpResponseForbidden("권한이 없습니다.")

    qna.delete()
    return redirect("boards:qna_list")


@login_required
@require_POST
def qna_comment_create(request, qna_id):
    qna = get_object_or_404(Qna, id=qna_id)

    form = CommentForm(request.POST)
    if form.is_valid():
        c = form.save(commit=False)
        c.author = request.user
        c.qna = qna
        c.save()

    return redirect("boards:qna_detail", qna_id=qna_id)


# 공지사항(연결만)
def notice_list(request):
    return render(request, "boards/notice1.html")


def notice_detail(request, notice_id):
    return render(request, "boards/notice2.html", {"notice_id": notice_id})
