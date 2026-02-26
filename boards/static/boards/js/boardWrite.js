/**
 * PaletteMe 게시글 작성/수정 스크립트 (통합본)
 */

// 1. 전역 변수 설정 (파일을 담아두는 바구니)
let selectedFiles = [];

// 쿠키에서 CSRF 토큰 가져오기 함수
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

/**
 * 2. 이미지 업로드 및 미리보기 핸들러
 */
function handleImageUpload(input) {
    const previewContainer = document.getElementById('imagePreview');
    const files = Array.from(input.files);

    if (selectedFiles.length + files.length > 5) {
        alert("이미지는 최대 5장까지 업로드 가능합니다.");
        return;
    }

    files.forEach(file => {
        selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="미리보기">
                <button type="button" class="btn-remove" onclick="removeNewImage(this, '${file.name}')">×</button>
            `;
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
    input.value = "";
}

/**
 * 3. 새 이미지 미리보기에서 삭제
 */
function removeNewImage(btn, fileName) {
    btn.parentElement.remove();
    selectedFiles = selectedFiles.filter(f => f.name !== fileName);
}

/**
 * 4. 기존 이미지를 서버에서 즉시 삭제 (수정 모드용)
 */
function deleteExistingImage(imgId) {
    if (!confirm('이 이미지를 서버에서 즉시 삭제하시겠습니까?')) return;

    fetch(`/boards/api/image/delete/${imgId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const target = document.getElementById(`img-${imgId}`);
            if (target) target.remove();
            alert('이미지가 삭제되었습니다.');
        } else {
            alert('이미지 삭제에 실패했습니다: ' + (data.message || '권한 없음'));
        }
    })
    .catch(err => console.error(err));
}

/**
 * 5. 게시글 저장 (등록/수정 공용) - [섞기 핵심 부분]
 */
async function submitPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postBody').value;
    const category = document.getElementById('boardCategory').value;
    const postId = document.getElementById('post_id').value;

    // [섞기 포인트] 서버 views.py의 if 'true' 조건과 맞추기 위해 문자열로 변환
    const is_secret = document.getElementById('is_private')?.checked ? 'true' : 'false';
    const is_anonymous = document.getElementById('is_anonymous')?.checked ? 'true' : 'false';

    if (!title.trim() || !content.trim()) {
        alert("제목과 내용을 모두 입력해 주세요.");
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', content);
    formData.append('category', category.toUpperCase());

    // 서버에 'true' 또는 'false' 문자열로 전달
    formData.append('is_secret', is_secret);
    formData.append('is_anonymous', is_anonymous);

    if (postId) formData.append('post_id', postId);

    // 이미지 파일들 추가
    selectedFiles.forEach(file => {
        formData.append('images', file);
    });

    try {
        const res = await fetch('/boards/api/board/write/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await res.json();
        if (data.status === 'success') {
            alert("게시글이 성공적으로 저장되었습니다.");
            const finalId = postId || data.post_id;

            const upperCat = category.toUpperCase();
            if (upperCat === 'NOTICE') {
                location.href = `/boards/noticeDetail?no=${finalId}`;
            } else if (upperCat === 'QNA') {
                location.href = `/boards/qnaDetail?no=${finalId}`;
            } else {
                location.href = `/boards/freeDetail?no=${finalId}`;
            }
        } else {
            alert("저장 실패: " + data.message);
        }
    } catch (e) {
        console.error(e);
        alert("서버 통신 중 오류가 발생했습니다.");
    }
}

/**
 * 6. 카테고리별 옵션창 토글
 */
function toggleOptions() {
    const category = document.getElementById("boardCategory").value;
    const freeOpt = document.getElementById("freeOptions");
    const qnaOpt = document.getElementById("qnaOptions");
    console.log(category)

    if (freeOpt) freeOpt.style.display = (category === "FREE") ? "block" : "none";
    if (qnaOpt) qnaOpt.style.display = (category === "QNA") ? "block" : "none";
}