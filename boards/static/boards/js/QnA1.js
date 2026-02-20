// 꼭 변수이름 확인하기!!!!!!

function goQnADetail(postId, is_secret, postWriter) {
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get("page") || 1;
    //const currentUserNickname = "{{ user.nickname }}"; // 서버에서 넣어준 현재 유저 이름
    const currentUserNickname = USER_NICKNAME;
    const currentUserIsStaff = IS_STAFF;

    // 공개글은 누구나 통과!
    if (!is_secret || is_secret && currentUserNickname == postWriter || is_secret && currentUserIsStaff) {
        location.href = `/boards/qnaDetail?no=${postId}&page=${currentPage}`;  // 백엔드에서 설정한 실제 상세페이지 주소 넣을것!!!
        return;
    } else {
        alert("🔒 비공개 글은 작성자만 볼 수 있습니다.");
        return;
    }
}