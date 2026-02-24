// 페이지 로드 시 또는 작업 시작 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const pollInterval = setInterval(checkStatus, 1000); // 라이브 프리뷰를 위해 주기를 0.8~1초로 짧게 설정
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const favorBtn = document.getElementById('favorBtn');
    favorBtn.disabled = true

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
                    document.getElementById('outerItem').innerHTML = `<a href='${data.recommendations[0].url}' target='blank'>${data.descriptionDetail.outer}</a>`
                    document.getElementById('topItem').innerHTML = `<a href='${data.recommendations[1].url}' target='blank'>${data.descriptionDetail.top}</a>`
                    document.getElementById('bottomItem').innerHTML = `<a href='${data.recommendations[2].url}' target='blank'>${data.descriptionDetail.pants}</a>`
                    document.getElementById('shoesItem').innerHTML = `<a href='${data.recommendations[3].url}' target='blank'>${data.descriptionDetail.shoes}</a>`
                    favorBtn.disabled = false
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

    favorBtn.addEventListener('click', async function() {
        if(confirm('즐겨찾기로 등록 하시겠습니까?')) {
            const response = await fetch('/personalColors/saveFavorite/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken, // CSRF 토큰 함수 필요
                },
            });
            // 3. 서버로부터 받은 JSON 응답 처리
            let result = await response.json();
            if (result.status === 'success') {
                alert('저장 성공!')
            } else {
                alert("저장 실패")
            }
        }
    });

    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';/*현재 웹사이트가 보안 연결(https) 중인지 일반 연결(http) 중인지 확인함. 보안 사이트에서는 웹소켓도 wss로 받아야 하기 때문*/
    const socket = new WebSocket(wsProtocol + window.location.host + '/ws/generation/'); /*소켓 주소 설정 및 연결 생성. routing.py에 정의된 경로가 해당 요청을 받게 됨*/
//     (wss:// OR ws://)127.0.0.1:8000/ws/generation/으로 웹 소켓 연결

    socket.onopen = function() {
        console.log("서버와 웹소켓 연결이 완료되었습니다. 이제 이탈 감지가 가능합니다.");
    };

    socket.onclose = function() {
        console.log("서버와의 연결이 끊겼습니다.");
    };
});