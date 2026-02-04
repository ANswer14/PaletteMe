document.addEventListener("DOMContentLoaded", function() {
    const checkbox = document.getElementById("agreeCheckbox");
    const nextBtn = document.getElementById("nextBtn");
    const errorMsg = document.getElementById("errorMsg");

    // 체크박스 상태가 바뀔 때마다 에러 메시지 초기화
    checkbox.addEventListener("change", function() {
        errorMsg.innerText = "";
    });

    nextBtn.addEventListener("click", function() {
        if (!checkbox.checked) {
            errorMsg.innerText = "약관에 동의해야만 다음 단계로 이동할 수 있습니다.";
            return;
        }

        window.location.href = "/accounts/signup/";
    });
});
