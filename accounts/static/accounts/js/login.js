// login.js

const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', () => {
    const userID = document.getElementById('userID').value;
    const passwd = document.getElementById('passwd').value;

    // 빈칸일 때 서버 요청 방지
    if (!userID || !passwd) {
        alert("아이디와 비밀번호를 모두 입력해주세요.");
        return;
    }

    const isSuccess = true; // 서버에서 받아온 결과가 성공이라면

    if (isSuccess) {
        // 부모 창(index.html)이 살아있는지 확인 후 새로고침
        if (window.opener && !window.opener.closed) {
            window.opener.location.reload();
        }

        // 현재 팝업창을 닫음
        window.close();
    } else {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
    }
});