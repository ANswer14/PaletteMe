# account/urls.py
from django.urls import path
from . import views
from allauth.account.views import SignupView, LoginView, LogoutView


urlpatterns = [
    path("agreement/", views.agreement_view, name="agreement"),
    path("profile/", views.profile_view, name="profile"),
    path('signup/', SignupView.as_view(template_name="accounts/signup.html"), name='account_signup'),
    path('login/', LoginView.as_view(template_name="accounts/login.html"), name='account_login'),
    path('logout/', LogoutView.as_view(), name='account_logout'),
]
