function goQnADetail(postId, is_private, postWriter) {
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get("page") || 1;
    const currentUserNickname = typeof USER_NICKNAME !== 'undefined' ? USER_NICKNAME : "";

    // 비공개글인데 작성자가 아니라면 차단
    if (is_private && currentUserNickname !== postWriter) {
        alert("🔒 비공개 글은 작성자만 볼 수 있습니다.");
        return;
    }

    // 파일명이 아닌 장고의 상세페이지 URL 주소로 이동 (매우 중요)
    location.href = `/boards/qnaDetail/?no=${postId}&page=${currentPage}`;
}