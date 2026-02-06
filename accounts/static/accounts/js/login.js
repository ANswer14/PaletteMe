document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector("form");
    const idInput = document.getElementById("userID");
    const pwInput = document.getElementById("passwd");

    // "submit" 이벤트는 버튼 클릭뿐만 아니라 엔터키 입력까지 한 번에 잡아냅니다.
    loginForm.addEventListener("submit", function (e) {
        const username = idInput.value.trim();
        const password = pwInput.value.trim();

        if (!username || !password) {
            e.preventDefault(); // ⚠️ 비어있으면 서버로 전송하지 않음
            alert("아이디와 비밀번호를 모두 입력하세요.");
        }
    });
});
