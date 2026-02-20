const params = new URLSearchParams(window.location.search);
const no = parseInt(params.get("no")) || 0;     // URL에서 글 번호 가져오기
const currentPageNum = params.get("page") || 1;    // 원래 보던 페이지 불러오기 선언

// HTML 요소 미리 찾아두기
const detailNo = document.getElementById("detailNo");
const detailTitle = document.getElementById("detailTitle");
const detailDate = document.getElementById("detailDate");
const detailView = document.getElementById("detailView");
//const detailContent = document.getElementById("detailContent");
const commentList = document.getElementById("commentList");
const fixDiv = document.getElementById('fix-btn');
const userName = document.getElementById('userName').value;
const newBtn = document.createElement('button');
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
let numbers = [];
let currentPostData = null; // 데이터를 담아둘 주머니

// 백엔드 데이터 로드함수
document.addEventListener("DOMContentLoaded", async function () {
    // 글 번호가 없으면 목록으로 튕겨내기
    if (no === 0) {
        alert("잘못된 접근입니다.");
        location.href = "boards/boardList/";    // 실제주소 쓸것!!!!!!!!
        return;
    }

    // 서버에서 데이터 가져오기
    try {
        const response = await fetch(`/boards/getDetail?no=${no}`);
        if (!response.ok) throw new Error("게시글을 찾을 수 없습니다.");
        const data = await response.json();

        currentPostData = data; // 주머니에 저장
        numbers = renderDetail(data); // 데이터를 화면에 그리는 함수 호출
        if (userName === data.author) {
            newBtn.innerText = '수정';
            let form = await createFixForm();
            form.appendChild(newBtn);
            fixDiv.appendChild(form)
        }
    }
    catch (error) {
        alert(error.message);
        goList();
    }

});

newBtn.addEventListener('click', function() {
    form.submit();
});

// 화면에 데이터를 그려주는 로직 (기존 코드의 로직을 함수화함)
function renderDetail(data) {

    // 변수 선언 대신 ID 직접 찾아서 바로 대입
    document.getElementById("detailNo").innerText = data.id || no;
    document.getElementById("detailTitle").innerText = data.title;
    document.getElementById("detailDate").innerText = data.created_at || data.date;
    document.getElementById("detailView").innerText = data.view_count;
    document.getElementById("detailContent").innerText = data.content;

    // 답변(댓글) 출력
    commentList.innerHTML = ""; // 기존 내용 비우기
    if (data.comment_list && data.comment_list.length > 0) {
        data.comment_list.forEach(comment => {
            const div = document.createElement("div");
            div.className = "comment";
            div.innerHTML = `<b>${comment.author_name}:</b> ${comment.comment_body}`;
            commentList.appendChild(div);
        });
    } else {
        commentList.innerHTML = "<div class='comment'>운영자가 확인 후 답변을 등록할 예정입니다.</div>";
    }
    return data.numbers
}

// 목록으로 버튼
function goList() {
    //const params = new URLSearchParams(window.location.search); // params 재선언
    //const page = params.get("page") || 1;
    window.location.href = `/boards/qnaList?page=${currentPageNum}`;
}
function goPrev() {
    let currentIndex = numbers.indexOf(no);
    if(numbers[currentIndex - 1]) {
        window.location.href = `/boards/qnaDetail?no=${numbers[currentIndex - 1]}`;
    } else {
        alert('존재하지 않는 페이지 입니다.')
    }
}
function goNext() {
    let currentIndex = numbers.indexOf(no);
    if(numbers[currentIndex + 1]) {
        window.location.href = `/boards/qnaDetail?no=${numbers[currentIndex + 1]}`;
    } else {
        alert('존재하지 않는 페이지 입니다.')
    }
}

function createFixForm() {
    let form = document.createElement('form');
    form.method = 'POST';
    form.action = '/boards/boardWrite/'; // 서버의 처리 주소

    // CSRF 토큰
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // 서버로 전송할 데이터
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.name = 'post_id';
    idInput.value = no; // 넘겨받은 ID값 삽입
    form.appendChild(idInput);

    return form;
}