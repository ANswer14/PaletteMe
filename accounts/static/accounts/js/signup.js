document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signupForm");
    const userIDInput = document.getElementById("userID");
    const nicknameInput = document.getElementById("nickname");
    const checkIDBtn = document.getElementById("checkIDBtn");
    const checkNicknameBtn = document.getElementById("checkNicknameBtn");
    const nicknameStatus = document.getElementById("nicknameStatus");

    let isIDChecked = false; // 중복확인 했는지 여부
    let isNicknameChecked = false;

    // 아이디 입력 바뀌면 다시 false로 초기화
    userIDInput.addEventListener("input", () => {
        isIDChecked = false;
    });

    // 닉네임 입력 바뀌면 다시 false로 초기화
    nicknameInput.addEventListener("input", () => {
        isNicknameChecked = false;
        nicknameStatus.innerText = "";
    });

    // 중복확인 버튼 클릭 이벤트
    checkIDBtn.addEventListener("click", function() {
        const userID = userIDInput.value.trim();
        const url = this.getAttribute("data-url") || `/accounts/check-id/?userID=${encodeURIComponent(userID)}`;

        if(!userID){
            alert("아이디를 입력해주세요.");
            return;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.isDuplicate) {
                    alert("이미 사용 중인 아이디입니다.");
                    isIDChecked = false;
                }
                else {
                    alert("사용 가능한 아이디입니다!");
                    isIDChecked = true;
                }
            })
            .catch(err => alert("오류가 발생했습니다."));
    });

    // 닉네임 중복확인 (추가된 부분)
    checkNicknameBtn.addEventListener("click", function() {
        const nickname = nicknameInput.value.trim();
        const url = this.getAttribute("data-url") || `/accounts/check-nickname/?nickname=${encodeURIComponent(nickname)}`;
        if(!nickname){ alert("닉네임을 입력해주세요."); return; }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.isDuplicate) {
                    nicknameStatus.innerText = "이미 사용 중인 닉네임입니다.";
                    nicknameStatus.style.color = "red";
                    isNicknameChecked = false;
                } else {
                    nicknameStatus.innerText = "사용 가능한 닉네임입니다.";
                    nicknameStatus.style.color = "blue";
                    isNicknameChecked = true;
                }
            });
    });

    form.addEventListener("submit", function(e) {
        if (!isIDChecked) { e.preventDefault(); alert("아이디 중복확인을 해주세요!"); return; }
        if (!isNicknameChecked) { e.preventDefault(); alert("닉네임 중복확인을 해주세요!"); return; }

        const passwd = document.getElementById("passwd").value;
        const passwdConfirm = document.getElementById("passwdConfirm").value;
        if (passwd !== passwdConfirm) {
            e.preventDefault();
            alert("비밀번호가 일치하지 않습니다.");
        }
    });
});

// 내 PC에서 사진 선택 시 미리보기
function previewFile() {
    const preview = document.getElementById('profilePreview');
    const file = document.getElementById('profileUpload').files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
        preview.src = reader.result;
        document.getElementById("selectedDefaultImage").value = "";
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}
// 기본 이미지 선택 시 미리보기 및 값 저장
function selectImage(imgName) {
    const staticPath = document.getElementById('static-path').dataset.path;
    const preview = document.getElementById('profilePreview');
    preview.src = staticPath + imgName;
    document.getElementById('selectedDefaultImage').value = imgName;
    document.getElementById('profileUpload').value = "";
}