// 꼭 변수이름 확인하기!!!!!!

function goQnADetail(postId, is_secret, postWriter) {
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get("page") || 1;
    //const currentUserNickname = "{{ user.nickname }}"; // 서버에서 넣어준 현재 유저 이름
    const currentUserNickname = USER_NICKNAME;

    // 공개글은 누구나 통과!
    if (!is_secret) {
        location.href = `/boards/qnaDetail?no=${postId}&page=${currentPage}`;  // 백엔드에서 설정한 실제 상세페이지 주소 넣을것!!!
        return;
    }

    // 비공개글인데, 내가 작성자가 아니라면? (이건 프론트엔드에서의 1차 필터링)
    // ※ 실제 보안은 상세페이지 접속 시 서버에서 다시 체크합니다.
    if (is_secret && currentUserNickname !== postWriter) {
        alert("🔒 비공개 글은 작성자만 볼 수 있습니다.");
        return;
    }

    location.href = `/boards/qnaList?no=${postId}&page=${currentPage}`;  // 백엔드에서 설정한 실제 상세페이지 주소 넣을것!!!
}