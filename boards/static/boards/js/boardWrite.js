// 전역 함수 필요(HTML에서 submitPost/cancelPost 호출)
let quill = null;

document.addEventListener("DOMContentLoaded", () => {
  const editorWrap = document.getElementById("editorWrap");
  const editorEl = document.getElementById("editor");

  const fallbackWrap = document.getElementById("fallbackWrap");
  const fallbackEl = document.getElementById("postContentFallback");

  const imageInput = document.getElementById("imageInput");
  const dropZone = document.getElementById("dropZone");
  const toastEl = document.getElementById("toast");

  const colorPicker = document.getElementById("colorPicker");
  const clearFormatBtn = document.getElementById("clearFormatBtn");

  const isSecret = document.getElementById("isSecret");
  const isAnonymous = document.getElementById("isAnonymous");
  const hiddenSecret = document.getElementById("postIsSecret");
  const hiddenAnon = document.getElementById("postIsAnonymous");

  // 기본: fallback은 항상 보이게 (글쓰기칸 사라지는 문제 방지)
  if (fallbackWrap) fallbackWrap.style.display = "block";
  if (editorWrap) editorWrap.style.display = "none";

  // 체크박스 값 -> hidden 동기화
  const syncFlags = () => {
    if (hiddenSecret) hiddenSecret.value = isSecret?.checked ? "1" : "0";
    if (hiddenAnon) hiddenAnon.value = isAnonymous?.checked ? "1" : "0";
  };
  isSecret?.addEventListener("change", syncFlags);
  isAnonymous?.addEventListener("change", syncFlags);
  syncFlags();

  // 필수 요소 없으면 종료
  if (!fallbackEl || !editorEl) return;

  // Quill이 없으면 textarea로만 사용
  if (!window.Quill) return;

  try {
    // Quill이 뜨면: editor 표시, fallback 숨김
    if (editorWrap) editorWrap.style.display = "block";
    if (fallbackWrap) fallbackWrap.style.display = "none";

    // ====== 글자크기(px) 즉시 반영 세팅 ======
    const Parchment = Quill.import("parchment");
    const SizeStyle = new Parchment.Attributor.Style("size", "font-size", {
      scope: Parchment.Scope.INLINE,
      whitelist: ["14px", "16px", "18px", "20px", "24px", "28px", "32px"],
    });
    Quill.register(SizeStyle, true);

    quill = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: {
          container: "#toolbar",
          handlers: {
            image: () => {
              if (!imageInput) {
                alert("이미지 입력 요소(imageInput)가 없습니다. HTML을 확인해주세요.");
                return;
              }
              imageInput.click();
            },
          },
        },
        clipboard: {
          // Quill 기본이 과하게 변환하는 걸 줄이기
          matchVisual: false,
        },
      },
      placeholder: "내용을 입력하세요...",
    });

    // ====== 색상: 코드 형태 말고 '즉시 글자색'으로 ======
    if (colorPicker) {
      colorPicker.addEventListener("input", () => {
        if (!quill) return;
        quill.format("color", colorPicker.value);
        quill.focus();
      });
    }

    // ====== 서식 삭제 ======
    clearFormatBtn?.addEventListener("click", () => {
      if (!quill) return;
      const range = quill.getSelection(true);
      if (!range) return;

      if (range.length === 0) {
        // 커서 위치의 서식 제거
        quill.removeFormat(range.index, 1, "user");
      } else {
        quill.removeFormat(range.index, range.length, "user");
      }
      quill.focus();
      showToast("서식을 제거했어요.");
    });

    // ====== 이미지: 파일 선택 -> 에디터에 삽입(base64) ======
    if (imageInput) {
      imageInput.addEventListener("change", async (e) => {
        const file = (e.target.files || [])[0];
        if (!file) return;

        try {
          await insertImageFile(file);
        } catch (err) {
          alert("이미지 처리 중 오류가 발생했습니다.");
          console.error(err);
        } finally {
          imageInput.value = "";
        }
      });
    }

    // ====== 드래그&드롭 이미지 ======
    if (dropZone) {
      const prevent = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      };

      ["dragenter", "dragover"].forEach((t) =>
        dropZone.addEventListener(t, (ev) => {
          prevent(ev);
          dropZone.classList.add("is-over");
        })
      );
      ["dragleave", "drop"].forEach((t) =>
        dropZone.addEventListener(t, (ev) => {
          prevent(ev);
          dropZone.classList.remove("is-over");
        })
      );

      dropZone.addEventListener("drop", async (ev) => {
        const file = (ev.dataTransfer?.files || [])[0];
        if (!file) return;
        try {
          await insertImageFile(file);
        } catch (err) {
          alert("드래그한 이미지 처리 중 오류가 발생했습니다.");
          console.error(err);
        }
      });

      // 클릭 시 파일 선택
      dropZone.addEventListener("click", () => imageInput?.click());
      dropZone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") imageInput?.click();
      });
    }

    // ====== Ctrl+V 붙여넣기 이미지 ======
    document.addEventListener("paste", async (e) => {
      if (!quill) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const imgItem = Array.from(items).find((it) => it.type.startsWith("image/"));
      if (!imgItem) return;

      const file = imgItem.getAsFile();
      if (!file) return;

      try {
        await insertImageFile(file);
        e.preventDefault();
      } catch (err) {
        alert("붙여넣기 이미지 처리 중 오류가 발생했습니다.");
        console.error(err);
      }
    });

    // 선택 변경 시 컬러피커값을 (대충) 따라가게 (UX)
    quill.on("selection-change", () => {
      if (!quill || !colorPicker) return;
      const fmt = quill.getFormat() || {};
      if (fmt.color && typeof fmt.color === "string" && fmt.color.startsWith("#")) {
        colorPicker.value = fmt.color;
      }
    });

    // 내부 함수들
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
});

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function submitPost() {
  const titleEl = document.getElementById("postTitle");
  const writerEl = document.getElementById("postWriter");
  const hiddenEl = document.getElementById("postContentHtml");
  const fallbackEl = document.getElementById("postContentFallback");

  const title = (titleEl?.value || "").trim();
  const writer = (writerEl?.value || "").trim();

  let text = "";
  let html = "";

  if (quill) {
    text = quill.getText().trim();
    html = quill.root.innerHTML.trim();
  } else {
    text = (fallbackEl?.value || "").trim();
    html = (fallbackEl?.value || "").replace(/\n/g, "<br>");
  }

  if (!title || !writer || !text) {
    alert("제목, 작성자, 내용을 모두 입력해주세요.");
    return;
  }

  if (hiddenEl) hiddenEl.value = html;

  // TODO: 여기서 실제 fetch/submit 로직 연결하면 됨
  alert("작성 완료 (데모)");
  window.location.href = "/boards/";
}

function cancelPost() {
  if (confirm("작성을 취소하시겠습니까?")) {
    window.location.href = "/boards/";
  }
}
