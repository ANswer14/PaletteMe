document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signupForm");
    const checkIDBtn = document.getElementById("checkIDBtn");
    const usernameInput = document.getElementById("userID");

    // === 아이디 중복확인 (서버에 요청) ===
    checkIDBtn.addEventListener("click", function () {
        const username = usernameInput.value;

        if (!username) {
            alert("아이디를 입력해주세요.");
            return;
        }

        fetch(`/accounts/check-username?username=${username}`)
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    alert("이미 존재하는 아이디입니다.");
                } else {
                    alert("사용 가능한 아이디입니다!");
                }
            });
    });

    form.addEventListener("submit", function(e) {

        const userID = document.getElementById("userID").value;
        const passwd = document.getElementById("passwd").value;
        const passwdConfirm = document.getElementById("passwdConfirm").value;
        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const gender = document.querySelector('input[name="gender"]:checked');

        //  필수 입력 확인
        if(!userID || !passwd || !passwdConfirm || !name || !phone || !email || !gender){
            alert("모든 항목을 입력해주세요.");
            e.preventDefault(); // 폼 제출 기본 동작 막기
        }

        //  비밀번호 확인 체크
        if(passwd !== passwdConfirm){
            alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            e.preventDefault(); // 폼 제출 기본 동작 막기
        }

         // 회원 정보 저장

        alert("회원가입 성공! 로그인 페이지로 이동합니다.");
    });
});
