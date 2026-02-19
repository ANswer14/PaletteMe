from django.shortcuts import render

def board1(request):
    return render(request, 'boards/board1.html')

def board2(request):
    return render(request, 'boards/board2.html')

def qna1(request):
    return render(request, 'boards/QnA1.html')

def qna2(request):
    return render(request, 'boards/QnA2.html')

def notice1(request):
    return render(request, 'boards/notice1.html')

def notice2(request):
    return render(request, 'boards/notice2.html')

def boardWrite(request):
    return render(request, 'boards/boardWrite.html')
