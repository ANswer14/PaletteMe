document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const no = parseInt(params.get("no"));

    const posts = {
        1: {
            title: "첫 번째 질문입니다",
            writer: "익명",
            date: "2026-02-02",
            views: 12,
            content: "회원가입 되나요?",
            comments: [{ writer: "관리자", text: "가능합니다!" }]
        },
        2: {
            title: "질문있어요",
            writer: "홍길동",
            date: "2026-02-02",
            views: 8,
            content: "자가진단 다시 할 수 있나요",
            comments: [{ writer: "관리자", text: "가능합니다!" }]
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

    if (!posts[no]) {
        alert("존재하지 않는 글입니다.");
        window.location.href = "QnA1.html";
        return;
    }

    const post = posts[no];

    document.getElementById("detailNo").innerText = no;
    document.getElementById("detailTitle").innerText = post.title;
    document.getElementById("detailWriter").innerText = post.writer;
    document.getElementById("detailDate").innerText = post.date;
    document.getElementById("detailView").innerText = post.views;
    document.getElementById("detailContent").innerText = post.content;

    const commentList = document.getElementById("commentList");

    function renderComments() {
        commentList.innerHTML = "";
        post.comments.forEach(c => {
            const div = document.createElement("div");
            div.className = "comment";
            div.innerHTML = `<b>${c.writer}:</b> ${c.text}`;
            commentList.appendChild(div);
        });
    }

    renderComments();

    document.getElementById("commentBtn").addEventListener("click", () => {
        const text = document.getElementById("commentText").value.trim();
        if (!text) return;

        post.comments.push({ writer: "나", text });
        document.getElementById("commentText").value = "";
        renderComments();
    });
});

function goList() {
    window.location.href = "QnA1.html";
}
