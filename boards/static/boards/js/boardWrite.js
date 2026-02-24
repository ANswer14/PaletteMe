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

let selectedFiles = [];

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
            div.innerHTML = `<img src="${e.target.result}"><button type="button" class="btn-remove" onclick="removeImage(this, '${file.name}')">×</button>`;
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(btn, fileName) {
    btn.parentElement.remove();
    selectedFiles = selectedFiles.filter(f => f.name !== fileName);
}

async function submitPost() {
    console.log("111: 저장 프로세스 시작");

    const titleEl = document.getElementById("postTitle");
    const contentEl = document.getElementById("postBody");
    const categoryEl = document.getElementById("boardCategory");
    const postIdEl = document.getElementById('post_id');

    if (!titleEl || !contentEl) {
        console.error("오류: HTML 요소를 찾을 수 없습니다. ID를 확인하세요.");
        return;
    }

    const title = titleEl.value.trim();
    const content = contentEl.value;
    const category = categoryEl.value;
    const postId = postIdEl ? postIdEl.value : "";


    if (!title || !content.trim()) {
        alert("제목과 내용을 모두 입력해 주세요.");
        return;
    }


    const formData = new FormData();
    formData.append('title', title);
    formData.append('body', content);
    formData.append('category', category.toUpperCase());
    if (postId) formData.append('post_id', postId);
    selectedFiles.forEach(file => formData.append('images', file));

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
            location.href = (category.toLowerCase() === 'qna') ? '/boards/qnaList/' : '/boards/boardList/';
        } else {
            alert("저장 실패: " + data.message);
        }
    } catch (e) {
        console.error(e);
        alert("네트워크 오류가 발생했습니다.");
    }
}