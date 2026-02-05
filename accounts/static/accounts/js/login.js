document.addEventListener("DOMContentLoaded", function() {
    const idInput = document.getElementById("userID");
    const pwInput = document.getElementById("passwd");
    const loginBtn = document.getElementById("loginBtn");
    //const loginForm = document.querySelector("form"); // ✅ 폼 잡기

    function validateAndSubmit(e) {
        const username = idInput.value.trim();
        const password = pwInput.value.trim();

        if (!username || !password) {
            e.preventDefault();  // 🔥 폼 제출 막기
            alert("아이디와 비밀번호를 입력하세요.");
            return;
        }

        // 여기까지 오면 → 그냥 allauth가 알아서 로그인 처리함
        console.log("로그인 요청 전송");
    }

    // 버튼 클릭 시 검사 → 문제 없으면 allauth로 제출
    loginBtn.addEventListener("click", event => {
        validateAndSubmit(event)
        if (window.opener && !window.opener.closed) {
            window.opener.location.reload();
        }
        window.close();
    });

    // 엔터키 처리
    pwInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            validateAndSubmit(e);
        }
    });
});
