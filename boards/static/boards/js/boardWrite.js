// 장고(Django)는 보안을 위해 서버의 데이터를 변경하는 모든 요청(POST, PUT, DELETE)에 이 토큰을 요구하기 때문에
// 꼭 있어야 하는 쿠키 함수
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

let uploadedFiles = []; // 업로드된 여러개의 파일들을 담을 배열

// 보고있던 글목록에서 글쓰기 버튼 눌렀을때 게시판 선택버튼이 우선적으로 자동으로 지정되게 하는 함수
document.addEventListener("DOMContentLoaded", function() {
    const boardCategory = document.getElementById("boardCategory");
    const qnaExtraOptions = document.getElementById("qnaExtraOptions");
    const freeExtraOptions = document.getElementById("freeExtraOptions");

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type"); // 주소창에 ?type=qna 처럼 올 경우

    if (type) {
        document.getElementById("boardCategory").value = type;
    }

// 게시판 선택에 따른 옵션 노출 함수
    function handleCategoryChange(val) {
        // QnA 게시판 선택시 QnA 라디오버튼 선택옵션이 화면에 노출, 자유게시판 라디오버튼은 안보임
        if (val === "qna") {
            qnaExtraOptions.style.display = "block";
            freeExtraOptions.style.display = "none";
        }
        else if (val === "free") {
            qnaExtraOptions.style.display = "none";
            freeExtraOptions.style.display = "block";
        }
        else {
            qnaExtraOptions.style.display = "none";
            freeExtraOptions.style.display = "none";
        }
    }

    // 1. 초기 실행 (페이지 로드 시점)
    handleCategoryChange(boardCategory.value);

    // 2. 변경 시 실행
    boardCategory.addEventListener("change", function() {
        handleCategoryChange(this.value);
    });

    // 3. 파일 첨부 로직
    const imageInput = document.getElementById('imageInput');
    const previewArea = document.getElementById('previewArea');

    imageInput.addEventListener('change', function (e) {
        const newFiles = Array.from(e.target.files);

        // 첨부이미지파일은 10개까지만
        if (uploadedFiles.length + newFiles.length > 10) {
            alert("이미지는 최대 10개까지만 첨부할 수 있습니다.");
            imageInput.value = "";
            return;
        }

        newFiles.forEach(file => {
            // 배열에 파일 저장
            uploadedFiles.push(file);

            const reader = new FileReader();
            reader.onload = function (event) {
            const previewBox = document.createElement('div');
            previewBox.className = 'preview-box';

            // 데이터 속성을 이용해 파일 인덱스 저장
                const fileId = Date.now() + Math.random();
                previewBox.dataset.id = fileId;
                file.id = fileId; // 파일 객체에도 ID 부여

                previewBox.innerHTML = `
                    <img src="${event.target.result}">
                    <div class="remove-btn">×</div>
                `;

                // 개별 삭제 로직
                previewBox.querySelector('.remove-btn').onclick = function () {
                    // 1. 배열에서 해당 파일 제거
                    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
                    // 2. 화면에서 제거
                    previewBox.remove();
                };

                previewArea.appendChild(previewBox);
            };
            reader.readAsDataURL(file);
        });

        // 같은 파일을 다시 올릴 수 있도록 input 초기화
        imageInput.value = "";
    });
});

async function submitPost() {
    const category = document.getElementById("boardCategory").value; // 'free' 또는 'qna'가 담김
    const title = document.getElementById("postTitle").value.trim();
    const writer = document.getElementById("postWriter").value;
    const content = document.getElementById("postContent").value.trim();

    if (!title || !content) {  // 작성자는 readonly 이므로 제목,내용만 체크
        alert("내용을 입력해주세요.");
        return;
    }

    // 비공개 여부 확인 (라디오버튼값 읽기)
    let is_private = false;      // 백엔드와 이름 맞출것!!!!!!
    let is_anonymous = false;

    // Q&A인 경우 비공개 여부 체크
    if (category === "qna") {
        is_private = document.querySelector('input[name="is_private"]:checked').value === "true";
    }

    // 자유게시판인 경우 익명 여부 체크   (백엔드와 이름 맞추기!!!!)
    if (category === "free") {
        is_anonymous = document.querySelector('input[name="is_anonymous"]:checked').value === "true";
    }

    // FormData에 담기 (formData는 변수이름, FormData는 자바스크립트 기본문법)
    // [중요] 나중에 백엔드와 연결할 때 쓸 데이터(이름 상의해서 맞춰야함!!!!!)
    // [상의 필요] 서버에서 게시판 종류를 받을 이름표 (예: 'category' 또는 'board_type'/category 변수 안에 담긴 실제값도 확인할것)
    // 만약 백엔드에서 "작성자 이름은 nickname으로 보내줘"라고 한다면, formData.append('nickname', ...)으로
    const formData = new FormData();

    formData.append('category', category);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('is_private', is_private); // 서버로 true/false(비공개여부) 전송
    formData.append('is_anonymous', is_anonymous); // true/false 전송

    // 익명이면 '익명', 아니면 닉네임으로.
    formData.append('writer', is_anonymous ? "익명" : writer);

    // 배열에 담긴 모든 파일을 FormData에 추가
    // 변수명 'images'는 백엔드에서 받을 이름과 맞춰야 합니다.
    uploadedFiles.forEach((file) => {
        formData.append(`images`, file);   // 'images'라는 이름으로 사진들을 담음(백엔드와 이름 확인!!!!!)
    });

    // 3. 알림창 띄우기
    let alertMsg = "글이 등록되었습니다.";
    if (category === "qna" && is_private) alertMsg = "비공개 글로 등록됩니다.";
    if (category === "free" && is_anonymous) alertMsg = "익명으로 글이 등록되었습니다.";
    alert(alertMsg);

    try {
        // 서버에 전송 (실제 백엔드 URL이 필요함 - 확인필요!!)
        const response = await fetch('/api/board/write/', { //서버의 글쓰기 주소확인!!!!!
            method: 'POST',
            body: formData,
            // 보통 로그인이 되어있다면 인증 토큰 등을 헤더에 담습니다.
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });

        if (response.ok) {
            // 서버가 저장 후 돌려준 데이터(예: { "no": 57 })를 받음
            const result = await response.json();
            const serverNo = result.no; // 응답글 번호 - 백엔드와 result.no의 no 이름 확인!!!!!

            alert("글이 성공적으로 등록되었습니다!"); // 사용자 알림 추가

            // 서버가 알려준 진짜 번호로 이동
            window.location.href = `board2.html?no=${serverNo}`;
            }
        else {
            alert("서버 저장에 실패했습니다.");
        }
    }

    catch (error) {
        console.error("에러 발생:", error);
        alert("네트워크 오류가 발생했습니다.");
    }

}

// 글쓰기 취소 버튼을 누를 경우 앞서 보고있었던 글목록으로 돌아감(자유게시판/QnA)
function cancelPost() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const mode = params.get("mode"); // 'edit' (수정 모드일 때만 존재)
    const no = params.get("no");

    // 1. 수정 모드였다면 상세 페이지로 돌아가기
    if (mode === 'edit' && no) {
        const targetPage = (type === 'qna') ? 'QnA2.html' : 'board2.html';
        window.location.href = `${targetPage}?no=${no}`;
    }
    // 2. 새 글 쓰기였다면 각각의 목록으로 돌아가기
    else {
        window.location.href = (type === 'qna') ? "QnA1.html" : "board1.html";
    }
}
