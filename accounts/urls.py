# account/urls.py
from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("agreement/", views.agreement_view, name="agreement"),
    path("profile/", views.profile_view, name="profile"),
]
