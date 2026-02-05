const emailInput = document.getElementById('email');
const checkBtn = document.getElementById('checkDuplicateBtn');
const statusMsg = document.getElementById('emailStatus');
const saveInfoBtn = document.getElementById('saveInfoBtn');
const nickNameInput = document.getElementById('userName');
const nickNameCheckBtn = document.getElementById('nickNameCheckBtn');
const nickNameStatus = document.getElementById('nickNameStatus');

// 중복 확인 여부를 저장하는 변수 (나중에 '수정 완료' 버튼 클릭 시 체크용)
let isEmailChecked = false;
let isNickNameChecked = false;

// 세션에서 정보 가져오기
window.onload = function () {
    fetch("/api/user-info", {
        method: "GET",
        credentials: "include"  // 세션 쿠키 포함
    })
    .then(res => res.json())
    .then(data => {
        userId.value = data.id;
        userName.value = data.name;
        nickName.value = data.nickname;
        email.value = data.email;
        phone.value = data.phone;
    });
};

nickNameCheckBtn.onclick = function() {
    const nickNameValue = nickNameInput.value.trim();

    if (!nickNameValue) {
        alert("닉네임을 입력해주세요.");
        return;
    }

    // 서버로 닉네임 중복 체크 요청 (GET)
    fetch(`/api/check-nickname?nickname=${encodeURIComponent(nickNameValue)}`)
        .then(res => res.json())
        .then(data => {
            if (data.isDuplicate) {
                nickNameStatus.innerText = "이미 사용 중인 닉네임입니다.";
                isNickNameChecked = false;
            } else {
                nickNameStatus.innerText = "사용 가능한 닉네임입니다.";
                isNickNameChecked = true;
            }
        })
        .catch(err => alert("오류가 발생했습니다."));
};

// 닉네임을 수정하면 다시 중복 확인을 하도록 리셋
nickNameInput.oninput = function() {
    isNickNameChecked = false;
    nickNameStatus.innerText = "";
};

// 이메일 중복 확인
checkBtn.addEventListener('click', () => {
    const emailValue = emailInput.value.trim();

    // 1. 간단한 유효성 검사
    if (!emailValue) {
        alert("이메일을 입력해주세요.");
        return;
    }

    // 2. 서버에 중복 확인 요청
    fetch(`/api/check-email?email=${encodeURIComponent(emailValue)}`, {
        method: "GET",
    })
    .then(res => res.json())
    .then(data => {
        // 서버에서 { isDuplicate: true/false } 형태의 응답을 준다고 가정
        if (data.isDuplicate) {
            statusMsg.innerText = "이미 사용 중인 이메일입니다.";
            isEmailChecked = false;
        } else {
            statusMsg.innerText = "사용 가능한 이메일입니다.";
            isEmailChecked = true;
        }
    })
    .catch(err => {
        console.error("오류 발생:", err);
        alert("중복 확인 중 문제가 발생했습니다.");
    });
});
// 사용자가 이메일을 다시 수정하면 중복 확인을 다시 하도록 리셋
emailInput.addEventListener('input', () => {
    statusMsg.innerText = "";
    isEmailChecked = false;
});

// 기본 이미지 선택 함수
function selectImage(imageName) {
    document.getElementById('profilePreview').src = imageName;
    // 나중에 저장할 때 이 경로를 서버로 보냅니다.
}
// 직접 파일 업로드 시 미리보기
function previewFile() {
    const preview = document.getElementById('profilePreview');
    const file = document.getElementById('profileUpload').files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}
// 정보 수정 저장
saveInfoBtn.onclick = function () {
    if (!confirm("수정된 내용을 저장하시겠습니까?")) return;

    const profileImgSrc = document.getElementById('profilePreview').src;

    fetch("/api/update-user", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: userName.value,
            nickname: nickName.value,
            email: email.value,
            phone: phone.value
        })
    })
    .then(res => {
        if (res.ok) return res.json();
        throw new Error("저장 실패");
    })
    .then(data => {
        alert("성공적으로 수정되었습니다!");
        document.getElementById('headerProfileImg').src = profileImgSrc;
        // 수정 후 마이페이지 등으로 이동
        location.href = "mypage.html";
    })
    .catch(err => {
        alert("오류가 발생했습니다. 다시 시도해주세요.");
        console.error(err);
    });
};
