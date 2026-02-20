document.addEventListener("DOMContentLoaded", function() {
    const retryBtn = document.getElementById("retryBtn");
    const nextBtn = document.getElementById("nextBtn");
    const savePopup = document.getElementById("savePopup");
    const yesBtn = document.getElementById("yesBtn");
    const noBtn = document.getElementById("noBtn");
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let colors = document.getElementById('color_codes').value
    const palette = document.getElementById("palette");
    const colorType = document.getElementById('personalColorResult').innerText;
    const mood = document.getElementById('description').innerText;
    const goodColor = document.getElementById('goodColor').innerText;
    const badColor = document.getElementById('badColor').innerText;

    console.log(typeof(colors))
    console.log((colors))
    console.log(colors.replace('[[', '').replace(']]', '').split(', '))
    colors = colors.replace('[[', '').replace(']]', '').replace(/'/g, "").split(', ')
    console.log(colors[1])
    console.log(colors)

    // 퍼스널 컬러 결과 명칭 색상 (봄, 여름, 가을, 겨울 키워드별)
    const resultElement = document.querySelector('.result-name');
    if (resultElement) {
        const resultText = resultElement.innerText;

        if (resultText.includes('봄')) resultElement.style.color = '#e68070';      // 봄 대표색
        else if (resultText.includes('여름')) resultElement.style.color = '#3baaae'; // 여름 대표색
        else if (resultText.includes('가을')) resultElement.style.color = '#aa4a44'; // 가을 대표색
        else if (resultText.includes('겨울')) resultElement.style.color = '#760c0c'; // 겨울 대표색
    }

    colors.forEach(color => {
        const circle = document.createElement("div");
        circle.className = "color-circle";
        circle.style.backgroundColor = color;
        circle.title = color; // 마우스 올리면 색 코드 보임
        console.log(color)
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
        window.location.href = "/personalColors/map/"; // 다음 페이지 (날씨) 이동
    });

    // 아니오 버튼 클릭 → 팝업 닫기, 화면 그대로
    noBtn.addEventListener("click", function() {
        savePopup.style.display = "none";
    });
});
