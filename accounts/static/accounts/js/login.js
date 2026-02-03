document.addEventListener("DOMContentLoaded", function() {
    const idInput = document.getElementById("userID");
    const pwInput = document.getElementById("passwd");
    const loginBtn = document.getElementById("loginBtn");

    function login()
    {
        const id=idInput.value;
        const pw=pwInput.value;
        if(id==="admin" && pw==="1234")
        {
            //document.getElementById("login").style.display="none";
            //document.getElementById("main").style.display="block";
            localStorage.setItem("isLoggedIn", "true"); // 로그인 상태 저장
            localStorage.setItem("userID", id);         // 아이디 저장
            alert("로그인 성공!");
        }
        else
        {
            alert("아이디 혹은 비밀번호가 틀렸습니다.");
        }

    }
    loginBtn.addEventListener("click", login);
    pwInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            login();
        }
    });

});