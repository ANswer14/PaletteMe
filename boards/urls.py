from django.urls import path
from . import views

app_name = "boards"

urlpatterns = [
    # Post
    path("", views.post_list, name="post_list"),
    path("write/", views.post_create, name="post_create"),
    path("<int:post_id>/", views.post_detail, name="post_detail"),
    path("<int:post_id>/edit/", views.post_edit, name="post_edit"),
    path("<int:post_id>/delete/", views.post_delete, name="post_delete"),
    path("<int:post_id>/comment/", views.post_comment_create, name="post_comment_create"),
    path("<int:post_id>/like/", views.post_toggle_like, name="post_toggle_like"),

    # QnA
    path("qna/", views.qna_list, name="qna_list"),
    path("qna/write/", views.qna_create, name="qna_create"),
    path("qna/<int:qna_id>/", views.qna_detail, name="qna_detail"),
    path("qna/<int:qna_id>/edit/", views.qna_edit, name="qna_edit"),
    path("qna/<int:qna_id>/delete/", views.qna_delete, name="qna_delete"),
    path("qna/<int:qna_id>/comment/", views.qna_comment_create, name="qna_comment_create"),

    # Notice
    path("notice/", views.notice_list, name="notice_list"),
    path("notice/<int:notice_id>/", views.notice_detail, name="notice_detail"),
]
