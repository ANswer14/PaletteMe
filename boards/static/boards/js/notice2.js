/*
  Django URL 기준:
  /boards/notice/detail/1/
  /boards/notice/detail/2/
*/

// 1️⃣ 현재 URL에서 번호(no) 추출
const pathParts = window.location.pathname.split("/").filter(Boolean);
// ["boards", "notice", "detail", "1"]
const no = parseInt(pathParts[pathParts.length - 1]);

// 2️⃣ 임시 공지 데이터 (나중에 DB로 대체)
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

// 3️⃣ 유효성 체크
if (!notices[no]) {
    alert("존재하지 않는 공지입니다.");
    window.location.href = "/boards/notice/";
}

// 4️⃣ 화면에 데이터 출력
document.getElementById("detailNo").innerText = no;
document.getElementById("detailTitle").innerText = notices[no].title;
document.getElementById("detailDate").innerText = notices[no].date;
document.getElementById("detailContent").innerText = notices[no].content;

// 5️⃣ 버튼 동작 (전부 Django URL 기준)

// 목록으로
function goList() {
    window.location.href = "/boards/notice/";
}

// 이전글
function goPrev() {
    if (notices[no - 1]) {
        window.location.href = `/boards/notice/detail/${no - 1}/`;
    } else {
        alert("이전 글이 없습니다.");
    }
}

// 다음글
function goNext() {
    if (notices[no + 1]) {
        window.location.href = `/boards/notice/detail/${no + 1}/`;
    } else {
        alert("다음 글이 없습니다.");
    }
}
