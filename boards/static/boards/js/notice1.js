function goNoticeDetail(no) {
    // 현재 목록이 몇 페이지인지 정보를 URL에서 가져옵니다.
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get("page") || 1;

    // 상세 페이지로 이동할 때 no와 page를 둘 다 넘깁니다.
    window.location.href = `notice2.html?no=${no}&page=${currentPage}`;   // 백엔드에서 설정한 실제 상세페이지 주소 넣을것!!!
}
