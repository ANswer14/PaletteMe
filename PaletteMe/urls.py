from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

urlpatterns = [
    path('personalColors/', include('personalColors.urls'), name='personalColors'),
    path("admin/", admin.site.urls), # 장고 관리자 화면으로 이동
    # path("signup/", include('account.urls'), name='account'),
    path('', include('core.urls'), name='core'), # 메인페이지로 이동
    path('accounts/', include('accounts.urls')),  # accounts 경로 보이면 accounts앱의 urls.py로 이동
    path("boards/", include("boards.urls"), name='boards'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # 미디어 경로 지정