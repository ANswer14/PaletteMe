from django.shortcuts import render
from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Post, PostImage  # 사용할 모델들


# --- [페이지 이동 함수들] ---

def board1(request):
    """자유게시판 목록 페이지"""
    # 1. 자유게시판(FREE) 글만 최신순으로 가져오기
    posts_list = Post.objects.filter(category='FREE').order_by('-created_at')
    # 2. 페이징 (한 페이지당 10개)
    paginator = Paginator(posts_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, 'boards/board1.html', {'posts': page_obj.object_list, 'page_obj': page_obj})


def qna1(request):
    """QnA 게시판 목록 페이지"""
    # 1. QnA 글만 최신순으로 가져오기
    posts_list = Post.objects.filter(category='QNA').order_by('-created_at')
    # 2. 페이징
    paginator = Paginator(posts_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, 'boards/QnA1.html', {'posts': page_obj, 'page_obj': page_obj})


def notice1(request):
    """공지사항 목록 페이지"""
    posts_list = Post.objects.filter(category='Notice').order_by('-created_at')
    paginator = Paginator(posts_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, 'boards/notice1.html', {'page_obj': page_obj, 'posts': page_obj})


def boardWrite(request):
    """글쓰기 페이지 로드"""
    return render(request, 'boards/boardWrite.html')


# 상세 페이지 함수들 (필요시 로직 추가)
def board2(request): return render(request, 'boards/board2.html')


def qna2(request): return render(request, 'boards/QnA2.html')


def notice2(request): return render(request, 'boards/notice2.html')


# --- [실제 DB 저장 API 함수] ---

def board_create_api(request):
    """JS에서 보낸 데이터를 받아 실제로 DB에 저장하는 함수"""
    if request.method == 'POST':
        try:
            # 1. JS FormData에서 보낸 값들 추출
            title = request.POST.get('title')
            content = request.POST.get('content')
            category = request.POST.get('category').upper()  # 'free' -> 'FREE'
            is_secret = request.POST.get('is_private') == 'true'
            is_anonymous = request.POST.get('is_anonymous') == 'true'

            # 2. Post 모델 객체 생성 (DB 저장)
            # request.user가 로그인된 상태여야 합니다.
            post = Post.objects.create(
                author=request.user,
                title=title,
                body=content,
                category=category,
                is_secret=is_secret,
                is_anonymous=is_anonymous
            )

            # 3. 이미지 파일들이 있다면 PostImage에 저장
            images = request.FILES.getlist('images')
            for img in images:
                PostImage.objects.create(post=post, image=img)

            return JsonResponse({'status': 'success', 'post_id': post.post_id})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=405)