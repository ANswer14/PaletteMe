from django.urls import path
from . import views

app_name = "boards"

urlpatterns = [
    # 자유게시판
    path("", views.board_main, name="board_main"),
    path("detail/<int:no>/", views.board_detail, name="board_detail"),
    path("write/", views.board_write, name="board_write"),

    # 공지사항
    path("notice/", views.notice_main, name="notice_main"),
    path("notice/detail/<int:no>/", views.notice_detail, name="notice_detail"),
    path("notice/2/", views.notice2, name="notice2"),

    # QnA ✅ (정석 URL로 통일)
    path("qna/", views.qna_main, name="qna_main"),
    path("qna/write/", views.qna_write, name="qna_write"),
    path("qna/<int:no>/", views.qna_detail, name="qna_detail"),
]
