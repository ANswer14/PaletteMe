document.addEventListener("DOMContentLoaded", () => {

    const locationInput = document.getElementById("locationInput");
    const searchBtn = document.getElementById("searchBtn");
    const nextBtn = document.getElementById("nextBtn");

    const locationName = document.getElementById("locationName");
    const temp = document.getElementById("temp");
    const feelsLike = document.getElementById("feelsLike");
    const weatherText = document.getElementById("weatherText");

    /* 🔍 지역 검색 버튼 */
    searchBtn.addEventListener("click", () => {
        const location = locationInput.value.trim();

        if (location === "") {
            alert("지역을 입력해주세요.");
            return;
        }

        // 👉 지금은 더미 데이터
        locationName.textContent = location;
        temp.textContent = "23℃";
        feelsLike.textContent = "25℃";
        weatherText.textContent = "햇볕이 강하니 자외선에 주의하세요.";

        // 검색 여러 번 가능
        locationInput.value = "";
    });

    /* ⏭ NEXT 버튼 */
    nextBtn.addEventListener("click", () => {
        // 다음 화면으로 이동
        // (퍼스널컬러 + 날씨 종합 결과 페이지)
        window.location.href = "../FinalResult/styleResult.html";
    });

});
