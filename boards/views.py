from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden
from django.core.paginator import Paginator
from django.db.models import Q, F
from django.db import IntegrityError, transaction
from .forms import PostForm, QnaForm, CommentForm


def display_name(user) -> str:
    return getattr(user, "nickname", None) or user.username


# ---------- Posts (읽기: 공개 / 쓰기: 로그인) ----------
def post_list(request):
    q = (request.GET.get("q") or "").strip()
    category = (request.GET.get("category") or "").strip()

    qs = Post.objects.select_related("author").order_by("-id")
    if category:
        qs = qs.filter(category=category)
    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(body_html__icontains=q))

    page_obj = Paginator(qs, 10).get_page(request.GET.get("page"))
    return render(request, "boards/board1.html", {"page_obj": page_obj, "q": q, "category": category})


@login_required
@require_http_methods(["GET", "POST"])
def post_create(request):
    if request.method == "POST":
        # 템플릿/JS에서 넘어오는 키(postTitle/postContentHtml/0-1 플래그)를 Form 필드로 매핑
        data = request.POST.copy()
        data["title"] = (data.get("postTitle") or "").strip()
        data["body_html"] = (data.get("postContentHtml") or "").strip()
        data["is_secret"] = "true" if data.get("postIsSecret") == "1" else ""
        data["is_anonymous"] = "true" if data.get("postIsAnonymous") == "1" else ""

        if not data.get("category"):
            data["category"] = "FREE"

        form = PostForm(data)
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()
            return redirect("boards:post_detail", post_id=post.id)

        return render(request, "boards/boardWrite.html", {"form": form})

    return render(request, "boards/boardWrite.html", {"form": PostForm()})


def post_detail(request, post_id):
    post = get_object_or_404(Post.objects.select_related("author"), id=post_id)

    # ✅ 비밀글은 로그인 + 권한 필요
    if post.is_secret:
        if not request.user.is_authenticated:
            return HttpResponseForbidden("비밀글은 로그인 후 볼 수 있습니다.")
        if post.author_id != request.user.id and not request.user.is_staff:
            return HttpResponseForbidden("비밀글입니다.")

    Post.objects.filter(id=post.id).update(view_count=F("view_count") + 1)
    post.refresh_from_db(fields=["view_count"])

    comments = post.comments.select_related("author").order_by("id")

    liked = False
    if request.user.is_authenticated:
        liked = Like.objects.filter(user=request.user, post=post).exists()

    return render(request, "boards/board2.html", {
        "post": post,
        "comments": comments,
        "liked": liked,
        "comment_form": CommentForm(),
        "display_name": display_name,
    })


@login_required
@require_http_methods(["GET", "POST"])
def post_edit(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    if post.author_id != request.user.id and not request.user.is_staff:
        return HttpResponseForbidden("권한이 없습니다.")

    if request.method == "POST":
        data = request.POST.copy()
        data["title"] = (data.get("postTitle") or "").strip()
        data["body_html"] = (data.get("postContentHtml") or "").strip()
        data["is_secret"] = "true" if data.get("postIsSecret") == "1" else ""
        data["is_anonymous"] = "true" if data.get("postIsAnonymous") == "1" else ""

        if not data.get("category"):
            data["category"] = post.category

        form = PostForm(data, instance=post)
        if form.is_valid():
            form.save()
            return redirect("boards:post_detail", post_id=post.id)

        return render(request, "boards/boardWrite.html", {"form": form, "post": post})

    return render(request, "boards/boardWrite.html", {"form": PostForm(instance=post), "post": post})


@login_required
@require_POST
def post_delete(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    if post.author_id != request.user.id and not request.user.is_staff:
        return HttpResponseForbidden("권한이 없습니다.")
    post.delete()
    return redirect("boards:post_list")


@login_required
@require_POST
def post_comment_create(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    if post.is_secret and post.author_id != request.user.id and not request.user.is_staff:
        return HttpResponseForbidden("비밀글입니다.")

    form = CommentForm(request.POST)
    if form.is_valid():
        c = form.save(commit=False)
        c.author = request.user
        c.post = post
        c.save()

    return redirect("boards:post_detail", post_id=post_id)


@login_required
@require_POST
def post_toggle_like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    try:
        with transaction.atomic():
            like, created = Like.objects.get_or_create(user=request.user, post=post)
            if not created:
                like.delete()
    except IntegrityError:
        Like.objects.filter(user=request.user, post=post).delete()

    return redirect("boards:post_detail", post_id=post_id)


# ---------- QnA (읽기: 공개 / 쓰기: 로그인) ----------
def qna_list(request):
    q = (request.GET.get("q") or "").strip()
    qs = Qna.objects.select_related("author").order_by("-id")
    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(body_html__icontains=q))

    page_obj = Paginator(qs, 10).get_page(request.GET.get("page"))
    return render(request, "boards/QnA1.html", {"page_obj": page_obj, "q": q})


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

        # ✅ form 에러 시에도 입력값 유지
        return render(request, "boards/QnAWrite.html", {"form": form})

    return render(request, "boards/QnAWrite.html", {"form": QnaForm()})


def qna_detail(request, qna_id):
    qna = get_object_or_404(Qna.objects.select_related("author"), id=qna_id)
    comments = qna.comments.select_related("author").order_by("id")

    return render(request, "boards/QnA2.html", {
        "qna": qna,
        "comments": comments,
        "comment_form": CommentForm(),
        "display_name": display_name,
    })


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

    # ✅ 에디터 초기값은 템플릿이 qna.body_html로 채움
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


# ---------- Notice (읽기: 공개) ----------
def notice_list(request):
    return render(request, "boards/notice1.html", {"page_obj": []})


def notice_detail(request, notice_id):
    return render(request, "boards/notice2.html", {"notice": None})
