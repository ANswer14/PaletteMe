document.addEventListener("DOMContentLoaded", function() {
    const idInput = document.getElementById("userID");
    const pwInput = document.getElementById("passwd");
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        // 1. 일단 브라우저의 기본 제출(페이지 새로고침)을 무조건 막습니다.
        e.preventDefault();

        const username = idInput.value.trim();
        const password = pwInput.value.trim();

        // 2. 유효성 검사
        if (!username || !password) {
            alert("아이디와 비밀번호를 입력하세요.");
            return;
        }

        console.log("로그인 요청 전송 시작");

        // 3. 데이터 준비 및 전송
        const formData = new FormData(this);

        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                // 이 헤더가 있어야 Django에서 CSRF 검사를 통과하고 AJAX임을 인지함
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        .then(response => {
            if (response.ok) {
                // 로그인 성공 시 부모 창 새로고침 후 팝업 닫기
                if (window.opener && !window.opener.closed) {
                    // 부모 창의 위치를 메인 페이지('/')로 변경
                    window.opener.location.href = "/";
                }
                window.close();
                location.href="/"
            }
            else {
                alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});

// 계정 없어서 "회원가입" 글자 눌렀을떄
function goToSignup(signupUrl) {
    // 부모 창(메인 창) 열기
    if (window.opener && !window.opener.closed) {
        window.opener.location.href = signupUrl;
        // 팝업창은 닫기
        window.close();
    } else {
        // 혹시 부모 창을 실수로 껐다면, 그냥 현재 팝업창에서 이동
        location.href = signupUrl;
    }
}