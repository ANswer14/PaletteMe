document.addEventListener("DOMContentLoaded", function() {
    // 1. 요소 선택 (HTML의 ID와 정확히 일치시킴)
    const nicknameInput = document.getElementById('nickname');
    const nickNameCheckBtn = document.getElementById('nickNameCheckBtn');
    const nickNameStatus = document.getElementById('nickNameStatus');

    const emailInput = document.getElementById('email');
    const emailDuplicateBtn = document.getElementById('emailDuplicateBtn');
    const emailStatus = document.getElementById('emailStatus');

    const saveInfoBtn = document.getElementById('saveInfoBtn');
    const selectedDefaultImageInput = document.getElementById("selectedDefaultImage");

    let isNickNameChecked = true; // 이미 저장된 정보이므로 초기값은 true
    let isEmailChecked = true;

    // 2. 닉네임 중복 확인
    nickNameCheckBtn.onclick = function() {
        const value = nicknameInput.value.trim();
        const url = this.getAttribute("data-url"); // HTML의 {% url %} 주소 가져오기

        if (!value) { alert("닉네임을 입력해주세요."); return; }

        fetch(`${url}?nickname=${encodeURIComponent(value)}`)
            .then(res => res.json())
            .then(data => {
                if (data.isDuplicate) {
                    nickNameStatus.innerText = "이미 사용 중인 닉네임입니다.";
                    nickNameStatus.style.color = "red";
                    isNickNameChecked = false;
                } else {
                    nickNameStatus.innerText = "사용 가능한 닉네임입니다.";
                    nickNameStatus.style.color = "blue";
                    isNickNameChecked = true;
                }
            });
    };

    // 3. 이메일 중복 확인
    emailDuplicateBtn.onclick = function() {
        const value = emailInput.value.trim();
        const url = this.getAttribute("data-url");

        if (!value) { alert("이메일을 입력해주세요."); return; }

        fetch(`${url}?email=${encodeURIComponent(value)}`)
            .then(res => res.json())
            .then(data => {
                if (data.isDuplicate) {
                    emailStatus.innerText = "이미 사용 중인 이메일입니다.";
                    emailStatus.style.color = "red";
                    isEmailChecked = false;
                } else {
                    emailStatus.innerText = "사용 가능한 이메일입니다.";
                    emailStatus.style.color = "blue";
                    isEmailChecked = true;
                }
            });
    };

    // 입력 값이 바뀌면 중복확인 초기화
    nicknameInput.oninput = () => { isNickNameChecked = false; nickNameStatus.innerText = ""; };
    emailInput.oninput = () => { isEmailChecked = false; emailStatus.innerText = ""; };

    // 4. 정보 수정 저장
    saveInfoBtn.onclick = function () {
        if (!isNickNameChecked || !isEmailChecked) {
            alert("중복 확인을 먼저 완료해주세요.");
            return;
        }
        if (!confirm("수정된 내용을 저장하시겠습니까?")) return;

        // 실제 저장은 폼의 submit을 이용하거나 별도의 fetch POST를 사용합니다.
        // 여기서는 흐름만 보여드립니다.
        alert("수정이 완료되었습니다!");
    };
});

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

function previewFile() {
    const preview = document.getElementById('profilePreview');
    const file = document.getElementById('profileUpload').files[0];
    const selectedInput = document.getElementById("selectedDefaultImage");
    const reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
        if (selectedInput) selectedInput.value = ""; // 기본 이미지 선택 초기화
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}