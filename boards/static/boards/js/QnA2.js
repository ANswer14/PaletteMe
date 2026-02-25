/**
 * PaletteMe QnA 통합 스크립트
 * (실시간 좋아요 애니메이션 + 답변 등록/수정/삭제 + SweetAlert2)
 */

// 1. CSRF 토큰 획득 함수 (Django 보안 필수)
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

// 2. [통합 완성형] 좋아요 토글 함수 (숫자 업데이트 + active 클래스 토글 + 애니메이션)
async function toggleLike(postId) {
    try {
        const response = await fetch(`/boards/api/board/like/${postId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        // 로그인이 안 된 경우 (403 에러 처리)
        if (response.status === 403) {
            Swal.fire({ icon: 'warning', text: '로그인이 필요합니다.', confirmButtonColor: '#f39898' });
            return;
        }

        const data = await response.json();

        if (response.ok) {
            const btnElement = document.getElementById('like-btn');
            const iconElement = document.getElementById('like-icon');
            const countElement = document.getElementById('like-count');

            // 1) 아이콘 텍스트 및 누적 숫자 업데이트 (서버 데이터 기준)
            if (iconElement) iconElement.innerText = data.liked ? '❤️' : '♡';
            if (countElement) countElement.innerText = data.like_count;

            // 2) 버튼의 활성화(active) 클래스 토글 (색상 변경용)
            if (btnElement) {
                if (data.liked) {
                    btnElement.classList.add('active'); // CSS에서 설정한 분홍 배경 적용
                } else {
                    btnElement.classList.remove('active'); // 기본 하얀 배경으로 복구
                }
            }

            // 3) 클릭 애니메이션 효과 (스케일 업 시각 피드백)
            if (iconElement && countElement) {
                iconElement.style.transform = "scale(1.4)";
                countElement.style.transform = "scale(1.2)";
                setTimeout(() => {
                    iconElement.style.transform = "scale(1)";
                    countElement.style.transform = "scale(1)";
                }, 200);
            }
        }
    } catch (e) {
        console.error("좋아요 처리 실패:", e);
    }
}

// 3. 답변(댓글) 등록 함수
async function submitComment(postId) {
    const contentInput = document.getElementById('comment-input');
    const content = contentInput.value;

    if (!content.trim()) {
        return Swal.fire({
            icon: 'warning',
            text: '답변 내용을 입력해주세요.',
            confirmButtonColor: '#f39898'
        });
    }

    try {
        const response = await fetch(`/boards/api/comment/create/${postId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ 'body': content })
        });

        if (response.ok) {
            contentInput.value = '';
            location.reload();
        } else {
            const data = await response.json();
            Swal.fire({
                icon: 'error',
                text: data.message || '답변 등록에 실패했습니다.',
                confirmButtonColor: '#f39898'
            });
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// 4. 댓글 삭제 함수
async function deleteComment(commentId) {
    const { isConfirmed } = await Swal.fire({
        title: '삭제하시겠습니까?',
        text: "삭제된 답변은 복구할 수 없습니다.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f39898',
        cancelButtonColor: '#eee',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    });

    if (isConfirmed) {
        try {
            const response = await fetch(`/boards/api/comment/delete/${commentId}/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            if (response.ok) {
                location.reload();
            }
        } catch (e) { console.error(e); }
    }
}

// 5. 게시글 삭제 확인 함수
function confirmDelete(postId) {
    Swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: "삭제된 질문은 복구할 수 없습니다.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f39898',
        cancelButtonColor: '#eee',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    }).then((result) => {
        if (result.isConfirmed) {
            location.href = `/boards/delete/?no=${postId}`;
        }
    });
}

// 6. 댓글 수정 UI 전환 함수
function showEditForm(commentId, currentBody) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    const textDiv = commentItem.querySelector('.comment-body-text');

    textDiv.innerHTML = `
        <div class="edit-area" style="margin-top:10px;">
            <textarea id="edit-input-${commentId}" 
                      style="width:100%; height:80px; padding:12px; border:1px solid #ddd; border-radius:8px; resize:none; font-family:inherit;">${currentBody}</textarea>
            <div style="text-align:right; margin-top:8px;">
                <button type="button" onclick="updateComment('${commentId}')" 
                        style="background:#f39898; color:white; border:none; padding:6px 16px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px;">저장</button>
                <button type="button" onclick="location.reload()" 
                        style="background:#eee; color:#666; border:none; padding:6px 16px; border-radius:6px; cursor:pointer; font-size:13px; margin-left:5px;">취소</button>
            </div>
        </div>
    `;
}

// 7. 댓글 수정 저장 함수
async function updateComment(commentId) {
    const newContent = document.getElementById(`edit-input-${commentId}`).value;

    if (!newContent.trim()) {
        return Swal.fire({ icon: 'warning', text: '내용을 입력해주세요.', confirmButtonColor: '#f39898' });
    }

    try {
        const response = await fetch(`/boards/api/comment/update/${commentId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ 'body': newContent })
        });

        if (response.ok) {
            location.reload();
        }
    } catch (e) {
        console.error(e);
    }
}
