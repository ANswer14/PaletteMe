const params = new URLSearchParams(window.location.search);
const no = parseInt(params.get("no"));

// 게시글 데이터 (목록과 동일한 번호 사용)
const posts = {
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

// 값 넣기
document.getElementById("detailNo").innerText = no;
document.getElementById("detailTitle").innerText = posts[no].title;
document.getElementById("detailWriter").innerText = posts[no].writer;
document.getElementById("detailDate").innerText = posts[no].date;
document.getElementById("detailView").innerText = posts[no].views;
document.getElementById("detailContent").innerText = posts[no].content;


// ✅ 댓글 출력
const commentList = document.getElementById("commentList");
posts[no].comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<b>${c.writer}:</b> ${c.text}`;
    commentList.appendChild(div);
});
// 댓글등록
window.addComment = function() {
    const text = document.getElementById("commentText").value;
    if (text.trim() === "") return;

    const div = document.createElement("div");
    div.className = "comment";
    div.innerText = `<b>나:</b> ${text}`;
    commentList.appendChild(div);

    document.getElementById("commentText").value = "";
};

// 목록으로 버튼
function goList() {
    window.location.href = "QnA1.html";
}
function goPrev() {
    if (no > 1) {
        window.location.href = "QnA2.html?no=" + (parseInt(no) - 1);
    } else {
        alert("이전 글이 없습니다.");
    }
}
function goNext() {
    const maxNo = Object.keys(posts).length;

    if (no < maxNo) {
        window.location.href = "QnA2.html?no=" + (parseInt(no) + 1);
    } else {
        alert("다음 글이 없습니다.");
    }
}
