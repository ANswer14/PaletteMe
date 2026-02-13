
function goBoardDetail(postId) {
    // 장고가 뿌려준 진짜 ID를 받아 상세 페이지로 이동합니다.
    // 자유게시판 상세는 board2.html, QnA 상세는 QnA2.html로 보내는 로직
    const isQnA = window.location.pathname.includes('QnA1');
    const targetPage = isQnA ? 'QnA2.html' : 'board2.html';

    window.location.href = `${targetPage}?no=${postId}`;
}
