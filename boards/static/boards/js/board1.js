
function goBoardDetail(postId) {
    // 장고가 뿌려준 진짜 ID를 받아 상세 페이지로 이동합니다.
    // 자유게시판 상세는 board2.html, QnA 상세는 QnA2.html로 보내는 로직
    const isQnA = window.location.pathname.includes('QnA1');
    const targetPage = isQnA ? 'QnA2.html' : 'board2.html';

    // 현재 목록의 주소창에서 'page' 번호를 읽어옵니다. (없으면 1페이지로 간주)
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get("page") || 1;

    window.location.href = `${targetPage}?no=${postId}&page=${currentPage}`;   // 백엔드에서 설정한 실제 상세페이지 주소 넣을것!!!
}
