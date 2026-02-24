import json
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from .models import Post, PostImage, Comment, Like
from django.db.models import Q  # 검색 조건을 위해 필요합니다

# --- [1. 목록 및 상세 페이지] ---
def board1(request):
    posts_list = Post.objects.filter(category='FREE').order_by('-created_at')
    hot_posts = Post.objects.filter(category='FREE').order_by('-view_count')[:3]
    kw = request.GET.get('kw', '')
    if kw:
        posts_list = posts_list.filter(Q(title__icontains=kw) | Q(body__icontains=kw)).distinct()
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/board1.html',
                  {'posts': page_obj, 'page_obj': page_obj, 'hot_posts': hot_posts, 'kw': kw})


def qna1(request):
    posts_list = Post.objects.filter(category='QNA').order_by('-created_at')
    kw = request.GET.get('kw', '')
    if kw:
        posts_list = posts_list.filter(Q(title__icontains=kw) | Q(body__icontains=kw)).distinct()
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/qna1.html', {'posts': page_obj, 'page_obj': page_obj, 'kw': kw})


def notice1(request):
    posts_list = Post.objects.filter(category='NOTICE').order_by('-created_at')
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/notice1.html', {'posts': page_obj, 'page_obj': page_obj})


def board_detail_common(request, template_name):
    post_id = request.GET.get('no')
    post = get_object_or_404(Post, pk=post_id)
    post.view_count += 1
    post.save()
    user_liked = request.user.is_authenticated and Like.objects.filter(user=request.user, post=post).exists()
    return render(request, template_name, {
        'post': post,
        'images': post.images.all(),
        'comments': post.comments.all().order_by('created_at'),
        'user_liked': user_liked,
        'like_count': post.likes.count()
    })


def board2(request): return board_detail_common(request, 'boards/board2.html')


# QnA2.html 파일명의 대소문자를 실제 파일과 꼭 맞추세요!
def qna2(request): return board_detail_common(request, 'boards/QnA2.html')


def notice2(request): return board_detail_common(request, 'boards/notice2.html')


# --- [2. 게시글 작성/수정/삭제] ---
@login_required
def boardWrite(request):
    # 'mode=edit' 파라미터가 있을 때만 수정 모드로 동작하게 하여 상세페이지와의 충돌 방지
    mode = request.GET.get('mode')
    post_id = request.GET.get('no')

    post_obj = None
    # 수정 모드이거나, 상세페이지 이동이 아닌 '글쓰기' 페이지에서 no가 넘어온 경우만 처리
    if mode == 'edit' and post_id:
        post_obj = get_object_or_404(Post, pk=post_id)
        if post_obj.author != request.user:
            return redirect('boards:qna1')

    return render(request, 'boards/boardWrite.html', {
        'is_edit': bool(post_obj),
        'data': post_obj
    })


@login_required
def board_create_api(request):
    """게시글 저장(비밀글/익명 포함) 및 이미지 업로드 API"""
    if request.method == 'POST':
        try:
            post_id = request.POST.get('post_id')
            title = request.POST.get('title', '').strip()
            body = request.POST.get('body', '').strip()
            category = request.POST.get('category', 'FREE').upper()

            # 비밀글/익명글 체크 여부 (JS에서 보낸 값 받기)
            is_secret = request.POST.get('is_secret') == 'true'
            is_anonymous = request.POST.get('is_anonymous') == 'true'

            if post_id:  # 수정 모드
                post = get_object_or_404(Post, pk=post_id, author=request.user)
                post.title = title
                post.body = body
                post.category = category
                post.is_secret = is_secret
                post.is_anonymous = is_anonymous
            else:  # 새 글 작성
                post = Post(
                    author=request.user,
                    title=title,
                    body=body,
                    category=category,
                    is_secret=is_secret,
                    is_anonymous=is_anonymous
                )

            post.save()

            # 이미지 파일 처리
            image_files = request.FILES.getlist('images')
            for img in image_files:
                PostImage.objects.create(post=post, image=img)

            return JsonResponse({'status': 'success', 'post_id': post.post_id})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'fail'}, status=400)


@login_required
def delete(request):
    post_id = request.GET.get('no')
    post = get_object_or_404(Post, pk=post_id)
    if request.user == post.author:
        category = post.category
        post.delete()
        if category == 'QNA': return redirect('boards:qna1')
    return redirect('boards:board1')


# --- [3. 댓글 및 좋아요 API] ---
@login_required
def comment_create_api(request, post_id):
    if request.method == 'POST':
        try:
            post = get_object_or_404(Post, pk=post_id)
            data = json.loads(request.body)
            comment_text = data.get('content', '').strip()
            if not comment_text: return JsonResponse({'status': 'fail'}, status=400)
            Comment.objects.create(post=post, author=request.user, body=comment_text)
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'fail', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'fail'}, status=400)


@login_required
def comment_delete_api(request, comment_id):
    if request.method == 'POST':
        comment = get_object_or_404(Comment, pk=comment_id)
        if comment.author == request.user:
            comment.delete()
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'fail'}, status=403)
    return JsonResponse({'status': 'fail'}, status=400)


@login_required
def comment_update_api(request, comment_id):
    if request.method == 'POST':
        comment = get_object_or_404(Comment, pk=comment_id)
        if comment.author != request.user: return JsonResponse({'status': 'fail'}, status=403)
        data = json.loads(request.body)
        comment.body = data.get('body', '').strip()
        comment.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'fail'}, status=400)


@login_required
def post_like_api(request, post_id):
    post = get_object_or_404(Post, pk=post_id)
    like_qs = Like.objects.filter(user=request.user, post=post)
    liked = False
    if like_qs.exists():
        like_qs.delete()
    else:
        Like.objects.create(user=request.user, post=post)
        liked = True
    return JsonResponse({'liked': liked, 'like_count': post.likes.count()})


def qna_list(request):
    # 1. URL에서 검색어('q')와 검색타입('type')을 가져옵니다.
    search_keyword = request.GET.get('q', '')
    search_type = request.GET.get('type', 'all')

    # 2. 기본적으로 모든 QnA 게시글을 가져옵니다.
    posts = Post.objects.filter(category='QNA').order_by('-created_at')

    # 3. 검색어가 있다면, 조건에 맞춰 필터링합니다.
    if search_keyword:
        if search_type == 'title':
            posts = posts.filter(title__icontains=search_keyword)
        elif search_type == 'content':
            posts = posts.filter(body__icontains=search_keyword)
        elif search_type == 'writer':
            posts = posts.filter(author__nickname__icontains=search_keyword)
        else:  # 전체 검색
            posts = posts.filter(
                Q(title__icontains=search_keyword) |
                Q(body__icontains=search_keyword) |
                Q(author__nickname__icontains=search_keyword)
            )

    return render(request, 'boards/QnA1.html', {'posts': posts})


def qna1_enhanced(request):
    """검색 기능이 강화된 QnA 목록"""
    posts_list = Post.objects.filter(category='QNA').order_by('-created_at')

    query = request.GET.get('q', '')
    search_type = request.GET.get('type', 'all')

    if query:
        if search_type == 'title':
            posts_list = posts_list.filter(title__icontains=query)
        elif search_type == 'content':
            posts_list = posts_list.filter(body__icontains=query)
        elif search_type == 'writer':
            posts_list = posts_list.filter(author__nickname__icontains=query)
        else:
            posts_list = posts_list.filter(
                Q(title__icontains=query) | Q(body__icontains=query) | Q(author__nickname__icontains=query)
            ).distinct()

    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/QnA1.html', {'posts': page_obj, 'page_obj': page_obj, 'q': query})


@login_required
def comment_write_fixed(request, post_id):
    """데이터 수신이 보완된 댓글 API"""
    if request.method == 'POST':
        post = get_object_or_404(Post, pk=post_id)
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            content = data.get('content')
        else:
            content = request.POST.get('content')

        if content and content.strip():
            Comment.objects.create(post=post, author=request.user, body=content)
            return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'fail'}, status=400)