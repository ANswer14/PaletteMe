document.addEventListener("DOMContentLoaded", function () {
    // 1. 요소 선택
    const nicknameInput = document.getElementById('nickname');
    const nickNameCheckBtn = document.getElementById('nickNameCheckBtn');
    const nickNameStatus = document.getElementById('nickNameStatus');
    const phoneInput = document.getElementById('phone');
    const saveInfoBtn = document.getElementById('saveInfoBtn');

    // 팝업은 '새로운 정보'를 쓰는 것이므로 초기값은 false
    let isNickNameChecked = false;

    // 2. 닉네임 중복 확인 (mypage.js 방식 계승)
    nickNameCheckBtn.onclick = function() {
        const value = nicknameInput.value.trim();
        const url = this.getAttribute("data-url") || "/accounts/check-nickname/";

        if (!value) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        fetch(`${url}?nickname=${encodeURIComponent(value)}`)
            .then(res => res.json())
            .then(data => {
                if (data.isDuplicate) {
                    nickNameStatus.innerText = "이미 사용 중인 닉네임입니다.";
                    nickNameStatus.style.color = "#d9534f"; // 마이페이지 danger 색상
                    isNickNameChecked = false;
                } else {
                    nickNameStatus.innerText = "사용 가능한 닉네임입니다.";
                    nickNameStatus.style.color = "blue"; // 마이페이지 성공 색상
                    isNickNameChecked = true;
                }
            })
            .catch(err => {
                console.error("중복 확인 중 오류 발생:", err);
                alert("서버 통신 중 오류가 발생했습니다.");
            });
    };

    // 입력 값이 바뀌면 중복확인 초기화
    nicknameInput.oninput = () => {
        isNickNameChecked = false;
        nickNameStatus.innerText = "";
    };

    // 3. 정보 저장 (saveInfoBtn 변수 활성화)
    saveInfoBtn.onclick = function () {
        const genderChecked = document.querySelector('input[name="gender"]:checked');
        const phone = phoneInput.value.trim();

        // 유효성 검사
        if (!isNickNameChecked) {
            alert("닉네임 중복 확인을 먼저 완료해주세요.");
            return;
        }
        if (!phone) {
            alert("휴대폰 번호를 입력해주세요.");
            return;
        }
        if (!genderChecked) {
            alert("성별을 선택해주세요.");
            return;
        }

        if (!confirm("입력하신 정보로 저장을 완료하시겠습니까?")) return;

        // 폼 데이터를 서버로 전송 (이 부분은 프로젝트의 백엔드 처리 방식에 맞게 조정)
        // 예: document.getElementById('addInfoForm').submit();
        alert("정보 저장이 완료되었습니다!");
        window.location.href = "/"; // 메인 페이지로 이동
    };
});