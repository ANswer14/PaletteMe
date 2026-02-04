// const params = new URLSearchParams(window.location.search);
// const no = parseInt(params.get("no"));
//
// // 게시글 데이터 (목록과 동일한 번호 사용)
// const posts = {
//     1: {
//         title: "첫 번째 글입니다",
//         writer: "김주연",
//         date: "2026-02-02",
//         views: 12,
//         content: "자유게시판 첫 글입니다. 반갑습니다 :)",
//          comments: [
//             {writer: "민수", text: "환영합니다!"},
//             {writer: "홍길동", text: "첫 글 축하드려요!"}
//         ]
//     },
//     2: {
//         title: "오늘 코디 추천 너무 좋아요",
//         writer: "홍길동",
//         date: "2026-02-02",
//         views: 8,
//         content: "오늘 추천받은 코디 그대로 입고 나갔는데 칭찬 많이 받았어요.",
//          comments: [
//             {writer: "민수", text: "저도 써봐야겠어요!"}
//         ]
//     },
//     3: {
//         title: "퍼스널컬러 후기 공유합니다",
//         writer: "민수",
//         date: "2026-02-02",
//         views: 33,
//         content: "퍼스널컬러 진단 받고 옷장 정리했습니다. 삶의 질 상승!!",
//         comments: [
//             {writer: "홍길동", text: "오 저도 해보고 싶네요!"},
//             {writer: "김주연", text: "정리 꿀팁 좀 알려주세요"}
//             ]
//     }
// };
//
// // 값 넣기
// document.getElementById("detailNo").innerText = no;
// document.getElementById("detailTitle").innerText = posts[no].title;
// document.getElementById("detailWriter").innerText = posts[no].writer;
// document.getElementById("detailDate").innerText = posts[no].date;
// document.getElementById("detailView").innerText = posts[no].views;
// document.getElementById("detailContent").innerText = posts[no].content;
//
//
// // ✅ 댓글 출력
// const commentList = document.getElementById("commentList");
// posts[no].comments.forEach(c => {
//     const div = document.createElement("div");
//     div.className = "comment";
//     div.innerHTML = `<b>${c.writer}:</b> ${c.text}`;
//     commentList.appendChild(div);
// });
// // 댓글등록
// window.addComment = function() {
//     const text = document.getElementById("commentText").value;
//     if (text.trim() === "") return;
//
//     const div = document.createElement("div");
//     div.className = "comment";
//     div.innerText = `<b>나:</b> ${text}`;
//     commentList.appendChild(div);
//
//     document.getElementById("commentText").value = "";
// };
//
// // 목록으로 버튼
// function goList() {
//     window.location.href = "board1.html";
// }
// function goPrev() {
//     if (no > 1) {
//         window.location.href = "board2.html?no=" + (parseInt(no) - 1);
//     } else {
//         alert("이전 글이 없습니다.");
//     }
// }
// function goNext() {
//     const maxNo = Object.keys(posts).length;
//
//     if (no < maxNo) {
//         window.location.href = "board2.html?no=" + (parseInt(no) + 1);
//     } else {
//         alert("다음 글이 없습니다.");
//     }
// }
