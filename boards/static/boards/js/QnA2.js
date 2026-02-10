const params = new URLSearchParams(window.location.search);
const no = parseInt(params.get("no")) || 0;

const titleParam = params.get("title");
const contentParam = params.get("content");
const writerParam = params.get("writer");

const detailNo = document.getElementById("detailNo");
const detailTitle = document.getElementById("detailTitle");
const detailWriter = document.getElementById("detailWriter");
const detailDate = document.getElementById("detailDate");
const detailView = document.getElementById("detailView");
const detailContent = document.getElementById("detailContent");

// 임시데이터, 나중에 DB 연동
const qnaPosts = {
    1: {
        title: "첫 번째 질문입니다",
        writer: "익명",
        date: "2026-02-02",
        views: 12,
        content: "회원가입 되나요?",
         comments: [
            {writer: "관리자", text: "가능합니다!"},
        ]
    },
    2: {
        title: "질문있어요",
        writer: "홍길동",
        date: "2026-02-02",
        views: 8,
        content: "자가진단 다시 할 수 있나요",
         comments: [
            {writer: "관리자", text: "가능합니다!"}
        ]
    },
    3: {
        title: "이런거 질문해도 되나요?",
        writer: "민수",
        date: "2026-02-02",
        views: 33,
        content: "유료결제 페이지는 있나요?",
        comments: []
    }
};

// 새 글 등록 직후면 그걸 먼저 보여줌
if (titleParam) {
    detailNo.innerText = "New"; // 혹은 no 변수 사용
    detailTitle.innerText = titleParam;
    detailWriter.innerText = writerParam || "익명";
    detailDate.innerText = "방금 전";
    detailView.innerText = "0";
    detailContent.innerText = contentParam;

    // 새 글은 댓글이 없으므로 안내 문구 출력
    document.getElementById("commentList").innerHTML = "<div class='comment'>아직 댓글이 없습니다.</div>";
}

// 그게 아니면 데이터 리스트에서 존재 여부 확인
else if (qnaPosts[no]) {
    document.getElementById("detailNo").innerText = no;
    document.getElementById("detailTitle").innerText = qnaPosts[no].title;
    document.getElementById("detailWriter").innerText = qnaPosts[no].writer;
    document.getElementById("detailDate").innerText = qnaPosts[no].date;
    document.getElementById("detailView").innerText = qnaPosts[no].views;
    document.getElementById("detailContent").innerText = qnaPosts[no].content;

    // ✅ 댓글 출력
    const commentList = document.getElementById("commentList"); //댓글 붙일 게시판
    qnaPosts[no].comments.forEach(comment => { // 댓글메모지 한장씩 꺼내기
        // 포스트잇을 뜯기 전에 "누가 썼는지" 미리 확인 (가장 추천)
        console.log(comment.writer);

        const div = document.createElement("div"); // 댓글 적을 새 포스트잇 한장

        div.className = "comment"; // "댓글용"이라는 라벨붙여서 테두리 디자인
        div.innerHTML = `<b>${comment.writer}:</b> ${comment.text}`; // "글쓴이/내용" 적기
        commentList.appendChild(div); // 다쓴 포스트잇 게시판에 붙이기
    });
}
else {
    // 데이터가 없는 번호로 들어왔을 때 알림 후 목록으로 이동(예외처리)
    alert("존재하지 않는 게시글입니다.");
    location.href = "QnA1.html";
}

// 댓글등록
function addComment() {
    const commentInput = document.getElementById("commentText");
    const text = commentInput.value;

    if (text.trim() === "") return;

    const commentList = document.getElementById("commentList");
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<b>나:</b> ${text}`;
    commentList.appendChild(div);

    commentInput.value = "";  //입력창 비우기
}

// 목록으로 버튼
function goList() {
    window.location.href = "QnA1.html";
}
function goPrev() {
    if (qnaPosts[no - 1]) {
        window.location.href = "QnA2.html?no=" + (no - 1);
    } else {
        alert("이전 글이 없습니다.");
    }
}
function goNext() {
    if (qnaPosts[no + 1]) {
        window.location.href = "QnA2.html?no=" + (no + 1);
    } else {
        alert("다음 글이 없습니다.");
    }
}
