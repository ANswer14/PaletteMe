document.getElementById("nextBtn").addEventListener("click", function() {
    const checkbox = document.getElementById("agreeCheckbox");
    const errorMsg = document.getElementById("errorMsg");
    const signupUrl = this.getAttribute("data-url");

    if (checkbox.checked) {
        // 체크되어 있으면 회원가입 페이지로 이동
        window.location.href = signupUrl;
    } else {
        // 체크 안 되어 있으면 경고 표시
        errorMsg.innerText = "약관에 동의해야만 회원가입이 가능합니다.";
    }
});
