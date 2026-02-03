document.getElementById("nextBtn").addEventListener("click", function() {
    const checkbox = document.getElementById("agreeCheckbox");
    const errorMsg = document.getElementById("errorMsg");

    if (checkbox.checked) {
        // 체크되어 있으면 회원가입 페이지로 이동
        window.location.href = "signup.html";
    } else {
        // 체크 안 되어 있으면 경고 표시
        errorMsg.innerText = "약관에 동의해야만 회원가입이 가능합니다.";
    }
});
