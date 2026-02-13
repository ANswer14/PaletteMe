const params = new URLSearchParams(window.location.search);
const no = params.get("no") || 0;     // URL에서 글 번호 가져오기

const titleParam = params.get("title");
const contentParam = params.get("content");
const writerParam = params.get("writer");

// HTML 요소 미리 찾아두기
const detailNo = document.getElementById("detailNo");
const detailTitle = document.getElementById("detailTitle");
const detailDate = document.getElementById("detailDate");
const detailView = document.getElementById("detailView");
//const detailContent = document.getElementById("detailContent");
const commentList = document.getElementById("commentList");

let currentPostData = null; // 데이터를 담아둘 주머니

// 백엔드 데이터 로드함수
document.addEventListener("DOMContentLoaded", async function () {
    // 글 번호가 없으면 목록으로 튕겨내기
    if (no === 0) {
        alert("잘못된 접근입니다.");
        location.href = "board1.html";
        return;
    }

    // 서버에서 데이터 가져오기
    try {
        const response = await fetch(`/api/qna/detail/${no}/`);
        if (!response.ok) throw new Error("게시글을 찾을 수 없습니다.");
        const data = await response.json();

        currentPostData = data; // 주머니에 저장
        renderDetail(data); // 데이터를 화면에 그리는 함수 호출
    }
    catch (error) {
        alert(error.message);
        goList();
    }
});

// 화면에 데이터를 그려주는 로직 (기존 코드의 로직을 함수화함)
function renderDetail(data) {
    //detailNo.innerText = postData.id || no;
    //detailTitle.innerText = postData.title;
    //detailDate.innerText = postData.date || postData.created_at;
    //detailView.innerText = postData.views;
    //detailContent.innerText = postData.content;

    // 변수 선언 대신 ID 직접 찾아서 바로 대입
    document.getElementById("detailNo").innerText = data.id || no;
    document.getElementById("detailTitle").innerText = data.title;
    document.getElementById("detailDate").innerText = data.created_at || data.date;
    document.getElementById("detailView").innerText = data.views;
    document.getElementById("detailContent").innerText = data.content;

    // 답변(댓글) 출력
    commentList.innerHTML = ""; // 기존 내용 비우기
    if (data.comments && data.comments.length > 0) {
        data.comments.forEach(comment => {
            const div = document.createElement("div");
            div.className = "comment";
            div.innerHTML = `<b>${comment.writer}:</b> ${comment.text}`;
            commentList.appendChild(div);
        });
    } else {
        commentList.innerHTML = "<div class='comment'>운영자가 확인 후 답변을 등록할 예정입니다.</div>";
    }
}

// 목록으로 버튼
function goList() {
    const page = params.get("page") || 1;
    window.location.href = `QnA1.html?page=${page}`;
}
function goPrev() {
    if (currentPostData && currentPostData.prev_no) {
        window.location.href = "QnA2.html?no=" + currentPostData.prev_no;
    } else {
        alert("이전 글이 없습니다.");
    }
}
function goNext() {
    if (currentPostData && currentPostData.next_no) {
        window.location.href = "QnA2.html?no=" + currentPostData.next_no;
    } else {
        alert("다음 글이 없습니다.");
    }
}
