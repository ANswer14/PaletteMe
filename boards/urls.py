from django.urls import path
from . import views

urlpatterns = [
    # 자유게시판
    path("", views.board_main, name="board_main"),
    path("detail/<int:no>/", views.board_detail, name="board_detail"),
    path("write/", views.board_write, name="board_write"),

    # ✅ 공지사항
    path("notice/", views.notice_main, name="notice_main"),
    path("notice/detail/<int:no>/", views.notice_detail, name="notice_detail"),
]
