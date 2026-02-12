document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signupForm");
    // --- 아이디 관련 ---
    const checkIDBtn = document.getElementById("checkIDBtn");
    const usernameInput = document.getElementById("userID");
    const idCheckMark = document.getElementById("idStatus");
    // --- 닉네임 관련 (추가) ---
    const checkNickBtn = document.getElementById("checkNicknameBtn");
    const nicknameInput = document.getElementById("nickname");
    const nickCheckMark = document.getElementById("nickNameStatus");
    const password1 = document.getElementById("passwd");
    const password2 = document.getElementById("passwdConfirm");


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

    // === 비밀번호 확인 체크 (프론트 검증만) ===
    form.addEventListener("submit", function (e) {
        const userID = document.getElementById("userID").value;
        const passwd = document.getElementById("passwd").value;
        const passwdConfirm = document.getElementById("passwdConfirm").value;
        const nickname = document.getElementById("nickname").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const gender = document.querySelector('input[name="gender"]:checked');

        //  필수 입력 확인
        if(!userID || !passwd || !passwdConfirm || !nickname || !phone || !email || !gender){
            alert("모든 항목을 입력해주세요.");
            e.preventDefault(); // 폼 제출 기본 동작 막기
        }

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
            return; // ✨ 이 return이 있어야 아래 성공 alert가 안 뜹니다!
        }

         // 회원 정보 저장

        alert("회원가입 성공! 로그인 페이지로 이동합니다.");
    });
});
