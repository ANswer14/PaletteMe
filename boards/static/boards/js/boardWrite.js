document.addEventListener("DOMContentLoaded", function () {

    const imageInput = document.getElementById('imageInput');
    const previewArea = document.getElementById('previewArea');
    let uploadedFiles = []; // 업로드된 여러개의 파일들을 담을 배열

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
    const title = document.getElementById("postTitle").value.trim();
    const writer = document.getElementById("postWriter").value;
    const content = document.getElementById("postContent").value.trim();

    if (!title || !content) {  // 작성자는 readonly 이므로 제목,내용만 체크
        alert("내용을 입력해주세요.");
        return;
    }

    // [중요] 나중에 백엔드와 연결할 때 쓸 보따리(이름 상의해서 맞춰야함)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('writer', writer);
    formData.append('content', content);

    // 배열에 담긴 모든 파일을 FormData에 추가
    // 변수명 'images'는 백엔드에서 받을 이름과 맞춰야 합니다.
    uploadedFiles.forEach((file) => {
        formData.append(`images`, file);   // 'images'라는 이름으로 사진들을 담음
    });

    try {
        // 서버에 전송 (실제 백엔드 URL이 필요함)
        const response = await fetch('/api/board/write/', {
            method: 'POST',
            body: formData,
            // 보통 로그인이 되어있다면 인증 토큰 등을 헤더에 담습니다.
        });

        if (response.ok) {
            // 서버가 저장 후 돌려준 데이터(예: { "no": 57 })를 받음
            const result = await response.json();
            const serverNo = result.no;

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

function cancelPost() {
    window.location.href = "board1.html"; // 글쓰기 취소하면 목록으로
}
