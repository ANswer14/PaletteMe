// 페이지 로드 시 또는 작업 시작 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const pollInterval = setInterval(checkStatus, 800); // 라이브 프리뷰를 위해 주기를 0.8~1초로 짧게 설정

    function checkStatus() {
        fetch('/personalColors/checkStatus/')
            .then(response => response.json())
            .then(data => {
                const imgElement = document.getElementById('output-image');
                const progressFill = document.getElementById('progress-bar-fill');

                if (data.status === 'processing') {
                    // 1. 진행률 바 업데이트 (CSS width 조절)
                    if (data.progress) {
                        const percent = Math.round(data.progress * 100);
                        progressFill.style.width = percent + '%';
                    }

                    // 2. 라이브 프리뷰 이미지 교체
                    if (data.current_image) {
                        // SD WebUI의 preview는 접두어 없이 올 수 있으므로 체크 후 삽입
                        imgElement.src = `data:image/png;base64,${data.current_image}`;
                    }
                }
                else if (data.status === 'completed') {
                    // 3. 최종 고화질 이미지로 교체 및 종료
                    clearInterval(pollInterval);
                    imgElement.src = `data:image/png;base64,${data.image}`;
                    document.getElementById('loading').innerText = '';
                    document.getElementById('description').innerText = data.description;
                    document.getElementById('outerItem').innerHTML = `<a href=${data.recommendations[0].url} target='blank'>${data.descriptionDetail.outer}</a>`
                    document.getElementById('topItem').innerHTML = `<a href=${data.recommendations[1].url} target='blank'>${data.descriptionDetail.top}</a>`
                    document.getElementById('bottomItem').innerHTML = `<a href=${data.recommendations[2].url} target='blank'>${data.descriptionDetail.pants}</a>`
                    document.getElementById('shoesItem').innerHTML = `<a href=${data.recommendations[3].url} target='blank'>${data.descriptionDetail.shoes}</a>`
                }
            });
    }

    function displayResult(data) {
        // 로딩창 숨기기
        document.getElementById('loading-container').style.display = 'none';
        
        // 결과 채우기 및 보여주기
        const imgElement = document.getElementById('output-image');
        // Base64 데이터를 이미지 소스로 넣기 (data:image/png;base64, 형태)
        imgElement.src = `data:image/png;base64,${data.image}`;
        
        document.getElementById('output-description').innerText = data.description;
        document.getElementById('result-container').style.display = 'block';
        document.getElementById('startAI').submit();
    }
});