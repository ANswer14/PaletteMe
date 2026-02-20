from django.shortcuts import render

from boards.models import Post


# Create your views here.

def index(request):
    recent_notices = Post.objects.filter(category='NOTICE').order_by('-created_at')[:3]
    return render(request, 'main.html', {'recent_notices': recent_notices})