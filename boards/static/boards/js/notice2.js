// 주소에서 ?no=1 이런 값 가져오기
const params = new URLSearchParams(window.location.search);
// 값이 없거나 숫자가 아니면 일단 0으로 처리
const no = parseInt(params.get("no")) || 0;

// 임시 공지 데이터 (나중에 DB로 바뀜)
const notices = {
    1: {
        title: "서비스 오픈 안내드립니다.",
        date: "2026-02-02",
        content: "저희 AI 코디 추천 서비스가 정식으로 오픈되었습니다. 많은 이용 부탁드립니다."
    },
    2: {
        title: "퍼스널컬러 진단 기능 업데이트",
        date: "2026-02-01",
        content: "퍼스널컬러 진단 정확도가 향상되었습니다."
    },
    3: {
        title: "날씨 기반 코디 추천 기능 추가",
        date: "2026-01-30",
        content: "이제 날씨 정보를 활용하여 코디를 추천해드립니다."
    }
};

// 화면에 넣기 전 데이터 존재 여부 확인
if (notices[no]) {
    document.getElementById("detailNo").innerText = no;
    document.getElementById("detailTitle").innerText = notices[no].title;
    document.getElementById("detailDate").innerText = notices[no].date;
    document.getElementById("detailContent").innerText = notices[no].content;
} else {
    // 데이터가 없는 번호로 들어왔을 때 알림 후 목록으로 이동(예외처리)
    alert("존재하지 않는 게시글입니다.");
    location.href = "notice1.html";
}

// 목록으로 버튼
function goList() {
    window.location.href = "notice1.html";
}
function goPrev() {
    if (notices[no - 1]) {
        window.location.href = "notice2.html?no=" + (no - 1);
    } else {
        alert("이전 글이 없습니다.");
    }
}

function goNext() {
    if (notices[no + 1]) {
        window.location.href = "notice2.html?no=" + (no + 1);
    } else {
        alert("다음 글이 없습니다.");
    }
}
