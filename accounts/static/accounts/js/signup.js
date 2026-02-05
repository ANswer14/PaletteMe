document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const checkIDBtn = document.getElementById("checkIDBtn");
    const usernameInput = document.getElementById("id_username");
    const password1 = document.getElementById("id_password1");
    const password2 = document.getElementById("id_password2");

    // === 아이디 중복확인 (서버에 요청) ===
    checkIDBtn.addEventListener("click", function () {
        const username = usernameInput.value;

        if (!username) {
            alert("아이디를 입력해주세요.");
            return;
        }

        fetch(`/accounts/check-username?username=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    alert("이미 존재하는 아이디입니다.");
                } else {
                    alert("사용 가능한 아이디입니다!");
                }
            });
    });

    // === 비밀번호 확인 체크 (프론트 검증만) ===
    form.addEventListener("submit", function (e) {
        if (password1.value !== password2.value) {
            e.preventDefault();
            alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }
    });
});
