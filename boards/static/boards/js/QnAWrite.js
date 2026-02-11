document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("qnaForm");
  const titleEl = document.getElementById("title");

  const editor = document.getElementById("editor");
  const contentInput = document.getElementById("contentInput");

  const currentCountEl = document.getElementById("currentCount");
  const maxCountEl = document.getElementById("maxCount");
  const MAX_COUNT = parseInt(maxCountEl?.innerText || "2000", 10);

  // 탭 UI
  const tabWrite = document.getElementById("tabWrite");
  const tabPreview = document.getElementById("tabPreview");
  const writePane = document.getElementById("writePane");
  const previewPane = document.getElementById("previewPane");
  const previewContentTab = document.getElementById("previewContentTab");

  // 툴바
  const toolbar = document.getElementById("toolbar");
  const fontColorInput = document.getElementById("fontColor");
  const fontSizeSelect = document.getElementById("fontSize");
  const removeStyleBtn = document.getElementById("removeStyle");

  // 모달 미리보기
  const previewBtn = document.getElementById("previewBtn");
  const previewModal = document.getElementById("previewModal");
  const closePreview = document.getElementById("closePreview");
  const closePreviewBtn = document.getElementById("closePreviewBtn");
  const previewTitle = document.getElementById("previewTitle");
  const previewContentModal = document.getElementById("previewContentModal");
  const previewImages = document.getElementById("previewImages");

  // 이미지
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");
  const uploadEmptyText = document.getElementById("uploadEmptyText");
  const clearImagesBtn = document.getElementById("clearImagesBtn");

  if (!form || !editor || !contentInput) return;

  // ---------- selection 저장/복원 ----------
  let savedRange = null;

  function saveSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) savedRange = range;
  }

  function restoreSelection() {
    if (!savedRange) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(savedRange);
    return true;
  }

  document.addEventListener("selectionchange", saveSelection);

  // 툴바 클릭 시 selection 유지
  toolbar?.addEventListener("mousedown", (e) => {
    saveSelection();
    const isSelectOrColor =
      e.target.matches("select") || e.target.matches('input[type="color"]');
    if (!isSelectOrColor) {
      e.preventDefault();
      editor.focus();
      restoreSelection();
    }
  });

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

    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    saveSelection();
    updateCount();
  }

  fontColorInput?.addEventListener("input", (e) => {
    applyStyleToSelection({ color: e.target.value });
    editor.focus();
  });

  fontSizeSelect?.addEventListener("change", (e) => {
    applyStyleToSelection({ fontSize: e.target.value });
    editor.focus();
  });

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

  // ---------- 글자수 ----------
  function plainLength() {
    return (editor.innerText || "").trimEnd().length;
  }

  function updateCount() {
    const len = plainLength();
    if (currentCountEl) currentCountEl.innerText = String(len);
  }

  editor.addEventListener("input", updateCount);
  updateCount();

  // ---------- 탭 미리보기 ----------
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
      if (previewContentTab) previewContentTab.innerHTML = editor.innerHTML || "";
    }
  }

  tabWrite?.addEventListener("click", () => setActiveTab("write"));
  tabPreview?.addEventListener("click", () => setActiveTab("preview"));

  // ---------- 이미지 미리보기 ----------
  let selectedFiles = [];

  function syncEmptyText() {
    if (!uploadEmptyText) return;
    uploadEmptyText.style.display = selectedFiles.length ? "none" : "block";
  }

  function rebuildFileInput() {
    if (!imageInput) return;
    const dt = new DataTransfer();
    selectedFiles.forEach((f) => dt.items.add(f));
    imageInput.files = dt.files;
  }

  function renderPreviews(container, files) {
    if (!container) return;
    container.innerHTML = "";

    files.forEach((file, idx) => {
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
        renderPreviews(imagePreview, selectedFiles);
        syncEmptyText();
      });

      actions.appendChild(removeBtn);

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(actions);

      container.appendChild(card);
    });
  }

  imageInput?.addEventListener("change", () => {
    const files = Array.from(imageInput.files || []);
    selectedFiles = selectedFiles.concat(files);
    rebuildFileInput();
    renderPreviews(imagePreview, selectedFiles);
    syncEmptyText();
  });

  clearImagesBtn?.addEventListener("click", () => {
    selectedFiles = [];
    rebuildFileInput();
    renderPreviews(imagePreview, selectedFiles);
    syncEmptyText();
  });

  syncEmptyText();

  // ---------- 모달 미리보기 ----------
  function openModal() {
    if (!previewModal) return;
    previewModal.classList.add("open");
    previewModal.setAttribute("aria-hidden", "false");

    if (previewTitle) previewTitle.innerText = (titleEl?.value || "").trim();
    if (previewContentModal) previewContentModal.innerHTML = editor.innerHTML || "";

    if (previewImages) {
      previewImages.innerHTML = "";
      selectedFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        const img = document.createElement("img");
        img.className = "image-thumb";
        img.src = url;
        img.alt = file.name;
        previewImages.appendChild(img);
      });
    }
  }

  function closeModal() {
    if (!previewModal) return;
    previewModal.classList.remove("open");
    previewModal.setAttribute("aria-hidden", "true");
  }

  previewBtn?.addEventListener("click", openModal);
  closePreview?.addEventListener("click", closeModal);
  closePreviewBtn?.addEventListener("click", closeModal);

  // ---------- submit: 검증 + hidden 채우기 ----------
  form.addEventListener("submit", (e) => {
    const title = (titleEl?.value || "").trim();
    const len = plainLength();

    if (!title) {
      e.preventDefault();
      alert("제목을 입력해주세요.");
      return;
    }
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

    contentInput.value = editor.innerHTML;
  });
});
