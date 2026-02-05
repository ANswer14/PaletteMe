// static/js/index.js

function loginRequired() {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        openLoginPopup('/account/login/'); //로그인창 팝업
    }
}

// 팝업창 열기 함수 (모니터길이/2 - 팝업창길이/2)
function openLoginPopup(url) {
    const width = 450;
    const height = 600;

    // 화면 중앙 계산
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    window.open(
        url,
        "loginPopup",
        `width=${width}, height=${height}, top=${top}, left=${left}, scrollbars=no, resizable=no`
    );
}