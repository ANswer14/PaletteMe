from django.db.models.aggregates import Count
from django.shortcuts import render
from boards.models import Post


# Create your views here.

def index(request):
    recent_notices = Post.objects.filter(category='NOTICE').order_by('-created_at')[:3]
    recent_free_posts = Post.objects.filter(category='FREE').order_by('-created_at')[:3]
    hot_free_posts = Post.objects.filter(category='FREE').annotate(
        like_count=Count("likes")
    ).order_by("-like_count", "-created_at")[:3]
    return render(request, 'main.html', {'recent_notices': recent_notices, 'recent_free_posts': recent_free_posts, 'hot_free_posts': hot_free_posts})