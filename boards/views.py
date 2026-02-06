from django.shortcuts import render

# ======================
# 자유게시판
# ======================
def board_main(request):
    return render(request, "boards/board1.html")

def board_detail(request, no):
    return render(request, "boards/board2.html", {"no": no})

def board_write(request):
    return render(request, "boards/boardWrite.html")

# ======================
# 공지사항
# ======================
def notice_main(request):
    return render(request, "boards/notice1.html")

def notice_detail(request, no):
    return render(request, "boards/notice2.html", {"no": no})

def notice2(request):
    return render(request, "boards/notice2.html")

# ======================
# QnA (HTML 버전)
# ======================
def qna_write(request):
    return render(request, "boards/QnAWrite.html")

def qna1(request):
    return render(request, "boards/QnA1.html")

def qna2(request):
    return render(request, "boards/QnA2.html")
