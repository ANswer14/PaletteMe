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
    path('getNoticeDetail/', views.get_notice_detail, name='get_notice_detail'),
    path('qnaList/', views.get_qna_list, name='get_qna_list'),
    path('qnaDetail/', views.qna2, name='qna2'),
    path('delete/', views.delete, name='delete'),

    # 데이터 저장 전용 API (JS에서 호출하는 주소)
    path('api/board/write/', views.board_create_api, name='board_create_api'),
]