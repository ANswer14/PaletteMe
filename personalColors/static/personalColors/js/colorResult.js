document.addEventListener("DOMContentLoaded", function() {
    const retryBtn = document.getElementById("retryBtn");
    const nextBtn = document.getElementById("nextBtn");
    const savePopup = document.getElementById("savePopup");
    const yesBtn = document.getElementById("yesBtn");
    const noBtn = document.getElementById("noBtn");

    const colors = ["#FFD1B3", "#FFE5A3", "#FFB3B3"]; //임시
    const palette = document.getElementById("palette");

    colors.forEach(color => {
        const circle = document.createElement("div");
        circle.className = "color-circle";
        circle.style.backgroundColor = color;
        circle.title = color; // 마우스 올리면 색 코드 보임
        palette.appendChild(circle);
    });

    // 다시하기 버튼
    retryBtn.addEventListener("click", function() {
        window.location.href = "colorTest.html"; // 첫 진단 페이지로 이동
    });

    // NEXT 버튼 클릭 → 팝업 보여주기
    nextBtn.addEventListener("click", function() {
        savePopup.style.display = "flex";
    });

    // 예 버튼 클릭 → 저장 후 다음 페이지 이동
    yesBtn.addEventListener("click", function() {
        // 예: localStorage에 저장 (뼈대)
        const currentUser = localStorage.getItem("currentUser");
        let users = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex(u => u.userID === currentUser);
        if(userIndex !== -1){
            users[userIndex].personalColor = document.getElementById("personalColorResult").textContent;
            localStorage.setItem("users", JSON.stringify(users));
        }
        savePopup.style.display = "none";
        window.location.href = "weather.html"; // 다음 페이지 (날씨) 이동
    });

    // 아니오 버튼 클릭 → 팝업 닫기, 화면 그대로
    noBtn.addEventListener("click", function() {
        savePopup.style.display = "none";
    });
});
