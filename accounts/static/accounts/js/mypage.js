// 1. 요소 가져오기
const userNameInput = document.getElementById('userName');
const nickNameCheckBtn = document.getElementById('nickNameCheckBtn');
const saveInfoBtn = document.getElementById('saveInfoBtn');

// 2. 초기 닉네임 저장
const initialNickname = userNameInput.value.trim();

// 3. 페이지 로드 시 버튼 상태 설정
// 닉네임이 그대로라면 중복 확인 버튼을 비활성화(연하게) 함
nickNameCheckBtn.disabled = (userNameInput.value.trim() === initialNickname);

// 4. 입력창 감시: 실시간으로 버튼 켜고 끄기
userNameInput.addEventListener('input', function() {
    const currentNickname = userNameInput.value.trim();

    // 원래 이름과 다르고 빈칸이 아닐 때만 버튼 활성화
    if (currentNickname !== initialNickname && currentNickname.length > 0) {
        nickNameCheckBtn.disabled = false;
    } else {
        nickNameCheckBtn.disabled = true;
    }
});

// 5. 저장 버튼 클릭 시 컨펌만 진행
if (saveInfoBtn) {
    saveInfoBtn.onclick = function(e) {
        if (!confirm("수정된 내용을 저장하시겠습니까?")) {
            e.preventDefault();
        }
    };
}

// 6. 프로필 이미지 미리보기 (기존 유지)
function previewFile() {
    const file = document.getElementById('profileUpload').files[0];
    const reader = new FileReader();
    reader.onloadend = () => { document.getElementById('profilePreview').src = reader.result; };
    if (file) reader.readAsDataURL(file);
}