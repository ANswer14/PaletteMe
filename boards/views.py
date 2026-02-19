from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
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
    # 1. 카테고리 필터링 (SQL의 WHERE category = '공지사항')
    # 예: URL이 /notice/?category=it 일 경우 해당 값 가져오기

    # 필터링된 쿼리셋 (lazy loading이라 아직 DB 호출 안 함)
    posts_list = Post.objects.filter(category='Notice').order_by('-created_at')

    # 2. 페이징 설정 (한 페이지에 10개씩)
    paginator = Paginator(posts_list, 10)

    # 3. 현재 페이지 번호 가져오기
    page_number = request.GET.get('page')

    # 4. 해당 페이지의 데이터 가져오기 (에러 처리 포함된 get_page 권장)
    page_obj = paginator.get_page(page_number)

    # 5. 템플릿으로 전달
    return render(request, 'boards/notice1.html', {
        'page_obj': page_obj,  # 페이지 제어용 (이전/다음 버튼)
        'posts': page_obj.object_list,  # 실제 게시물 목록
    })

def notice2(request):
    # print(request.GET.get('no'))
    # post = Post.objects.filter(category = 'Notice', post_id = request.GET.get('no'))
    return render(request, 'boards/notice2.html')

def get_notice_detail(request):
    try:
        post = Post.objects.get(post_id=request.GET.get('no'))
        data = {
            'title': post.title,
            'content': post.body,
            'category': post.category,
            'created_at': post.created_at.strftime('%Y-%m-%d'),
            'is_secret': post.is_secret,
            'is_anonymous': post.is_anonymous,
            'view_count': post.view_count,
            'thumbs_up_count': post.thumbs_up_count,
            'author': post.author.nickname,
            'post_id': post.post_id,
        }
    except:
        data = None
    return JsonResponse(data=data, safe=False)

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