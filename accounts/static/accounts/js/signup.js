document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signupForm");
    const checkIDBtn = document.getElementById("checkIDBtn");
    const userIDInput = document.getElementById("userID");

    let isIDChecked = false; // 중복확인 했는지 여부
    // 아이디 입력 바뀌면 다시 false로 초기화
    userIDInput.addEventListener("input", () => {
        isIDChecked = false;
    });

    // 중복확인 버튼 클릭 이벤트
    checkIDBtn.addEventListener("click", function() {
        const userID = userIDInput.value;
        if(!userID){
            alert("아이디를 입력해주세요.");
            return;
        }

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        if(users.some(u => u.userID === userID)){
            alert("이미 존재하는 아이디입니다.");
        } else {
            alert("사용 가능한 아이디입니다!");
        }
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault(); // 폼 제출 기본 동작 막기

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
            return;
        }

        //  비밀번호 확인 체크
        if(passwd !== passwdConfirm){
            alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        // 중복확인 버튼 체크
        if(!isIDChecked){
            alert("아이디 중복확인을 해주세요!");
            return;
        }

         // 회원 정보 저장
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = { userID, passwd, name, phone, email, gender: gender.value };

        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));

        alert("회원가입 성공! 로그인 페이지로 이동합니다.");
        location.href = "../login/login.html"; // 로그인 페이지로 이동
    });
});
