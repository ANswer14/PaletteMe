const params = new URLSearchParams(window.location.search);
const no = parseInt(params.get("no")) || 0;

// 임시데이터, 나중에 DB 연동
const boards = {
    1: {
        title: "첫 번째 글입니다",
        writer: "김주연",
        date: "2026-02-02",
        views: 12,
        content: "자유게시판 첫 글입니다. 반갑습니다 :)",
         comments: [
            {writer: "민수", text: "환영합니다!"},
            {writer: "홍길동", text: "첫 글 축하드려요!"}
        ]
    },
    2: {
        title: "오늘 코디 추천 너무 좋아요",
        writer: "홍길동",
        date: "2026-02-02",
        views: 8,
        content: "오늘 추천받은 코디 그대로 입고 나갔는데 칭찬 많이 받았어요.",
         comments: [
            {writer: "민수", text: "저도 써봐야겠어요!"}
        ]
    },
    3: {
        title: "퍼스널컬러 후기 공유합니다",
        writer: "민수",
        date: "2026-02-02",
        views: 33,
        content: "퍼스널컬러 진단 받고 옷장 정리했습니다. 삶의 질 상승!!",
        comments: [
            {writer: "홍길동", text: "오 저도 해보고 싶네요!"},
            {writer: "김주연", text: "정리 꿀팁 좀 알려주세요"}
            ]
    }
};

// 화면에 넣기 전 데이터 존재 여부 확인
if (boards[no]) {
    document.getElementById("detailNo").innerText = no;
    document.getElementById("detailTitle").innerText = boards[no].title;
    document.getElementById("detailWriter").innerText = boards[no].writer;
    document.getElementById("detailDate").innerText = boards[no].date;
    document.getElementById("detailView").innerText = boards[no].views;
    document.getElementById("detailContent").innerText = boards[no].content;

    // ✅ 댓글 출력
    const commentList = document.getElementById("commentList"); //댓글 붙일 게시판
    boards[no].comments.forEach(comment => { // 댓글메모지 한장씩 꺼내기
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
    location.href = "board1.html";
}

// 좋아요 버튼(토글 방식)
document.addEventListener("DOMContentLoaded", function () {
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = document.getElementById("likeCount");

    // 처음 좋아요 안눌린 상태
    let count = 0;
    let liked = false;

    // 버튼 클릭
    likeBtn.addEventListener("click", function () {
        if (!liked) {
            count++;
            liked = true;
            likeBtn.classList.add("liked");
        }
        else {
            count--;
            liked = false;
            likeBtn.classList.remove("liked");
        }
        likeCount.textContent = count;
    });
});

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
    window.location.href = "board1.html";
}

function goPrev() {
    if (boards[no - 1]) {
        window.location.href = "board2.html?no=" + (no - 1);
    }
    else {
        alert("이전 글이 없습니다.");
    }
}
function goNext() {
    if (boards[no + 1]) {
        window.location.href = "board2.html?no=" + (no + 1);
    }
    else {
        alert("다음 글이 없습니다.");
    }
}
