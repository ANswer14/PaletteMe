document.addEventListener("DOMContentLoaded", function() {

    // 1. 요소 선택
    const nicknameInput = document.getElementById('nickname');
    const nickNameCheckBtn = document.getElementById('nickNameCheckBtn');
    const nickNameStatus = document.getElementById('nickNameStatus');
    const saveInfoBtn = document.getElementById('saveInfoBtn');

    // 비밀번호 관련 요소
    const currentPw = document.getElementById('currentPw');
    const newPw = document.getElementById('newPw');
    const newPwCheck = document.getElementById('newPwCheck');
    const changePwBtn = document.getElementById('changePwBtn');

    // 초기값 저장
    const initialNickname = nicknameInput ? nicknameInput.value.trim() : "";
    let isNickNameChecked = true;

    // 페이지 로드 시 초기 상태: 버튼 비활성화 (원래 닉네임이니까)
    if (nickNameCheckBtn) {
        nickNameCheckBtn.disabled = true;
    }

    // --- (3) 닉네임 중복 확인 로직 (AJAX) ---
    if (nickNameCheckBtn && nicknameInput) {
        nickNameCheckBtn.onclick = function(e) {
            e.preventDefault();

            const value = nicknameInput.value.trim();
            const url = "/accounts/check-username/";

            if (!value) {
                alert("닉네임을 입력해주세요.");
                return;
            }

            fetch(`${url}?type=nickname&value=${encodeURIComponent(value)}`)
                .then(res => res.json())
                .then(data => {
                    const exists = data.exists || data.isDuplicate;
                    if (nickNameStatus) {
                        nickNameStatus.innerText = exists ? "이미 사용 중인 닉네임입니다." : "사용 가능한 닉네임입니다.";
                        nickNameStatus.style.color = exists ? "red" : "green";
                    }
                    isNickNameChecked = !exists;
                })
                .catch(err => console.error("중복 확인 에러:", err));
        };

        // 🔥 입력창 감시: 버튼 활성/비활성 제어
        nicknameInput.oninput = () => {
            const currentValue = nicknameInput.value.trim();

            if (currentValue === initialNickname) {
                // 원래 닉네임으로 돌아오면: 버튼 비활성 + 상태 초기화
                nickNameCheckBtn.disabled = true;
                isNickNameChecked = true;
                if (nickNameStatus) nickNameStatus.innerText = "";
            } else if (currentValue.length > 0) {
                // 값이 바뀌고 빈칸이 아니면: 버튼 활성 + 중복확인 필요 상태
                nickNameCheckBtn.disabled = false;
                isNickNameChecked = false;
                if (nickNameStatus) nickNameStatus.innerText = "";
            } else {
                // 빈칸이면: 버튼 비활성
                nickNameCheckBtn.disabled = true;
                isNickNameChecked = false;
            }
        };
    }

    // --- (4) 정보 수정 저장 버튼 로직 ---
    if (saveInfoBtn) {
        saveInfoBtn.addEventListener('click', function(e) {
            if (!isNickNameChecked) {
                alert("닉네임 중복 확인을 먼저 완료해주세요.");
                e.preventDefault();
                return;
            }
            if (!confirm("수정된 내용을 저장하시겠습니까?")) {
                e.preventDefault();
            }
        });
    }
    // --- (5) 비밀번호 변경 검증 로직 (엔터 지원 버전) ---
    const pwForm = document.querySelector('form[action="/accounts/change-password/"]');

    if (pwForm) {
        pwForm.onsubmit = function(e) {
            // 1. 요소 다시 확인 (입력 시점의 값)
            const currentPwVal = document.getElementById('currentPw').value.trim();
            const newPwVal = document.getElementById('newPw').value.trim();
            const newPwCheckVal = document.getElementById('newPwCheck').value.trim();

            // 2. 빈 칸 검사
            if (!currentPwVal || !newPwVal || !newPwCheckVal) {
                alert("비밀번호 필드를 모두 입력해주세요.");
                e.preventDefault();
                return false;
            }

            // 3. 새 비밀번호 일치 검사
            if (newPwVal !== newPwCheckVal) {
                alert("새 비밀번호가 서로 일치하지 않습니다.");
                document.getElementById('newPwCheck').focus();
                e.preventDefault();
                return false;
            }

            // 4. 길이 검사
            if (newPwVal.length < 8) {
                alert("새 비밀번호는 최소 8자 이상이어야 합니다.");
                e.preventDefault();
                return false;
            }

            // 5. 최종 확인
            if (!confirm("비밀번호를 변경하시겠습니까?")) {
                e.preventDefault();
                return false;
            }

            // 여기까지 오면 자동으로 서버로 submit 됩니다.
        };
    }
});


/**
 * [2] 이미지 관련 전역 함수 (Global Functions)
 */
function selectImage(imgName) {
    const staticPathEl = document.getElementById('static-path');
    if (!staticPathEl) return;

    const staticPath = staticPathEl.dataset.path;
    const preview = document.getElementById('profilePreview');
    const selectedInput = document.getElementById("selectedDefaultImage");
    const fileInput = document.getElementById('profileUpload');

    if (preview) preview.src = staticPath + imgName;
    if (selectedInput) selectedInput.value = imgName;
    if (fileInput) fileInput.value = "";
}

function previewFile() {
    const preview = document.getElementById('profilePreview');
    const fileInput = document.getElementById('profileUpload');
    if (!fileInput || !fileInput.files[0]) return;

    const file = fileInput.files[0];
    const selectedInput = document.getElementById("selectedDefaultImage");
    const reader = new FileReader();

    reader.onloadend = function () {
        if (preview) preview.src = reader.result;
        if (selectedInput) selectedInput.value = "";
    }
    reader.readAsDataURL(file);
}