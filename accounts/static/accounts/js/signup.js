document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const checkIDBtn = document.getElementById("checkIDBtn");
    const usernameInput = document.getElementById("id_username");
    const password1 = document.getElementById("id_password1");
    const password2 = document.getElementById("id_password2");
    const idCheckMark = document.getElementById("id_check_mark"); // 체크 텍스트 표시 공간

    let isIdChecked = false;  // 중복 확인 상태

    // 아이디 입력값이 바뀌면 무조건 체크 표시 지우고 상태 초기화
    usernameInput.addEventListener("input", function() {
        isIdChecked = false;
        idCheckMark.innerText = "";
    });

    // === 아이디 중복확인 (서버에 요청) ===
    checkIDBtn.addEventListener("click", function () {
        const username = usernameInput.value;
        if (!username) return alert("아이디를 입력해주세요.");

        // 아이디 중복확인 로직
        fetch(`/accounts/check-username?username=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    alert("이미 존재하는 아이디입니다.");
                    isIdChecked = false;
                    idCheckMark.innerText = ""; // 실패 시 빈칸
                } else {
                    alert("사용 가능한 아이디입니다!");
                    idCheckMark.innerText = "사용가능 ✔"; // ✅ 성공 시에만 체크 표시
                    isIdChecked = true;  // 체크 표시 ✅ <- 이게 떠야 중복확인 활성화됨
                }
            });
    });

    // === 폼 제출 시 최종 확인 ===
    form.addEventListener("submit", function (e) {
        if (!isIdChecked) {  // 중복 확인 버튼 눌렀는지 확인
            e.preventDefault();
            alert("아이디 중복 확인을 해주세요.");
            usernameInput.focus();  // 아이디 입력 탭으로 포커스 이동
            return; // 다음 확인(비밀번호 일치)으로 넘어가지 않음
        }

        if (password1.value !== password2.value) {  // 비밀번호 일치 확인
            e.preventDefault();
            alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            password2.focus(); // 비밀번호 확인 입력 탭으로 포커스 이동
        }
    });
});
