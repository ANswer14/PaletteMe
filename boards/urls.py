from django.urls import path
from . import views
app_name = 'boards'

urlpatterns = [
    path('boardList', views.board1, name='board1'),
    path('boardDetail', views.board2, name='board2'),
    path('boardWrite/', views.boardWrite, name='boardWrite'),
    path('noticeList/', views.notice1, name='notice1'),
    path('noticeDetail/', views.notice2, name='notice2'),
    path('getNoticeDetail/', views.get_notice_detail, name='get_notice_detail'),
    path('qnaList/', views.qna1, name='qna1'),
    path('qnaDetail/', views.qna2, name='qna2'),
]