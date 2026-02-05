// static/js/index.js

function loginRequired() {
    if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        window.location.href = '/account/login/';
    }
}