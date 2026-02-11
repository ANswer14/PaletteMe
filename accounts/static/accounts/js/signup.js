document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    // --- 아이디 관련 ---
    const checkIDBtn = document.getElementById("checkIDBtn");
    const usernameInput = document.getElementById("id_username");
    const idCheckMark = document.getElementById("id_check_mark");
    // --- 닉네임 관련 (추가) ---
    const checkNickBtn = document.getElementById("checkNickBtn");
    const nicknameInput = document.getElementById("id_nickname");
    const nickCheckMark = document.getElementById("nick_check_mark");
    const password1 = document.getElementById("id_password1");
    const password2 = document.getElementById("id_password2");


    let isIdChecked = false;  // 아이디 중복 확인 상태
    let isNickChecked = false; // 닉네임 중복 확인 상태

// 서버 에러로 돌아왔을 때 값이 있으면 체크된 것으로 간주
    if (usernameInput.value.trim() !== "") isIdChecked = true;
    if (nicknameInput.value.trim() !== "") isNickChecked = true;

    // 입력값 변경 시 상태 초기화
    usernameInput.addEventListener("input", () => { isIdChecked = false; idCheckMark.innerText = ""; });
    nicknameInput.addEventListener("input", () => { isNickChecked = false; nickCheckMark.innerText = ""; });

    // === 아이디 중복확인 ===
    checkIDBtn.addEventListener("click", function () {
        const username = usernameInput.value.trim();
        if (!username) return alert("아이디를 입력해주세요.");

        // type=username 파라미터 추가
        fetch(`/accounts/check-username/?value=${encodeURIComponent(username)}&type=username`)
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    isIdChecked = false;
                    idCheckMark.innerText = "❌ 이미 사용 중인 아이디입니다.";
                    idCheckMark.style.color = "red";
                } else {
                    isIdChecked = true;
                    idCheckMark.innerText = "✅ 사용 가능한 아이디입니다.";
                    idCheckMark.style.color = "green";
                }
            });
    });

    // === 닉네임 중복확인 (추가) ===
    checkNickBtn.addEventListener("click", function () {
        const nickname = nicknameInput.value.trim();
        if (!nickname) return alert("닉네임을 입력해주세요.");

        // type=nickname 파라미터 추가
        fetch(`/accounts/check-username/?value=${encodeURIComponent(nickname)}&type=nickname`)
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    isNickChecked = false;
                    nickCheckMark.innerText = "❌ 이미 사용 중인 닉네임입니다.";
                    nickCheckMark.style.color = "red";
                } else {
                    isNickChecked = true;
                    nickCheckMark.innerText = "✅ 사용 가능한 닉네임입니다.";
                    nickCheckMark.style.color = "green";
                }
            });
    });

    // === 폼 제출 시 최종 확인 ===
    form.addEventListener("submit", function (e) {
        if (!isIdChecked) {
            e.preventDefault();
            alert("아이디 중복 확인을 해주세요.");
            usernameInput.focus();
            return;
        }

        // 닉네임 중복 확인 여부 체크 추가
        if (!isNickChecked) {
            e.preventDefault();
            alert("닉네임 중복 확인을 해주세요.");
            nicknameInput.focus();
            return;
        }

        if (password1.value !== password2.value) {
            e.preventDefault();
            alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            password2.focus();
        }
    });
});
