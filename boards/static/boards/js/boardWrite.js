/**
 * 1. 보안을 위한 CSRF 토큰 추출 함수
 * 장고 서버에 데이터를 보낼 때 '내가 보낸 게 맞다'는 증표를 쿠키에서 가져옵니다.
 */
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

// 업로드할 파일들을 임시 저장할 배열
let uploadedFiles = [];
// 등록 버튼 여러 번 클릭 방지 변수
let isSubmitting = false;
// Quill 에디터 객체 변수
let quill;
const body = document.getElementById('body').value || '';

/**
 * 2. 페이지 로드 직후 실행될 설정
 */
window.onload = function() {
    // Quill 에디터 초기화 및 툴바 설정
    quill = new Quill('#editor-container', {
        modules: {
            toolbar: [
                [{ 'header': [1, 2, false] }], // 제목 크기 1, 2단
                [{ 'size': ['small', false, 'large', 'huge'] }], // 글자 크기
                ['bold', 'italic', 'underline', 'strike'], // 글자 효과
                [{ 'color': [] }, { 'background': [] }], // 글자/배경 색상
                [{ 'align': [] }], // 정렬
                ['link', 'image'], // 링크와 이미지 삽입
                ['clean'] // 모든 서식 초기화
            ]
        },
        theme: 'snow', // 'snow' 테마 사용
        placeholder: '당신의 이야기를 들려주세요...'
    });

    // 에디터 글자 수 실시간 카운트 이벤트
    quill.on('text-change', () => {
        const length = quill.getText().trim().length; // 공백 제외 텍스트 길이 계산
        document.getElementById('contentCount').innerText = `${length} / 2000자`;
    });

    // 게시판 카테고리 선택에 따른 옵션박스(익명/비공개) 노출 제어
    const categorySelect = document.getElementById("boardCategory");
    const qnaBox = document.getElementById("qnaExtraOptions");
    const freeBox = document.getElementById("freeExtraOptions");

    function toggleOptions(val) {
        // qna 선택 시 qna 박스 노출, free 선택 시 free 박스 노출
        qnaBox.style.display = (val === 'qna') ? 'flex' : 'none';
        freeBox.style.display = (val === 'free') ? 'flex' : 'none';
    }
    categorySelect.addEventListener("change", (e) => toggleOptions(e.target.value));
    toggleOptions(categorySelect.value); // 초기 상태 설정

    /**
     * 3. 이미지 업로드 처리 및 미리보기 생성
     */
    document.getElementById('imageInput').addEventListener('change', function(e) {
        const previewArea = document.getElementById('previewArea');
        Array.from(e.target.files).forEach(file => {
            uploadedFiles.push(file); // 실제 전송용 배열에 추가

            const reader = new FileReader();
            reader.onload = (ev) => {
                const item = document.createElement('div');
                item.className = 'preview-item'; // CSS 스타일 적용을 위한 클래스
                const fId = Date.now() + Math.random(); // 삭제용 고유 ID 생성
                file.id = fId;

                // 미리보기 이미지와 삭제 버튼 구성
                item.innerHTML = `
                    <img src="${ev.target.result}">
                    <button class="remove-img" onclick="removeImage(${fId}, this)">×</button>
                `;
                previewArea.appendChild(item);
            };
            reader.readAsDataURL(file); // 파일을 읽어 URL 형식으로 변환
        });
    });
    quill.root.innerHTML = body;
};

/**
 * 4. 선택한 이미지 삭제 함수
 */
function removeImage(id, btn) {
    // 파일 배열에서 해당 ID를 가진 파일 제거
    uploadedFiles = uploadedFiles.filter(f => f.id !== id);
    // 화면상의 미리보기 박스 삭제
    btn.parentElement.remove();
}

/**
 * 5. 최종 게시글 서버 전송 함수
 */
async function submitPost() {
    if (isSubmitting) return; // 전송 중이면 클릭 무시

    const title = document.getElementById("postTitle").value.trim();
    const content = quill.root.innerHTML; // 에디터의 HTML 내용(서식 포함) 추출
    const textLength = quill.getText().trim().length;
    const delFiles = document.querySelectorAll('input[name=delete_images]:checked');

    // 제목 또는 내용이 비어있는지 확인
    if (!title || textLength === 0) return alert("제목과 내용을 모두 작성해주세요.");

    isSubmitting = true; // 전송 시작 상태로 전환
    const btn = document.querySelector('.btn-submit');
    btn.innerText = "업로드 중...";
    btn.style.opacity = "0.7";

    // 서버로 보낼 주머니(FormData) 생성
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', document.getElementById("boardCategory").value);
    formData.append('writer', document.getElementById("postWriter").value);
    formData.append('is_edit', document.getElementById('is_edit').value);
    formData.append('post_id', document.getElementById('post_id').value);
    delFiles.forEach(f => formData.append('delImages', f.value));

    // 게시판 종류별 라디오 버튼 값(익명/비공개) 주머니에 추가
    const category = document.getElementById("boardCategory").value;
    if(category === 'qna') {
        formData.append('is_private', document.querySelector('input[name="is_private"]:checked').value);
    } else if(category === 'free') {
        formData.append('is_anonymous', document.querySelector('input[name="is_anonymous"]:checked').value);
    }

    // 선택된 이미지 파일들 주머니에 추가
    uploadedFiles.forEach(f => formData.append('images', f));

    try {
        // 백엔드 API 서버 주소로 전송
        const res = await fetch('/boards/api/board/write/', {
            method: 'POST',
            body: formData,
            headers: { 'X-CSRFToken': getCookie('csrftoken') } // 보안 토큰 동봉
        });

        if (res.ok) {
            alert("게시글이 등록되었습니다.");
            location.href = "/boards/boardList/"; // 성공 시 목록 페이지로 이동
        } else {
            alert("등록에 실패했습니다.");
            isSubmitting = false;
            btn.innerText = "등록하기";
            btn.style.opacity = "1";
        }
    } catch (e) {
        alert("에러가 발생했습니다.");
        isSubmitting = false;
        btn.innerText = "등록하기";
    }
}

/**
 * 6. 작성 취소 버튼
 */
function cancelPost() {
    if(confirm("작성 중인 내용을 취소하시겠습니까?")) window.history.back();
}