/**
 * PaletteMe 자유게시판 상세페이지 비동기 로직 (통합본)
 */

// CSRF 토큰 획득 (장고 보안 필수 함수)
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

// 1. 목록으로 가기 (이전 검색 상태 유지)
function goList() {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page") || 1;
    const kw = params.get("kw") || "";
    const type = params.get("type") || "all";
    
    location.href = `/boards/board1/?page=${page}&kw=${encodeURIComponent(kw)}&type=${type}`;
}

// 2. 좋아요 토글 API 호출
async function toggleLike(postId) {
    try {
        const response = await fetch(`/boards/api/board/like/${postId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('likeIcon').innerText = data.liked ? '❤️' : '♡';
            document.getElementById('likeCount').innerText = data.like_count;
        } else {
            alert("로그인이 필요하거나 오류가 발생했습니다.");
        }
    } catch (e) { console.error("좋아요 에러:", e); }
}

// 3. 댓글 등록 (비동기)
async function submitComment(postId) {
    const input = document.getElementById('comment-input');
    const content = input.value.trim();
    if (!content) return alert("댓글 내용을 입력해주세요.");

    try {
        const response = await fetch(`/boards/api/comment/create/${postId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ 'body': content }) // 'body' 필드명으로 전송
        });

        if (response.ok) {
            location.reload(); // 등록 후 화면 갱신
        } else {
            alert("댓글 등록에 실패했습니다.");
        }
    } catch (e) { console.error("댓글 등록 에러:", e); }
}

// 4. 댓글 수정 모드 전환
function editCommentMode(commentId) {
    const textDiv = document.getElementById(`comment-text-${commentId}`);
    const originContent = textDiv.innerText.trim();

    textDiv.innerHTML = `
        <textarea id="edit-input-${commentId}" style="width:100%; height:70px; margin-top:10px; padding:10px; border:1px solid #ddd; border-radius:5px;">${originContent}</textarea>
        <div style="text-align:right; margin-top:5px;">
            <button onclick="updateComment('${commentId}')" style="background:#666; color:white; border:none; padding:5px 12px; border-radius:4px; cursor:pointer;">저장</button>
            <button onclick="location.reload()" style="background:#eee; border:none; padding:5px 12px; border-radius:4px; cursor:pointer; margin-left:5px;">취소</button>
        </div>
    `;
}

// 5. 댓글 수정 실행
async function updateComment(commentId) {
    const newContent = document.getElementById(`edit-input-${commentId}`).value;
    if (!newContent.trim()) return alert("내용을 입력하세요.");

    try {
        const response = await fetch(`/boards/api/comment/update/${commentId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ 'body': newContent })
        });
        if (response.ok) {
            location.reload();
        } else {
            alert("수정 실패");
        }
    } catch (e) { console.error("댓글 수정 에러:", e); }
}

// 6. 댓글 삭제 실행
async function deleteComment(commentId) {
    if (!confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    try {
        const response = await fetch(`/boards/api/comment/delete/${commentId}/`, {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        if (response.ok) {
            location.reload();
        } else {
            alert("삭제 권한이 없거나 오류가 발생했습니다.");
        }
    } catch (e) { console.error("댓글 삭제 에러:", e); }
}