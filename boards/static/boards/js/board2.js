const params = new URLSearchParams(window.location.search);
const no = parseInt(params.get("no")) || 0;

// 백엔드 연결시 주석해제
// let currentPostData = null; // 백엔드에서 받은 전체 데이터를 저장할 빈 주머니

// [삭제 예정] URL에서 데이터를 직접 뽑아오던 방식은 파일(사진)을 못 보냅니다.
const titleParam = params.get("title");
const contentParam = params.get("content");
const writerParam = params.get("writer");

const detailNo = document.getElementById("detailNo");
const detailTitle = document.getElementById("detailTitle");
const detailWriter = document.getElementById("detailWriter");
const detailDate = document.getElementById("detailDate");
const detailView = document.getElementById("detailView");
const detailContent = document.getElementById("detailContent");

// [삭제 예정] 임시 데이터 객체 boards는 나중에 서버 DB가 대신할 겁니다.
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
};       // 여기까지 삭제예정

document.addEventListener("DOMContentLoaded", async function () {
    if (no === 0) {
        alert("잘못된 접근입니다.");
        location.href = "board1.html";
        return;
    }

    // [백엔드 연결 시 이 주석을 푸세요]
    /*
    try {
        const response = await fetch(`/api/board/detail/${no}/`);
        const data = await response.json();
        renderDetail(data);
    } catch (error) {
        console.error("데이터 로드 실패", error);
    }
    */

    // [삭제 예정] 현재는 임시 데이터(boards) 사용
    if (typeof boards !== 'undefined' && boards[no]) {
        renderDetail(boards[no]);
    }
});

// 데이터를 화면에 그리는 함수
function renderDetail(data) {
    // 백엔드 연결시에 추가될 변수선언
    // currentPostData = data; // 전달받은 보따리를 나중을 위해 주머니에 저장!
    // const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 계산

    // 1. 기본 텍스트 정보 채우기
    document.getElementById("detailNo").innerText = no;
    document.getElementById("detailTitle").innerText = data.title;
    document.getElementById("detailWriter").innerText = data.writer;
    document.getElementById("detailDate").innerText = data.date || "2026-02-11";  // 나중에 날짜 대신 today 라고 씀
    document.getElementById("detailView").innerText = data.views || 0;
    document.getElementById("detailContentText").innerText = data.content;

    // 2. 사진 리스트 채우기
    const imageArea = document.getElementById("detailImages");
    imageArea.innerHTML = "";         // 사진이 들어갈 게시판 초기화

    if (data.images && data.images.length > 0) {     // 이미지 개수가 0보다 많은지 확인
        data.images.forEach(imgUrl => {         //  사진 주소 하나씩 꺼내는 작업
            const imgTag = document.createElement("img");   // js에서 새로운 img 태그 생성(아직 화면에 붙이진 않은 상태)
            imgTag.src = imgUrl;      // 새로 만든 img 태그에 방금 꺼낸 사진 주소 넣음
            imageArea.appendChild(imgTag);     // 완성된 사진 태그를 실제 게시판에 붙임
        });
    }

    // 3. 댓글 채우기
    const commentList = document.getElementById("commentList");
    commentList.innerHTML = "";          // 댓글 들어갈 자리 초기화
    if (data.comments && data.comments.length > 0) {       // 이 글에 댓글이 달려있는지 확인
        data.comments.forEach(comment => {              // 댓글 목록에서 댓글 꺼내는 작업(작성자, 댓글 내용)
            const div = document.createElement("div");      // 새 댓글 적을 포스트잇(div) 생성
            div.className = "comment";                  //  이 div 포스트잇에 comment라는 이름표(클래스) 붙임
            div.innerHTML = `<b>${comment.writer}:</b> ${comment.text}`;    // 글쓴이:내용 형식으로 댓글 작성
            commentList.appendChild(div);               // 댓글 게시판에 다쓴 포스트잇을 순서대로 붙임
        });
    }
    else {
        commentList.innerHTML = "<div class='comment'>아직 댓글이 없습니다.</div>";
    }
    // [백엔드 연결 시 주석 해제!!!!!]
    // 작성자 본인일 경우에만 수정/삭제 버튼을 보여주는 로직입니다.
    /*
    if (data.is_author === true) {
        document.getElementById("editBtn").style.display = "inline-block";
        document.getElementById("deleteBtn").style.display = "inline-block";
    }
    */
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

// 작성자가 쓴 글이면 수정, 삭제 가능한 버튼
// 수정
function goEdit() {
    // no는 URL에서 가져온 현재 글 번호입니다.(백엔드와 이름 확인!!!!)
    // mode=edit을 붙여서 '수정 모드'임을 알립니다.
    location.href = `boardWrite.html?no=${no}&mode=edit`;
}

// 삭제
async function goDelete() {
    if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
        try {
            // [확인 필요!!!!!] 백엔드의 삭제 API 주소를 나중에 넣어야 함
            const response = await fetch(`/api/board/delete/${no}/`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("삭제되었습니다.");
                location.href = "board1.html"; // 삭제 후 목록으로
            }
            else {
                alert("삭제 권한이 없거나 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("에러 발생:", error);
            alert("네트워크 문제로 삭제하지 못했습니다.");
        }
    }
}

// 목록으로 버튼
function goList() {
    // 백엔드 연결시 삭제
    window.location.href = "board1.html";
    // 백엔드 연결시 주석 해제(실제 사용)
    /* const page = params.get("page") || 1;    // 주소창에 'page' 정보가 있다면 그 페이지로, 없으면 그냥 목록으로!
    window.location.href = `board1.html?page=${page}`; */   // get("page")안의 page, ${page} 안의 page 이름 백엔드와 의논필요
}

// [삭제 예정]
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

// 백엔드 연결시 바뀔 예정
/*
function goPrev() {
    // data 보따리에 들어있는 '이전 글 번호'가 있는지 확인
    if (currentPostData && currentPostData.prev_no) {       //currentPostData.prev_no의 prev_no 이름 백엔드와 의논필요
        window.location.href = "board2.html?no=" + currentPostData.prev_no;
    } else {
        alert("이전 글이 없습니다.");
    }
}

function goNext() {
    // data 보따리에 들어있는 '다음 글 번호'가 있는지 확인
    if (currentPostData && currentPostData.next_no) {       //currentPostData.next_no의 next_no 이름 백엔드와 의논필요
        window.location.href = "board2.html?no=" + currentPostData.next_no;
    } else {
        alert("다음 글이 없습니다.");
    }
}
*/