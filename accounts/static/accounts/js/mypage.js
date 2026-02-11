document.addEventListener("DOMContentLoaded", function() {
    // 1. 요소 선택 (HTML의 ID와 정확히 일치시킴)
    const userNameInput = document.getElementById('userName');
    const nickNameCheckBtn = document.getElementById('nickNameCheckBtn');
    const nickNameStatus = document.getElementById('nickNameStatus');
    const initialNickname = userNameInput.value.trim();
    const emailInput = document.getElementById('email');
    const emailDuplicateBtn = document.getElementById('emailDuplicateBtn');
    const emailStatus = document.getElementById('emailStatus');

    const saveInfoBtn = document.getElementById('saveInfoBtn');
    const selectedDefaultImageInput = document.getElementById("selectedDefaultImage");

    let isNickNameChecked = true; // 이미 저장된 정보이므로 초기값은 true
    let isEmailChecked = true;

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

    // 5. 프로필 이미지 관련 (Global functions)
    function selectImage(imgName) {
        const staticPath = document.getElementById('static-path').dataset.path;
        const preview = document.getElementById('profilePreview');
        const selectedInput = document.getElementById("selectedDefaultImage");
        const fileInput = document.getElementById('profileUpload');

        preview.src = staticPath + imgName;
        if (selectedInput) selectedInput.value = imgName;
        fileInput.value = ""; // 파일 업로드 초기화
    }
// 직접 파일 업로드 시 미리보기
function previewFile() {
    const preview = document.getElementById('profilePreview');
    const file = document.getElementById('profileUpload').files[0];
    const selectedInput = document.getElementById("selectedDefaultImage");
    const reader = new FileReader();
    reader.onloadend = () => {
        preview.src = reader.result;
        if (selectedInput) selectedInput.value = ""; // 기본 이미지 선택 초기화
    };
    if (file) reader.readAsDataURL(file);
}