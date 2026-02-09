document.addEventListener("DOMContentLoaded", () => {
  // ===== 필수 요소 =====
  const postForm = document.getElementById("postForm");

  const editor = document.getElementById("editor");
  const toolbar = document.getElementById("toolbar");

  const fontSizeSelect = document.getElementById("fontSize");
  const fontColorInput = document.getElementById("fontColor");
  const removeStyleBtn = document.getElementById("removeStyle");

  const contentInput = document.getElementById("contentInput");
  const currentCountEl = document.getElementById("currentCount");
  const maxCountEl = document.getElementById("maxCount");
  const MAX_COUNT = parseInt(maxCountEl?.innerText || "2000", 10);

  // 탭/패널
  const tabWrite = document.getElementById("tabWrite");
  const tabPreview = document.getElementById("tabPreview");
  const writePane = document.getElementById("writePane");
  const previewPane = document.getElementById("previewPane");
  const previewContent = document.getElementById("previewContent");

  // 이미지
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");
  const uploadEmptyText = document.getElementById("uploadEmptyText");
  const clearImagesBtn = document.getElementById("clearImagesBtn");

  if (!editor || !toolbar) return;

  // ===== 선택 저장/복원 (중요: 드롭다운 클릭하면 선택이 풀리는 문제 해결) =====
  let savedRange = null;

  function saveSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRange = range;
    }
  }

  function restoreSelection() {
    if (!savedRange) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(savedRange);
    return true;
  }

  function applyStyleToSelection(styleObj) {
    if (!restoreSelection()) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement("span");
    Object.assign(span.style, styleObj);

    span.appendChild(range.extractContents());
    range.insertNode(span);

    // 커서 span 뒤로
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    saveSelection();
    updateCount();
  }

  // 선택 변화 저장
  document.addEventListener("selectionchange", saveSelection);

  // ⭐ 툴바에서 버튼 눌렀을 때만 preventDefault (select/color는 열리게 둠)
  toolbar.addEventListener("mousedown", (e) => {
    saveSelection();

    const isSelectOrColor =
      e.target.matches("select") || e.target.matches('input[type="color"]');

    if (!isSelectOrColor) {
      e.preventDefault(); // 버튼 클릭 시 포커스 이동 방지
      editor.focus();
      restoreSelection();
    }
  });

  // 글씨크기
  fontSizeSelect?.addEventListener("change", (e) => {
    applyStyleToSelection({ fontSize: e.target.value });
    editor.focus();
  });

  // 글씨색
  fontColorInput?.addEventListener("input", (e) => {
    applyStyleToSelection({ color: e.target.value });
    editor.focus();
  });

  // 서식제거: 선택 범위 안의 span만 풀기
  removeStyleBtn?.addEventListener("click", () => {
    if (!restoreSelection()) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const frag = range.extractContents();

    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_ELEMENT);
    const unwrapTargets = [];
    while (walker.nextNode()) {
      const el = walker.currentNode;
      if (el.tagName === "SPAN") unwrapTargets.push(el);
    }

    unwrapTargets.forEach((span) => {
      const parent = span.parentNode;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    });

    range.insertNode(frag);
    sel.removeAllRanges();
    sel.addRange(range);

    saveSelection();
    updateCount();
    editor.focus();
  });

  // ===== 글자수 카운트 =====
  function getPlainTextLength() {
    return (editor.innerText || "").trimEnd().length;
  }

  function updateCount() {
    const len = getPlainTextLength();
    if (currentCountEl) currentCountEl.innerText = String(len);
  }

  editor.addEventListener("input", updateCount);
  updateCount();

  // ===== 탭(작성/미리보기) =====
  function setActiveTab(which) {
    if (!tabWrite || !tabPreview || !writePane || !previewPane) return;

    if (which === "write") {
      tabWrite.classList.add("active");
      tabPreview.classList.remove("active");
      writePane.classList.add("active");
      previewPane.classList.remove("active");
      editor.focus();
    } else {
      tabWrite.classList.remove("active");
      tabPreview.classList.add("active");
      writePane.classList.remove("active");
      previewPane.classList.add("active");

      // 미리보기 내용 반영
      if (previewContent) previewContent.innerHTML = editor.innerHTML || "";
    }
  }

  tabWrite?.addEventListener("click", () => setActiveTab("write"));
  tabPreview?.addEventListener("click", () => setActiveTab("preview"));

  // ===== 이미지 업로드/미리보기 (네 CSS 구조에 맞춤) =====
  let selectedFiles = [];

  function syncEmptyText() {
    if (!uploadEmptyText) return;
    uploadEmptyText.style.display = selectedFiles.length ? "none" : "block";
  }

  function rebuildFileInput() {
    const dt = new DataTransfer();
    selectedFiles.forEach((f) => dt.items.add(f));
    imageInput.files = dt.files;
  }

  function renderPreviews() {
    if (!imagePreview) return;
    imagePreview.innerHTML = "";

    selectedFiles.forEach((file, idx) => {
      const url = URL.createObjectURL(file);

      const card = document.createElement("div");
      card.className = "image-card";

      const img = document.createElement("img");
      img.className = "image-thumb";
      img.src = url;
      img.alt = file.name;

      const name = document.createElement("div");
      name.className = "image-name";
      name.innerText = file.name;

      const actions = document.createElement("div");
      actions.className = "image-card-actions";

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "tool";
      removeBtn.innerText = "삭제";
      removeBtn.addEventListener("click", () => {
        selectedFiles.splice(idx, 1);
        rebuildFileInput();
        renderPreviews();
      });

      actions.appendChild(removeBtn);

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(actions);

      imagePreview.appendChild(card);
    });

    syncEmptyText();
  }

  imageInput?.addEventListener("change", () => {
    const files = Array.from(imageInput.files || []);
    selectedFiles = selectedFiles.concat(files);
    rebuildFileInput();
    renderPreviews();
  });

  clearImagesBtn?.addEventListener("click", () => {
    selectedFiles = [];
    rebuildFileInput();
    renderPreviews();
  });

  syncEmptyText();

  // ===== 제출 시 contentInput에 HTML 저장 =====
  postForm?.addEventListener("submit", (e) => {
    const len = getPlainTextLength();

    if (len < 10) {
      e.preventDefault();
      alert("내용은 10자 이상 입력해주세요.");
      setActiveTab("write");
      return;
    }
    if (len > MAX_COUNT) {
      e.preventDefault();
      alert(`내용은 ${MAX_COUNT}자 이내로 입력해주세요.`);
      setActiveTab("write");
      return;
    }

    if (contentInput) contentInput.value = editor.innerHTML;
  });
});
