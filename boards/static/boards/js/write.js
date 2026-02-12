// DOM이 완전히 로드된 후에만 JS 실행
document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // Elements (HTML 요소들 가져오기)
  // =========================

  // 상단 메인 버튼들 (자유게시판 / QnA)
  const mainBtns = document.querySelectorAll(".main-btn");

  // 각 버튼에 해당하는 서브 메뉴 영역
  const subMenus = document.querySelectorAll(".sub-menu");

  // 제목 입력창
  const titleInput = document.getElementById("title");

  // QnA 라디오 버튼들
  const qnaRadios = document.querySelectorAll("input[name='qna_type']");

  // 본문 textarea
  const bodyTextarea = document.querySelector("textarea[name='body_html']");

  // =========================
  // 이미지 업로드 관련 요소
  // =========================

  const imageInput = document.getElementById("imageInput");         // 파일 선택 input
  const imagePreview = document.getElementById("imagePreview");     // 미리보기 영역
  const uploadEmptyText = document.getElementById("uploadEmptyText"); // "이미지 없음" 텍스트
  const clearImagesBtn = document.getElementById("clearImagesBtn"); // 전체 삭제 버튼

  // =========================
  // 체크박스
  // =========================

  const secretCb = document.querySelector("input[name='is_secret']");
  const anonCb = document.querySelector("input[name='is_anonymous']");


  // ======================================================
  // 메뉴 전환 기능
  // ======================================================

  // 특정 메뉴만 보이게 하고 나머지는 숨김
  function showMenu(id) {
    subMenus.forEach(m => m.classList.remove("show"));
    const target = document.getElementById(id);
    if (target) target.classList.add("show");
  }


  // ======================================================
  // 제목 잠금 / 해제 기능
  // ======================================================

  // 현재 제목이 잠겨있는지 여부
  let isTitleLocked = false;

  // 제목이 잠겨있을 때 입력을 막는 함수
  function blockTyping(e) {
    if (!isTitleLocked) return;  // 잠겨있지 않으면 아무것도 안함
    e.preventDefault();          // 입력 차단
  }

  // 제목을 특정 값으로 고정시키는 함수
  function lockTitleTo(value) {
    if (!titleInput) return;

    titleInput.value = value;            // 제목 자동 입력
    titleInput.readOnly = true;          // 수정 불가
    titleInput.classList.add("locked-title"); // 스타일 적용
    isTitleLocked = true;                // 잠금 상태로 변경
  }

  // 제목 잠금 해제 함수
  function unlockTitle({ clear = false } = {}) {
    if (!titleInput) return;

    if (clear) titleInput.value = "";    // 필요하면 내용 초기화
    titleInput.readOnly = false;         // 다시 수정 가능
    titleInput.classList.remove("locked-title");
    isTitleLocked = false;
    titleInput.focus();
  }

  // 제목이 잠겨있을 때 입력 완전 차단 (키보드 + 붙여넣기 + 드롭)
  if (titleInput) {
    ["keydown", "beforeinput", "paste", "drop"].forEach(evt =>
      titleInput.addEventListener(evt, blockTyping, { passive: false })
    );
  }

  // QnA일 때 라디오 required 처리
  function setQnaRequired(isQna) {
    qnaRadios.forEach(r => {
      r.required = isQna;
      if (!isQna) r.checked = false;
    });
  }

  // 현재 선택된 QnA 라디오 찾기
  function getSelectedQnaRadio() {
    return Array.from(qnaRadios).find(r => r.checked) || null;
  }

  // 선택된 QnA 값에 따라 제목 자동 설정
  function syncTitleByQnaSelection() {
    const selected = getSelectedQnaRadio();

    if (!selected) {
      unlockTitle({ clear: false });
      return;
    }

    if (selected.value === "bug") lockTitleTo("버그 제보");
    if (selected.value === "question") lockTitleTo("사이트 관련 질문");
    if (selected.value === "suggestion") lockTitleTo("건의 사항");
  }

  // 라디오 버튼 변경 시 제목 동기화
  qnaRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      syncTitleByQnaSelection();
    });
  });

  // ======================================================
  // 상단 탭 클릭 시 동작
  // ======================================================

  function setActiveTab(targetId) {

    // 버튼 active 스타일 변경
    mainBtns.forEach(b => b.classList.remove("active"));
    const btn = Array.from(mainBtns).find(b => b.dataset.target === targetId);
    if (btn) btn.classList.add("active");

    // 메뉴 보여주기
    showMenu(targetId);

    const isQna = targetId === "qnaMenu";
    setQnaRequired(isQna);

    if (isQna) {
      syncTitleByQnaSelection(); // QnA면 제목 자동 설정
    } else {
      unlockTitle({ clear: false }); // 자유게시판이면 잠금 해제
    }
  }

  mainBtns.forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.target));
  });

  // ======================================================
  // 이미지 업로드 기능
  // ======================================================

  // 선택된 파일을 JS 배열에 따로 저장
  let selectedFiles = [];

  // 파일 input을 JS 배열 기준으로 다시 세팅
  function rebuildFileInput() {
    if (!imageInput) return;
    const dt = new DataTransfer();
    selectedFiles.forEach(f => dt.items.add(f));
    imageInput.files = dt.files;
  }

  // 이미지가 없을 때 안내 문구 표시
  function syncEmptyText() {
    if (!uploadEmptyText) return;
    uploadEmptyText.style.display = selectedFiles.length ? "none" : "block";
  }

  // 기존 objectURL 메모리 해제
  function clearPreviewObjectUrls(container) {
    if (!container) return;
    container.querySelectorAll("img[data-object-url]").forEach(img => {
      URL.revokeObjectURL(img.dataset.objectUrl);
    });
  }

  // 미리보기 렌더링
  function renderPreviews() {

    if (!imagePreview) return;

    clearPreviewObjectUrls(imagePreview);
    imagePreview.innerHTML = "";

    selectedFiles.forEach((file, idx) => {

      const url = URL.createObjectURL(file); // 임시 URL 생성

      const card = document.createElement("div");
      card.className = "image-card";

      const img = document.createElement("img");
      img.className = "image-thumb";
      img.src = url;
      img.alt = file.name;
      img.dataset.objectUrl = url;

      const name = document.createElement("div");
      name.className = "image-name";
      name.textContent = file.name;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "tool";
      removeBtn.textContent = "삭제";

      // 삭제 버튼 클릭 시
      removeBtn.addEventListener("click", () => {
        URL.revokeObjectURL(url);     // 메모리 해제
        selectedFiles.splice(idx, 1); // 배열에서 제거
        rebuildFileInput();           // input 재구성
        renderPreviews();             // 다시 그림
        syncEmptyText();
      });

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(removeBtn);
      imagePreview.appendChild(card);
    });

    syncEmptyText();
  }

  // 파일 추가
  function addFiles(files) {

    if (!files || !files.length) return;

    for (const f of files) {
      if (!f.type.startsWith("image/")) continue; // 이미지 파일만 허용
      selectedFiles.push(f);
    }

    rebuildFileInput();
    renderPreviews();
  }

  // 파일 선택 시
  if (imageInput) {
    imageInput.addEventListener("change", () => {
      addFiles(Array.from(imageInput.files || []));
      imageInput.value = ""; // 같은 파일 다시 선택 가능
    });
  }

  // 전체 삭제 버튼
  if (clearImagesBtn) {
    clearImagesBtn.addEventListener("click", () => {
      selectedFiles = [];
      if (imagePreview) {
        clearPreviewObjectUrls(imagePreview);
        imagePreview.innerHTML = "";
      }
      rebuildFileInput();
      syncEmptyText();
    });
  }

  // ======================================================
  // 초기 실행
  // ======================================================

  showMenu("freeMenu");     // 기본은 자유게시판
  setQnaRequired(false);    // QnA required 해제
  syncEmptyText();          // 이미지 안내 텍스트 상태 초기화
});
