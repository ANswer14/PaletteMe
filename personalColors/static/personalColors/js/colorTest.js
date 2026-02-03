document.addEventListener("DOMContentLoaded", function() {
    const nextBtn = document.getElementById("nextBtn");
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.getElementById("progress-text");

    let currentPage = 1;
    const totalPages = 5; // 예시: 한 페이지당 5개 질문, 총 5페이지

    nextBtn.addEventListener("click", function() {
        if(currentPage < totalPages){
            currentPage++;
            // 진행바 갱신 (간단 뼈대)
            const percent = (currentPage / totalPages) * 100;
            progressFill.style.width = percent + "%";
            progressText.textContent = `Progress: ${currentPage}/${totalPages}`;

            // 실제 질문 내용은 나중에 JS로 교체 가능
            alert("다음 질문 페이지로 이동 (뼈대)");
        } else {
            alert("마지막 페이지입니다!");
        }
    });
});
