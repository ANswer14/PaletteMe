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
    # 1. 카테고리 필터링 (SQL의 WHERE category = '공지사항')
    # 예: URL이 /notice/?category=it 일 경우 해당 값 가져오기

    # 필터링된 쿼리셋 (lazy loading이라 아직 DB 호출 안 함)
    posts_list = Post.objects.filter(category='NOTICE').order_by('-created_at')

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
        all_ids = list(Post.objects.values_list('post_id', flat=True).order_by('post_id'))
        image_list = [
            {'id': img.post_img_id, 'url': img.image.url}
            for img in post.images.all()
        ]
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
            'images': image_list,
            'numbers': all_ids,
        }
    except:
        data = None
    return JsonResponse(data=data, safe=False)

def boardWrite(request):
    is_edit = False
    if request.method == 'POST':
        post_id = request.POST.get('post_id')
        post = get_object_or_404(Post, post_id=post_id)
        data = {
            'no': post.post_id,
            'title': post.title,
            'body': post.body,
            'category': post.category,
            'is_secret': post.is_secret,
            'is_anonymous': post.is_anonymous,
            'images': post.images.all(),
        }
        is_edit = True
        return render(request, 'boards/boardWrite.html', {'data': data, 'is_edit': is_edit})
    else:
        return render(request, 'boards/boardWrite.html', {'is_edit': is_edit})

def board_create_api(request):
    if request.method == 'POST':
        try:
            # 1. JS FormData에서 보낸 값들 추출
            title = request.POST.get('title')
            content = request.POST.get('content')
            category = request.POST.get('category').upper()  # 'free' -> 'FREE'
            is_secret = request.POST.get('is_private') == 'true'
            is_anonymous = request.POST.get('is_anonymous') == 'true'
            del_images = request.POST.getlist('delImages')
            is_edit = request.POST.get('is_edit') == 'True'
            images = request.FILES.getlist('images')
            post_id = request.POST.get('post_id')

            print('is_edit 값:', is_edit)
            print('is_edit 값:', request.POST.get('is_edit'))


            if is_edit:
                post = Post.objects.get(post_id=post_id)
                post.title = title
                post.body = content
                post.category = category
                post.is_secret = is_secret
                post.is_anonymous = is_anonymous
                post.save()
                for del_img in del_images:
                    print(del_img)
                    PostImage.objects.filter(post_img_id=int(del_img)).delete()
            else:
                post = Post.objects.create(
                    author=request.user,
                    title=title,
                    body=content,
                    category=category,
                    is_secret=is_secret,
                    is_anonymous=is_anonymous
                )
            for img in images:
                PostImage.objects.create(post=post, image=img)

            return JsonResponse({'status': 'success', 'post_id': post.post_id})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=405)

def delete(request):
    if request.method == 'POST':
        post = get_object_or_404(Post, post_id=request.POST.get('post_id'))
        post.delete()
        return redirect('/boards/boardList/')