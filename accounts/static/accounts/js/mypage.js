// 1. 요소 가져오기
const userNameInput = document.getElementById('userName');
const nickNameCheckBtn = document.getElementById('nickNameCheckBtn');
const saveInfoBtn = document.getElementById('saveInfoBtn');
const profileUpload = document.getElementById('profileUpload');
const profilePreview = document.getElementById('profilePreview');
const defaultImgInput = document.getElementById('selectedDefaultImage');

// 2. 초기 닉네임 저장
const initialNickname = userNameInput.value.trim();

// 3. 페이지 로드 시 버튼 상태 설정
if (nickNameCheckBtn) {
    nickNameCheckBtn.disabled = (userNameInput.value.trim() === initialNickname);
}

// 4. 닉네임 입력창 감시
userNameInput.addEventListener('input', function() {
    const currentNickname = userNameInput.value.trim();
    if (currentNickname !== initialNickname && currentNickname.length > 0) {
        nickNameCheckBtn.disabled = false;
    } else {
        nickNameCheckBtn.disabled = true;
    }
});

// 5. 저장 버튼 클릭 컨펌
if (saveInfoBtn) {
    saveInfoBtn.onclick = function(e) {
        if (!confirm("수정된 내용을 저장하시겠습니까?")) {
            e.preventDefault();
        }
    };
}

// mypage.js (안전성 강화 버전)

function previewFile() {
    // 함수가 실행될 때 요소를 다시 찾음 (null 방지)
    const preview = document.getElementById('profilePreview');
    const uploadInput = document.getElementById('profileUpload');
    const defaultInput = document.getElementById('selectedDefaultImage');

    const file = uploadInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            preview.src = reader.result; // 미리보기 교체
            if (defaultInput) defaultInput.value = ""; // 기본이미지 값 초기화
        };
        reader.readAsDataURL(file);
    }
}

function selectImage(imageName) {
    const preview = document.getElementById('profilePreview');
    const defaultInput = document.getElementById('selectedDefaultImage');
    const uploadInput = document.getElementById('profileUpload');

    preview.src = `/static/accounts/images/${imageName}`;
    if (defaultInput) defaultInput.value = imageName;
    uploadInput.value = ""; // 파일 선택 초기화
}

// 닉네임 관련 로직은 아래에 그대로 두시면 됩니다.