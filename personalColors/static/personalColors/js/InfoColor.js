document.addEventListener("DOMContentLoaded", function() {
    // 로그인한 유저 아이디 (예시: localStorage에서 가져오기)

    const proceedBtn = document.getElementById("proceedBtn");
    const retryBtn = document.getElementById("retryBtn");
    const checkBtn = document.getElementById('colorCheckBtn');

    // 유저 퍼스널컬러 정보가 있는지 확인

    // 진행 버튼 클릭
    if (proceedBtn) {
        proceedBtn.addEventListener("click", function() {
            // 다음 화면으로 이동 (예: 컬러 분석 페이지)
            window.location.href = "map/";
        });
    }

    // 다시하기 버튼 클릭
    if (retryBtn !== null) {
        retryBtn.addEventListener("click", function () {
            // 퍼스널컬러 재측정 페이지로 이동
            window.location.href = "check/";
        });
    }

    if (checkBtn !== null) {
        checkBtn.addEventListener('click', function () {
            window.location.href = 'check/';
        })
    }
});
