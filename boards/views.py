from django.http import JsonResponse
from django.shortcuts import render
from django.core.paginator import Paginator
from .models import Post

def board1(request):
    return render(request, 'boards/board1.html')

def board2(request):
    return render(request, 'boards/board2.html')

def qna1(request):
    return render(request, 'boards/QnA1.html')

def qna2(request):
    return render(request, 'boards/QnA2.html')

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
    post = Post.objects.get(post_id=request.GET.get('no'))
    data = {
        'no': post.post_id,
        'title': post.title,
        'content': post.body,
        'date': post.created_at,
    }
    return JsonResponse(data, safe=False)

def boardWrite(request):
    return render(request, 'boards/boardWrite.html')
