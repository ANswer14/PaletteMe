async function enableHistory(element) {
    fetch(`/personalColors/enable_history?history_id=${element.getAttribute('data-history_id')}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                alert('성공적으로 저장되었습니다!')
            }
        })
}

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
                        nickNameStatus.innerText = exists ? "❌ 이미 사용 중인 닉네임입니다." : "✅ 사용 가능한 닉네임입니다.";
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
    const profileForm = document.querySelector('form[enctype="multipart/form-data"]'); // 프로필 폼 선택

    if (profileForm) {
        profileForm.onsubmit = function(e) {
            // 중복 확인 여부 체크
            if (!isNickNameChecked) {
                alert("닉네임 중복 확인을 먼저 완료해주세요.");
                e.preventDefault();
                return false;
            }

            // 최종 확인창 (여기서 한 번만 떠야 함)
            if (!confirm("수정된 내용을 저장하시겠습니까?")) {
                e.preventDefault();
                return false;
            }
        };
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
/**
 * [1] 기본 이미지 리스트에서 선택 시
 */
function selectImage(imgName) {
    const preview = document.getElementById('profilePreview');
    const selectedInput = document.getElementById("selectedDefaultImage");
    const fileInput = document.getElementById('profileUpload');

    // 1. 프리뷰 이미지를 static 경로로 변경
    preview.src = "/static/img/" + imgName;

    // 2. 히든 인풋에 파일명 저장 (서버 전송용)
    selectedInput.value = imgName;

    // 3. 직접 올린 파일이 있다면 초기화 (충돌 방지)
    fileInput.value = "";
}

/**
 * [2] 내 PC에서 사진 선택(파일 업로드) 시
 */
function previewFile() {
    const preview = document.getElementById('profilePreview');
    const fileInput = document.getElementById('profileUpload');
    const selectedInput = document.getElementById("selectedDefaultImage");

    if (!fileInput || !fileInput.files[0]) return;

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        // 1. 읽어온 파일을 프리뷰 src에 넣음 (Base64 데이터)
        preview.src = reader.result;

        // 2. 기본 이미지 선택값은 초기화 (직접 업로드가 우선순위)
        selectedInput.value = "";
    }
    reader.readAsDataURL(file);
}