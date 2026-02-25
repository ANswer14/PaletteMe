/**
 * QnA 상세 페이지 이동 함수 (통합본)
 */
function goQnADetail(event, postId, isSecret, authorNickname) {
    const params = new URLSearchParams(window.location.search);
    const currentPage = params.get("page") || 1;

    // 1. Django 템플릿 변수를 통해 현재 사용자 정보 가져오기
    const currentUserNickname = "{{ user.nickname|default:'' }}";
    const isStaff = "{{ user.is_staff|yesno:'true,false' }}" === "true";
    const targetRow = event.currentTarget;

    // 2. 비밀글 권한 체크 (비밀글이면서 + 관리자가 아니고 + 작성자 본인도 아닌 경우)
    if (isSecret && !isStaff && currentUserNickname !== authorNickname) {
        // 시각적 피드백: 행 흔들기 효과 추가
        targetRow.classList.add('shake-effect');

        Swal.fire({
            icon: 'lock',
            iconColor: '#f39898',
            title: '잠겨있는 글입니다',
            text: '비밀글은 작성자 본인만 확인할 수 있습니다.',
            confirmButtonText: '확인',
            confirmButtonColor: '#f39898',
        });

        // 0.5초 후 흔들기 효과 제거
        setTimeout(() => {
            targetRow.classList.remove('shake-effect');
        }, 500);
        return;
    }

    // 3. 권한 통과 시 시각적 강조 후 상세 페이지로 이동
    targetRow.style.backgroundColor = "#fff0f0";
    setTimeout(() => {
        // urls.py에 정의된 /boards/qnaDetail/ 경로로 이동
        location.href = `/boards/qnaDetail/?no=${postId}&page=${currentPage}`;
    }, 150);
}