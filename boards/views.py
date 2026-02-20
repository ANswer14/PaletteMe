from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.db.models import Q
from .models import Post, PostImage, Comment

# --- [목록 페이지] ---
def board1(request):
    posts_list = Post.objects.filter(category='FREE').order_by('-created_at')
    hot_posts = Post.objects.filter(category='FREE').order_by('-view_count')[:3]
    kw = request.GET.get('kw', '')
    if kw:
        posts_list = posts_list.filter(Q(title__icontains=kw) | Q(body__icontains=kw)).distinct()
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/board1.html', {'posts': page_obj, 'page_obj': page_obj, 'hot_posts': hot_posts, 'kw': kw})

def qna1(request):
    posts_list = Post.objects.filter(category='QNA').order_by('-created_at')
    kw = request.GET.get('kw', '')
    if kw:
        posts_list = posts_list.filter(Q(title__icontains=kw) | Q(body__icontains=kw)).distinct()
    paginator = Paginator(posts_list, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'boards/QnA1.html', {'posts': page_obj, 'page_obj': page_obj, 'kw': kw})

# --- [상세 페이지 공통 로직] ---
def board_detail_common(request, template_name):
    post_id = request.GET.get('no')
    post = get_object_or_404(Post, pk=post_id)

    if request.method == "POST":
        comment_content = request.POST.get('content')
        if comment_content and request.user.is_authenticated:
            Comment.objects.create(
                post=post,
                author=request.user,
                body=comment_content
            )
            return redirect(f"{request.path}?no={post_id}")

    post.view_count += 1
    post.save()

    return render(request, template_name, {
        'post': post,
        'images': post.images.all(),
        'comments': post.comments.all().order_by('-created_at')
    })

def board2(request):
    return board_detail_common(request, 'boards/board2.html')

def qna2(request):
    return board_detail_common(request, 'boards/QnA2.html')

def notice1(request):
    posts_list = Post.objects.filter(category='NOTICE').order_by('-created_at')
    page_obj = Paginator(posts_list, 10).get_page(request.GET.get('page'))
    return render(request, 'boards/notice1.html', {'posts': page_obj, 'page_obj': page_obj})

def notice2(request):
    post = get_object_or_404(Post, pk=request.GET.get('no'))
    return render(request, 'boards/notice2.html', {'post': post})

def boardWrite(request):
    return render(request, 'boards/boardWrite.html')

def board_create_api(request):
    if request.method == 'POST':
        try:
            post = Post.objects.create(
                author=request.user,
                title=request.POST.get('title'),
                body=request.POST.get('content'),
                category=request.POST.get('category', 'FREE').upper(),
                is_secret=request.POST.get('is_private') == 'true',
                is_anonymous=request.POST.get('is_anonymous') == 'true'
            )
            return JsonResponse({'status': 'success', 'post_id': post.post_id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=405)