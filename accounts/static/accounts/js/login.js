document.addEventListener("DOMContentLoaded", function() {
    const idInput = document.getElementById("userID");
    const pwInput = document.getElementById("passwd");
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        // e.preventDefault(); // 폼의 기본 제출(페이지 이동)을 막음
        validateAndSubmit(e);

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
            // response.url을 확인하여 로그인 성공 후 리다이렉트 되었는지 체크
            // 혹은 allauth의 응답 상태(200 OK)를 확인
            alert('response.ok' + response.ok)
            if (response.ok) {
                if (window.opener && !window.opener.closed) {
                    window.opener.location.reload();
                }
                window.close();
            } else {
                // alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
                console.log('login 실패')
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    function validateAndSubmit(e) {
        const username = idInput.value.trim();
        const password = pwInput.value.trim();

        if (!username || !password) {
            e.preventDefault();  // 🔥 폼 제출 막기
            alert("아이디와 비밀번호를 입력하세요.");
            return;
        }

        // 여기까지 오면 → 그냥 allauth가 알아서 로그인 처리함
        console.log("로그인 요청 전송");
    }


    // 엔터키 처리
    pwInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            validateAndSubmit(e);
        }
    });
});