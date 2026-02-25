import json
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from .models import Post, PostImage, Comment, Like


# ==========================================
# [1. 목록 페이지 관련 로직]
# ==========================================

def board1(request):
    """[자유게시판 목록]"""
    posts_list = Post.objects.filter(category='FREE').order_by('-created_at')
    hot_posts = Post.objects.filter(category='FREE').order_by('-view_count')[:3]
    kw = request.GET.get('kw', '')
    if kw:
        posts_list = posts_list.filter(Q(title__icontains=kw) | Q(body__icontains=kw)).distinct()
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/board1.html', {
        'posts': page_obj, 'page_obj': page_obj, 'hot_posts': hot_posts, 'kw': kw,
        'board_type': 'free'
    })


def qna1(request):
    """[Q&A 게시판 목록]"""
    posts_list = Post.objects.filter(category='QNA').order_by('-created_at')
    q = request.GET.get('q', '')
    search_type = request.GET.get('type', 'all')
    if q:
        if search_type == 'title':
            posts_list = posts_list.filter(title__icontains=q)
        elif search_type == 'content':
            posts_list = posts_list.filter(body__icontains=q)
        else:
            posts_list = posts_list.filter(Q(title__icontains=q) | Q(body__icontains=q)).distinct()
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/QnA1.html', {
        'posts': page_obj, 'page_obj': page_obj, 'q': q, 'type': search_type,
        'board_type': 'qna'
    })


def notice1(request):
    """[공지사항 목록]"""
    posts_list = Post.objects.filter(category='NOTICE').order_by('-created_at')
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/notice1.html', {'posts': page_obj, 'page_obj': page_obj, 'board_type': 'notice'})


# ==========================================
# [2. 상세 페이지 관련 로직]
# ==========================================

def board_detail_common(request, template_name, board_type=None):
    """[상세페이지 공통 엔진] 좋아요 유지 로직 포함"""
    post_id = request.GET.get('no')
    post = get_object_or_404(Post, pk=post_id)

    session_key = f'view_hit_{post_id}'
    if not request.session.get(session_key):
        post.view_count += 1
        post.save()
        request.session[session_key] = True
        request.session.set_expiry(86400)

    prev_post = Post.objects.filter(category=post.category, pk__lt=post.pk).order_by('-pk').first()
    next_post = Post.objects.filter(category=post.category, pk__gt=post.pk).order_by('pk').first()

    user_liked = False
    if request.user.is_authenticated:
        user_liked = Like.objects.filter(user=request.user, post=post).exists()

    return render(request, template_name, {
        'post': post,
        'images': post.images.all(),
        'comments': post.comments.all().order_by('created_at'),
        'user_liked': user_liked,
        'like_count': post.likes.count() if hasattr(post, 'likes') else post.like_set.count(),
        'board_type': board_type,
        'prev_id': prev_post.pk if prev_post else None,
        'next_id': next_post.pk if next_post else None,
    })


def board2(request): return board_detail_common(request, 'boards/board2.html', board_type='free')


def qna2(request): return board_detail_common(request, 'boards/QnA2.html', board_type='qna')


def notice2(request): return board_detail_common(request, 'boards/notice2.html', board_type='notice')


def get_notice_detail(request):
    post_id = request.GET.get('no')
    post = get_object_or_404(Post, pk=post_id)
    image_list = [{'url': img.image.url} for img in post.images.all()] if hasattr(post, 'images') else []
    return JsonResponse({
        'no': post.pk, 'title': post.title, 'content': post.body,
        'created_at': post.created_at.strftime('%Y-%m-%d'), 'images': image_list
    })


# ==========================================
# [3. 게시글 작성 / 수정 / 삭제]
# ==========================================

@login_required
def boardWrite(request):
    """[게시글 작성/수정 페이지 진입] - 이미지 로드 로직 통합본"""
    post_id = request.GET.get('no')
    board_type_param = (request.GET.get('type') or 'FREE').upper()

    post = None
    images = []  # 이미지를 담을 빈 리스트 초기화

    if post_id:
        post = get_object_or_404(Post, pk=post_id)
        # 권한 체크
        if post.author != request.user and not request.user.is_staff:
            return redirect('boards:board1')

        # 수정 모드일 때 해당 포스트의 이미지들을 쿼리해서 가져옵니다.
        images = post.images.all()
        board_type = post.category
    else:
        board_type = board_type_param

    return render(request, 'boards/boardWrite.html', {
        'data': post,
        'images': images,  # 템플릿의 {% for img in images %}로 전달
        'is_edit': bool(post_id),
        'board_type': board_type.lower()
    })


@login_required
def board_create_api(request):
    """[게시글 저장 API]"""
    if request.method == 'POST':
        try:
            post_id = request.POST.get('post_id')
            title = request.POST.get('title', '').strip()
            body = request.POST.get('body', '').strip()
            category = request.POST.get('category', 'FREE').upper()
            is_anonymous = request.POST.get('is_anonymous') == 'true'
            is_secret = request.POST.get('is_secret') == 'true'

            if post_id:
                post = get_object_or_404(Post, pk=post_id)
                post.title, post.body, post.category = title, body, category
                post.is_secret, post.is_anonymous = is_secret, is_anonymous
            else:
                post = Post(author=request.user, title=title, body=body, category=category,
                            is_secret=is_secret, is_anonymous=is_anonymous)
            post.save()

            for img in request.FILES.getlist('images'):
                PostImage.objects.create(post=post, image=img)

            return JsonResponse({'status': 'success', 'post_id': post.pk})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'fail'}, status=400)


@login_required
def delete(request):
    post_id = request.GET.get('no')
    post = get_object_or_404(Post, pk=post_id)
    if request.user == post.author or request.user.is_staff:
        cat = post.category
        post.delete()
        if cat == 'QNA': return redirect('boards:qna1')
        if cat == 'NOTICE': return redirect('boards:notice1')
    return redirect('boards:board1')


# ==========================================
# [4. 댓글 및 좋아요 / 이미지 관리 API]
# ==========================================

@login_required
def comment_create_api(request, post_id):
    if request.method == 'POST':
        try:
            post = get_object_or_404(Post, pk=post_id)
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            content_body = data.get('body', '').strip()
            if not content_body: return JsonResponse({'status': 'fail', 'message': '내용 없음'}, status=400)
            Comment.objects.create(post=post, author=request.user, body=content_body)
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'fail'}, status=405)


@login_required
def comment_update_api(request, comment_id):
    if request.method == 'POST':
        try:
            comment = get_object_or_404(Comment, pk=comment_id)
            if comment.author != request.user and not request.user.is_staff:
                return JsonResponse({'status': 'fail', 'message': '권한 없음'}, status=403)
            data = json.loads(request.body)
            content_body = data.get('body', '').strip()
            if content_body:
                comment.body = content_body
                comment.save()
                return JsonResponse({'status': 'success'})
            return JsonResponse({'status': 'fail'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'fail', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'fail'}, status=400)


@login_required
def comment_delete_api(request, comment_id):
    if request.method == 'POST':
        comment = get_object_or_404(Comment, pk=comment_id)
        if comment.author == request.user or request.user.is_staff:
            comment.delete()
            return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'fail'}, status=400)


@login_required
def post_like_api(request, post_id):
    if request.method == 'POST':
        post = get_object_or_404(Post, pk=post_id)
        like_qs = Like.objects.filter(user=request.user, post=post)
        liked = False
        if like_qs.exists():
            like_qs.delete()
        else:
            Like.objects.create(user=request.user, post=post)
            liked = True
        count = post.likes.count() if hasattr(post, 'likes') else post.like_set.count()
        return JsonResponse({'liked': liked, 'like_count': count})
    return JsonResponse({'status': 'fail'}, status=400)


@login_required
def delete_post_image_api(request, img_id):
    if request.method == 'POST':
        image = get_object_or_404(PostImage, pk=img_id)
        if image.post.author == request.user or request.user.is_staff:
            image.delete()
            return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'fail'}, status=400)