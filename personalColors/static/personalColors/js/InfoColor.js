document.addEventListener("DOMContentLoaded", function() {
    // 로그인한 유저 아이디 (예시: localStorage에서 가져오기)
    const currentUser = localStorage.getItem("currentUser"); // 로그인 시 저장 필요
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const userData = users.find(u => u.userID === currentUser);

    const userColorInfoDiv = document.getElementById("userColorInfo");
    const proceedBtn = document.getElementById("proceedBtn");
    const retryBtn = document.getElementById("retryBtn");

    // 유저 퍼스널컬러 정보가 있는지 확인
    let personalColor = "";
    if(userData && userData.personalColor){
        personalColor = userData.personalColor; // 예: "봄웜"
        userColorInfoDiv.textContent = `${currentUser} 님의 저장된 퍼스널컬러 정보:\n${personalColor}`;
    } else {
        userColorInfoDiv.textContent = "아직 저장된 퍼스널컬러 정보가 없습니다";
    }

    // 진행 버튼 클릭
    proceedBtn.addEventListener("click", function() {
        if(!personalColor){
            alert("저장된 퍼스널컬러 정보가 없습니다!");
            return;
        }
        // 다음 화면으로 이동 (예: 컬러 분석 페이지)
        window.location.href = "nextStep.html";
    });

    // 다시하기 버튼 클릭
    retryBtn.addEventListener("click", function() {
        // 퍼스널컬러 재측정 페이지로 이동
        window.location.href = "colorTest.html";
    });
});
