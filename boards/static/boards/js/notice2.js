/**
 * notice2.js - 공지사항 상세페이지 통합 스크립트 (최종본)
 * 기능: 데이터 로드, 줄바꿈 처리, 상단 공백 제거, 수정/이전/다음 이동
 */

// 1. URL 파라미터에서 게시글 번호(no)와 현재 페이지 정보 가져오기
const params = new URLSearchParams(window.location.search);
const no = parseInt(params.get("no")) || 0;
const currentPageNum = params.get("page") || 1;

// 2. 주요 DOM 요소 참조
const fixBtn = document.getElementById('fixNotice');
const delBtn = document.getElementById('deleteNotice');
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

// 3. 전역 상태 변수
let numbers = []; // 전체 게시글 번호 리스트 (이전/다음 이동용)
let currentNoticeData = null;

/**
 * [초기 실행] 페이지 로드 시 실행되는 메인 로직
 */
document.addEventListener("DOMContentLoaded", async function () {
    if (no === 0) {
        alert("잘못된 접근입니다.");
        location.href = "/boards/noticeList/";
        return;
    }

    // [수정 버튼] 클릭 시 수정 모드로 이동
    if (fixBtn) {
        fixBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // no(번호), mode(수정), type(공지사항) 정보를 가지고 이동
            location.href = `/boards/boardWrite/?no=${no}&mode=edit&type=notice`;
        });
    }

    // [데이터 로드] 서버로부터 상세 내용 가져오기
    try {
        const response = await fetch(`/boards/getDetail?no=${no}`);
        if (!response.ok) throw new Error("공지사항을 찾을 수 없습니다.");

        const data = await response.json();
        currentNoticeData = data;

        // 화면에 데이터 그리기 실행
        numbers = renderNotice(data);
    }
    catch (error) {
        alert(error.message);
        goList();
    }
});

/**
 * [화면 렌더링] 데이터를 HTML 요소에 배치하는 함수
 */
function renderNotice(data) {
    // 기본 정보 배치
    document.getElementById("detailNo").innerText = no;
    document.getElementById("detailTitle").innerText = data.title;
    document.getElementById("detailDate").innerText = data.created_at;

    // ----------------------------------------------------------
    // [핵심 보정] 줄바꿈 처리 및 상단 공백 제거
    // ----------------------------------------------------------
    const contentBox = document.getElementById("detailContent");
    if (contentBox && data.content) {
        // .trim() : 데이터 앞뒤에 붙은 불필요한 엔터나 공백 제거
        // .replace(/\n/g, '<br>') : 모든 줄바꿈 문자를 HTML 태그로 변환
        contentBox.innerHTML = data.content.trim().replace(/\n/g, '<br>');
    }

    // 폼 전송용 hidden input이 있다면 ID 저장
    const postIdInput = document.querySelector('input[name=post_id]');
    if (postIdInput) postIdInput.value = no;

    // ----------------------------------------------------------
    // [이미지 처리] 이미지 컨테이너 스타일 및 중복 방지
    // ----------------------------------------------------------
    const imageContainer = document.getElementById("imageContainer");
    if (imageContainer) {
        imageContainer.innerHTML = ""; // 기존 내용 초기화

        if (data.images && data.images.length > 0) {
            data.images.forEach(img => {
                const imgTag = document.createElement("img");
                imgTag.src = img.url;
                imgTag.alt = "게시글 이미지";

                // 스타일 적용
                imgTag.style.maxWidth = "100%";
                imgTag.style.marginBottom = "15px";
                imgTag.style.display = "block";   // 한 줄에 하나씩
                imgTag.style.borderRadius = "8px"; // 부드러운 모서리

                imageContainer.appendChild(imgTag);
            });
        }
    }

    // 이전/다음 글 계산을 위해 번호 리스트 반환
    return data.numbers || [];
}

/**
 * [이동 로직] 목록으로, 이전글, 다음글 함수
 */
function goList() {
    window.location.href = `/boards/noticeList?page=${currentPageNum}`;
}

function goPrev() {
    let currentIndex = numbers.indexOf(no);
    // 배열에서 내 앞에 글이 있는지 확인
    if (currentIndex > 0 && numbers[currentIndex - 1]) {
        window.location.href = `/boards/noticeDetail?no=${numbers[currentIndex - 1]}`;
    } else {
        alert('이전 글이 존재하지 않습니다.');
    }
}

function goNext() {
    let currentIndex = numbers.indexOf(no);
    // 배열에서 내 뒤에 글이 있는지 확인
    if (currentIndex !== -1 && currentIndex < numbers.length - 1 && numbers[currentIndex + 1]) {
        window.location.href = `/boards/noticeDetail?no=${numbers[currentIndex + 1]}`;
    } else {
        alert('다음 글이 존재하지 않습니다.');
    }
}