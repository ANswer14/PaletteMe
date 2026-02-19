from django.urls import path
from . import views

app_name = 'boards'

urlpatterns = [
    # 목록 및 상세 페이지
    path('boardList/', views.board1, name='board1'),
    path('boardDetail/', views.board2, name='board2'),
    path('boardWrite/', views.boardWrite, name='boardWrite'),
    path('noticeList/', views.notice1, name='notice1'),
    path('noticeDetail/', views.notice2, name='notice2'),
    path('qnaList/', views.qna1, name='qna1'),
    path('qnaDetail/', views.qna2, name='qna2'),

    # 데이터 저장 전용 API (JS에서 호출하는 주소)
    path('api/board/write/', views.board_create_api, name='board_create_api'),
]