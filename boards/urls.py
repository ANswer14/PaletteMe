from django.urls import path
from . import views

app_name = 'boards'

urlpatterns = [
    path('boardList/', views.board1, name='board1'),
    path('boardDetail/', views.board2, name='board2'),
    path('boardWrite/', views.boardWrite, name='boardWrite'), # 게시글 작성/수정 페이지
    path('noticeList/', views.notice1, name='notice1'),
    path('noticeDetail/', views.notice2, name='notice2'),
    path('qnaList/', views.qna1, name='qna1'),
    path('qnaDetail/', views.qna2, name='qna2'),
    path('delete/', views.delete, name='delete'), # 게시글 삭제 로직

    # API 주소
    path('api/board/write/', views.board_create_api, name='board_create_api'),
    path('api/board/like/<int:post_id>/', views.post_like_api, name='post_like_api'),
    path('api/comment/create/<int:post_id>/', views.comment_create_api, name='comment_create_api'),
    path('api/comment/delete/<int:comment_id>/', views.comment_delete_api, name='comment_delete_api'),
    path('api/comment/update/<int:comment_id>/', views.comment_update_api, name='comment_update_api'),
]