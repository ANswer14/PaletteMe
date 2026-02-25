/**
 * PaletteMe 자유게시판 상세페이지 통합 스크립트
 */

// CSRF 토큰 가져오기 (Django 필수)
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

// 1. 좋아요 토글
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
            console.log(data.like_count)
            document.getElementById('likeCount').innerText = data.like_count;
        } else {
            Swal.fire({ icon: 'warning', text: '로그인이 필요합니다.', confirmButtonColor: '#f39898' });
        }
    } catch (e) { console.error(e); }
}

// 2. 댓글 등록 (ID 일치 및 디자인 적용)
async function submitComment(postId) {
    // HTML의 <textarea id="comment-input"> 요소를 정확히 참조
    const contentElement = document.getElementById('comment-input');
    const content = contentElement.value;

    if (!content.trim()) {
        Swal.fire({
            icon: 'warning',
            text: '댓글 내용을 입력해주세요.',
            confirmButtonColor: '#f39898'
        });
        return;
    }

    try {
        const response = await fetch(`/boards/api/comment/create/${postId}/`, { // urls.py에 정의된 comment_create_api 주소
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ 'body': content })
        });

        if (response.ok) {
            contentElement.value = '';
            // 성공 시 부드럽게 새로고침
            location.reload();
        } else {
            const data = await response.json();
            Swal.fire({
                icon: 'error',
                text: data.message || "댓글 등록에 실패했습니다. 로그인을 확인해주세요.",
                confirmButtonColor: '#f39898'
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({ icon: 'error', text: '서버 통신 중 오류가 발생했습니다.', confirmButtonColor: '#f39898' });
    }
}