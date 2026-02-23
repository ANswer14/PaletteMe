// static/js/index.js

function loginRequired() {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        openLoginPopup('/accounts/login/'); //로그인창 팝업
    }
}

// 팝업창 열기 함수 (모니터길이/2 - 팝업창길이/2)
function openLoginPopup(url) {
    const width = 450;
    const height = 600;

    // 화면 중앙 계산
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    // 1. 창을 열고 변수에 담기
    const loginWin = window.open(
        url,
        "loginPopup",
        `width=${width}, height=${height}, top=${top}, left=${left}, scrollbars=no, resizable=no`
    );

    // 2. 팝업 차단 여부 확인
    if (!loginWin) {
        // 창이 열리지 않았다면 (null 이라면)
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해야 로그인이 가능합니다.');
    }
}

// 이미지 팝업 함수
function openImagePopup(imgUrl) {
    const width = 600;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    // 1. 새 창 열기 시도
    const newWindow = window.open(
        '',
        'ImagePreview',
        `width=${width}, height=${height}, left=${left}, top=${top}, scrollbars=no, resizable=no`
    );

    // 2. 팝업 차단 여부 체크 (안전 장치)
    if (newWindow) {
        // 창이 성공적으로 열렸을 때만 실행
        newWindow.document.write(`
            <html>
                <head>
                    <title>프로필 크게 보기</title>
                    <style>
                        body { margin: 0; display: flex; justify-content: center; align-items: center; background: #222; height: 100vh; overflow: hidden; }
                        img { max-width: 95%; max-height: 95%; box-shadow: 0 0 20px rgba(0,0,0,0.5); border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <img src="${imgUrl}" alt="확대된 프로필">
                </body>
            </html>
        `);
        newWindow.document.close();  // 브라우저가 계속 페이지를 로딩 중인 상태 방지
    } else {
        // 팝업이 차단되었을 때 알림
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
    }
}

// 소셜 로그인 성공 시 index.html에서 새로고침
window.addEventListener('storage',(e) => {
    if (e.key === 'refreshParent' && e.newValue === 'true') {
        location.href="/";
    }
});

// index.html 이 켜질때 refreshParent가 존재하면 삭제
window.onload = function () {
    if (localStorage.getItem('refreshParent')){
        localStorage.removeItem('refreshParent')
    }
};