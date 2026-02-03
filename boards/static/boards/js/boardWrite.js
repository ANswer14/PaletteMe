function submitPost() {
    const title = document.getElementById("postTitle").value.trim();
    const writer = document.getElementById("postWriter").value;
    const content = document.getElementById("postContent").value.trim();

    if (!title || !writer || !content) {
        alert("모든 항목을 입력해주세요.");
        return;
    }

    // 임시: 새 글 번호를 기존 게시글 수 + 1로 설정
    const newNo = 4; // 실제 데이터베이스/배열 연동 시 변경 필요

    // 상세페이지로 이동
    window.location.href = `board2.html?no=${newNo}&title=${encodeURIComponent(title)}&writer=${encodeURIComponent(writer)}&content=${encodeURIComponent(content)}`;
}

function cancelPost() {
    window.location.href = "board1.html"; // 글쓰기 취소하면 목록으로
}
