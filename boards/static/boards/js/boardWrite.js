// boards/static/boards/js/boardWrite.js
// ✅ Django 저장용: hidden 채우고 form.submit()으로 실제 제출
let quill = null;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postForm");
  const titleEl = document.getElementById("postTitle");

  const editorWrap = document.getElementById("editorWrap");
  const editorEl = document.getElementById("editor");

  const fallbackWrap = document.getElementById("fallbackWrap");
  const fallbackEl = document.getElementById("postContentFallback");

  const hiddenHtml = document.getElementById("postContentHtml");

  const imageInput = document.getElementById("imageInput");
  const dropZone = document.getElementById("dropZone");
  const toastEl = document.getElementById("toast");

  const colorPicker = document.getElementById("colorPicker");
  const clearFormatBtn = document.getElementById("clearFormatBtn");

  const isSecret = document.getElementById("isSecret");
  const isAnonymous = document.getElementById("isAnonymous");
  const hiddenSecret = document.getElementById("postIsSecret");
  const hiddenAnon = document.getElementById("postIsAnonymous");

  const initialHtml = document.getElementById("initialHtml")?.value || "";

  // 체크박스 → hidden 동기화(없어도 안전)
  const syncFlags = () => {
    if (hiddenSecret && isSecret) hiddenSecret.value = isSecret.checked ? "1" : "0";
    if (hiddenAnon && isAnonymous) hiddenAnon.value = isAnonymous.checked ? "1" : "0";
  };
  isSecret?.addEventListener("change", syncFlags);
  isAnonymous?.addEventListener("change", syncFlags);
  syncFlags();

  // Quill 없으면 fallback textarea 사용
  if (!window.Quill) {
    if (initialHtml && fallbackEl && !fallbackEl.value) {
      // HTML -> 대충 텍스트로
      fallbackEl.value = initialHtml
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "");
    }
    return;
  }

  // Quill 있으면 fallback 숨기고 editor 사용
  try {
    if (editorWrap) editorWrap.style.display = "block";
    if (fallbackWrap) fallbackWrap.style.display = "none";

    const Parchment = Quill.import("parchment");
    const SizeStyle = new Parchment.Attributor.Style("size", "font-size", {
      scope: Parchment.Scope.INLINE,
      whitelist: ["14px","16px","18px","20px","24px","28px","32px"],
    });
    Quill.register(SizeStyle, true);

    quill = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: {
          container: "#toolbar",
          handlers: {
            image: () => imageInput?.click(),
          },
        },
        clipboard: { matchVisual: false },
      },
      placeholder: "내용을 입력하세요...",
    });

    if (initialHtml) quill.root.innerHTML = initialHtml;

    colorPicker?.addEventListener("input", () => {
      if (!quill) return;
      quill.format("color", colorPicker.value);
      quill.focus();
    });

    clearFormatBtn?.addEventListener("click", () => {
      if (!quill) return;
      const range = quill.getSelection(true);
      if (!range) return;
      if (range.length === 0) quill.removeFormat(range.index, 1, "user");
      else quill.removeFormat(range.index, range.length, "user");
      quill.focus();
      showToast("서식을 제거했어요.");
    });

    imageInput?.addEventListener("change", async () => {
      const file = (imageInput.files || [])[0];
      if (!file) return;
      try {
        await insertImageFile(file);
      } finally {
        imageInput.value = "";
      }
    });

    if (dropZone) {
      const prevent = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
      ["dragenter","dragover"].forEach((t) => dropZone.addEventListener(t, (ev) => {
        prevent(ev);
        dropZone.classList.add("is-over");
      }));
      ["dragleave","drop"].forEach((t) => dropZone.addEventListener(t, (ev) => {
        prevent(ev);
        dropZone.classList.remove("is-over");
      }));
      dropZone.addEventListener("drop", async (ev) => {
        const file = (ev.dataTransfer?.files || [])[0];
        if (!file) return;
        await insertImageFile(file);
      });
      dropZone.addEventListener("click", () => imageInput?.click());
      dropZone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") imageInput?.click();
      });
    }

    document.addEventListener("paste", async (e) => {
      if (!quill) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const imgItem = Array.from(items).find((it) => it.type.startsWith("image/"));
      if (!imgItem) return;
      const file = imgItem.getAsFile();
      if (!file) return;
      await insertImageFile(file);
      e.preventDefault();
    });

    async function insertImageFile(file) {
      if (!quill) return;
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 첨부할 수 있어요.");
        return;
      }
      const maxMB = 3;
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxMB) {
        alert(`이미지가 너무 커요. (${maxMB}MB 이하로 올려주세요)`);
        return;
      }
      const dataUrl = await readAsDataURL(file);
      const range = quill.getSelection(true);
      const index = range ? range.index : quill.getLength();
      quill.insertEmbed(index, "image", dataUrl, "user");
      quill.insertText(index + 1, "\n", "user");
      quill.setSelection(index + 2, 0, "user");
      quill.focus();
      showToast("이미지를 삽입했어요 ✅");
    }

    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      window.clearTimeout(showToast._t);
      showToast._t = window.setTimeout(() => toastEl.classList.remove("show"), 1400);
    }
  } catch (err) {
    console.error("Quill 초기화 실패:", err);
    quill = null;
    if (editorWrap) editorWrap.style.display = "none";
    if (fallbackWrap) fallbackWrap.style.display = "block";
  }

  // 안전: 엔터로 폼 submit 시에도 hidden 채우기
  form?.addEventListener("submit", () => {
    if (quill && hiddenHtml) hiddenHtml.value = quill.root.innerHTML.trim();
  });
});

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// HTML onsubmit에서 호출
function submitPost() {
  const form = document.getElementById("postForm");
  const titleEl = document.getElementById("postTitle");
  const hiddenEl = document.getElementById("postContentHtml");
  const fallbackEl = document.getElementById("postContentFallback");

  const title = (titleEl?.value || "").trim();

  let text = "";
  let html = "";

  if (quill) {
    text = quill.getText().trim();
    html = quill.root.innerHTML.trim();
  } else {
    text = (fallbackEl?.value || "").trim();
    html = (fallbackEl?.value || "").replace(/\n/g, "<br>");
  }

  if (!title || !text) {
    alert("제목과 내용을 입력해주세요.");
    return false;
  }

  if (hiddenEl) hiddenEl.value = html;

  form?.submit();
  return false;
}

function cancelPost() {
  if (confirm("작성을 취소하시겠습니까?")) history.back();
}
