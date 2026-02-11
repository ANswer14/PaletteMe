document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addInfoForm'); // 폼 ID 확인
    const nickInput = document.getElementById('id_nickname');
    const checkBtn = document.getElementById('nickNameCheckBtn');
    const statusMsg = document.getElementById('nickNameStatus');
    const submitBtn = document.getElementById('saveInfoBtn');

    let isNicknameChecked = false; // 중복 확인 통과 여부 플래그

    // 1. 닉네임 입력값이 바뀌면 다시 중복 확인 상태 초기화
    nickInput.addEventListener('input', function() {
        isNicknameChecked = false;
        statusMsg.textContent = ""; // 메시지 초기화
    });

    // 2. 중복 확인 버튼 클릭 이벤트
    checkBtn.addEventListener('click', function() {
        const nickname = nickInput.value.trim();

        if (!nickname) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        // 서버 뷰 호출 (value와 type 파라미터 구조로 통일)
        fetch(`/accounts/check-username/?value=${encodeURIComponent(nickname)}&type=nickname`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    isNicknameChecked = false;
                    statusMsg.textContent = "❌ 이미 사용 중인 닉네임입니다.";
                    statusMsg.style.color = "red";
                } else {
                    isNicknameChecked = true;
                    statusMsg.textContent = "✅ 사용 가능한 닉네임입니다.";
                    statusMsg.style.color = "green";
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("중복 확인 중 오류가 발생했습니다.");
            });
    });

    // 3. 폼 제출 시 최종 확인 (disabled 대신 alert 처리)
    form.addEventListener('submit', function(e) {
        if (!isNicknameChecked) {
            e.preventDefault(); // 제출 중단
            alert("닉네임 중복 확인을 해주세요.");
            nickInput.focus();
            return;
        }
    });
});