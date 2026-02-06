document.addEventListener("DOMContentLoaded", function() {
    const retryBtn = document.getElementById("retryBtn");
    const nextBtn = document.getElementById("nextBtn");
    const savePopup = document.getElementById("savePopup");
    const yesBtn = document.getElementById("yesBtn");
    const noBtn = document.getElementById("noBtn");
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const colors = ["#FFD1B3", "#FFE5A3", "#FFB3B3"]; //임시
    const palette = document.getElementById("palette");
    const colorType = document.getElementById('personalColorResult').innerText;
    const mood = document.getElementById('description').innerText;
    const goodColor = document.getElementById('goodColor').innerText;
    const badColor = document.getElementById('badColor').innerText;

    colors.forEach(color => {
        const circle = document.createElement("div");
        circle.className = "color-circle";
        circle.style.backgroundColor = color;
        circle.title = color; // 마우스 올리면 색 코드 보임
        palette.appendChild(circle);
    });

    // 다시하기 버튼
    retryBtn.addEventListener("click", function() {
        window.location.href = "/personalColors/check/"; // 첫 진단 페이지로 이동
    });

    // NEXT 버튼 클릭 → 팝업 보여주기
    nextBtn.addEventListener("click", function() {
        savePopup.style.display = "flex";
    });

    // 예 버튼 클릭 → 저장 후 다음 페이지 이동
    yesBtn.addEventListener("click", async function() {
        let data = {
        colorType: colorType,
        mood: mood,
        goodColor: goodColor,
        badColor: badColor
        }
        await fetch(`/personalColors/saveInfo/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken':csrftoken,
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(result => {
                if (result.status === 'success') {
                    alert('결과가 저장되었습니다: ' + result.message);
                } else {
                    alert(result.message);
                }
            });
        window.location.href = "/personalColors/weather/"; // 다음 페이지 (날씨) 이동
    });

    // 아니오 버튼 클릭 → 팝업 닫기, 화면 그대로
    noBtn.addEventListener("click", function() {
        savePopup.style.display = "none";
    });
});
