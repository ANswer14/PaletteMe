from django.shortcuts import render

def board_main(request):
    return render(request, "boards/board1.html")

def board_detail(request, no):
    return render(request, "boards/board2.html", {"no": no})

def board_write(request):
    return render(request, "boards/boardWrite.html")


# ✅ 공지 목록
def notice_main(request):
    return render(request, "boards/notice1.html")


# ✅ 공지 상세 (notice2.html로 렌더링)
def notice_detail(request, no):
    return render(request, "boards/notice2.html", {"no": no})
