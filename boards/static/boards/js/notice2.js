// 주소에서 ?no=1 이런 값 가져오기
const params = new URLSearchParams(window.location.search);
// 값이 없거나 숫자가 아니면 일단 0으로 처리
const no = parseInt(params.get("no")) || 0;
const currentPageNum = params.get("page") || 1;   // 원래 보던 페이지 불러오기 선언

let currentNoticeData = null; // 이전/다음글 처리를 위한 주머니

document.addEventListener("DOMContentLoaded", async function () {
    if (no === 0) {
        alert("잘못된 접근입니다.");
        // 목록으로 튕겨내기
        location.href = "/boards/noticeList/"; // 실제주소 쓸것!!!!!
        return;
    }

    try {
        // [중요] 백엔드와 상의한 공지사항 상세 API 주소
        const response = await fetch(`/boards/getNoticeDetail?no=${no}`);
        if (!response.ok) throw new Error("공지사항을 찾을 수 없습니다.");

        const data = await response.json();
        currentNoticeData = data;
        renderNotice(data);
    }
    catch (error) {
        alert(error.message);
        goList();
    }
});

// 데이터를 화면에 그리는 함수
function renderNotice(data) {
    document.getElementById("detailNo").innerText = no;
    document.getElementById("detailTitle").innerText = data.title;
    document.getElementById("detailDate").innerText = data.date;
    document.getElementById("detailContent").innerText = data.content;
    document.getElementById()
}

// 목록으로 버튼
function goList() {
    // URL에 묻어온 page 번호를 다시 꺼냅니다.
    //const params = new URLSearchParams(window.location.search);
    // 현재 보고 있는 페이지 번호가 있다면 같이 넘겨주는 것이 좋습니다.
    //const page = params.get("page") || 1;

    // 보던 페이지로 정확히 리다이렉트!
    window.location.href = `/boards/noticeList?page=${currentPageNum}`;
}
function goPrev() {
    //const page = params.get("page") || 1; // 현재 페이지 유지
    if (currentNoticeData && currentNoticeData.prev_no) {
        // notice2.html로 다시 이동하면서 번호만 바꿉니다.
        window.location.href = `/boards/getNoticeDetail?no=${currentNoticeData.prev_no}&page=${currentPageNum}`;
    }
    else {
        alert("이전 글이 없습니다.");
    }
}

function goNext() {
    //const page = params.get("page") || 1; // 현재 페이지 유지
    if (currentNoticeData && currentNoticeData.next_no) {
        window.location.href = `/boards/getNoticeDetail?no=${currentNoticeData.next_no}&page=${currentPageNum}`;
    }
    else {
        alert("다음 글이 없습니다.");
    }
}
