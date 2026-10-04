(function () {
  "use strict";

  var pdfjsLib = window.pdfjsLib;
  var zipSync = window.fflate.zipSync;

  var BASE_URL = new URL("./", document.baseURI).toString();

  var CMAP_URL = new URL("pdfjs/cmaps/", BASE_URL).toString();
  var STANDARD_FONT_URL = new URL("pdfjs/standard_fonts/", BASE_URL).toString();
  var WASM_URL = new URL("pdfjs/wasm/", BASE_URL).toString();
  var ICC_URL = new URL("pdfjs/iccs/", BASE_URL).toString();

  var RENDER_SCALE = 2;
  var JPEG_QUALITY = 0.92;
  var MAX_PREVIEWS = 12;

  var elements = {
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("file-input"),
    segmented: document.getElementById("format-segmented"),
    convertCard: document.getElementById("convert-card"),
    fileInfo: document.getElementById("file-info"),
    convertBtn: document.getElementById("convert-btn"),
    progressCard: document.getElementById("progress-card"),
    progressText: document.getElementById("progress-text"),
    progressBar: document.getElementById("progress-bar"),
    resultCard: document.getElementById("result-card"),
    resultIcon: document.getElementById("result-icon"),
    resultTitle: document.getElementById("result-title"),
    resultMeta: document.getElementById("result-meta"),
    downloadLink: document.getElementById("download-link"),
    resetBtn: document.getElementById("reset-btn"),
    errorCard: document.getElementById("error-card"),
    errorText: document.getElementById("error-text"),
    previewsWrap: document.getElementById("previews-wrap"),
  };

  var file = null;
  var format = "png";
  var status = "idle";
  var processed = 0;
  var pageCount = 0;
  var pages = [];
  var resultUrl = null;
  var resultName = "";
  var resultSize = "";

  function sanitizeBaseName(fileName) {
    var withoutExt = fileName.replace(/\.[^.]+$/, "");
    var cleaned = withoutExt.replace(/[\\/:*?"<>|]+/g, "-").trim();
    return cleaned || "document";
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          if (!blob) {
            reject(new Error("Не удалось обработать страницу"));
            return;
          }
          resolve(blob);
        },
        mime,
        quality
      );
    });
  }

  function revokePages() {
    pages.forEach(function (page) {
      URL.revokeObjectURL(page.url);
    });
    pages = [];
  }

  function revokeResult() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = null;
    resultName = "";
    resultSize = "";
  }

  function resetResult() {
    revokePages();
    revokeResult();
    status = "idle";
    processed = 0;
    pageCount = 0;
    hideProgress();
    hideResult();
    hideError();
    elements.previewsWrap.innerHTML = "";
    renderConvertCard();
  }

  function resetAll() {
    resetResult();
    file = null;
    elements.fileInput.value = "";
  }

  function hideProgress() {
    elements.progressCard.classList.add("hidden");
  }

  function showProgress() {
    elements.progressCard.classList.remove("hidden");
  }

  function hideResult() {
    elements.resultCard.classList.add("hidden");
  }

  function showResult(title, meta) {
    elements.resultIcon.innerHTML = App.icon("checkCircle", 20);
    elements.resultTitle.textContent = title;
    elements.resultMeta.textContent = meta;
    elements.resultCard.classList.remove("hidden");
  }

  function hideError() {
    elements.errorCard.classList.add("hidden");
  }

  function showError(text) {
    elements.errorText.textContent = text;
    elements.errorCard.classList.remove("hidden");
  }

  function renderConvertCard() {
    var hasFile = file !== null;
    elements.convertCard.classList.toggle("hidden", !hasFile);
    if (hasFile) {
      elements.fileInfo.textContent =
        "Файл: " + file.name + " · " + App.formatBytes(file.size);
    }
    elements.convertBtn.disabled = !hasFile || status === "processing";
    var buttons = elements.segmented.querySelectorAll("button[data-format]");
    buttons.forEach(function (btn) {
      btn.disabled = status === "processing";
    });
  }

  function setFormat(value) {
    if (value !== "png" && value !== "jpeg") return;
    format = value;
    var buttons = elements.segmented.querySelectorAll("button[data-format]");
    buttons.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.format === format);
    });
  }

  function addFile(fileList) {
    if (!fileList || fileList.length === 0) return;
    var selected = fileList[0];
    var isPdf =
      selected.type === "application/pdf" ||
      selected.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      App.toast("Пожалуйста, выберите PDF-файл.", "error");
      return;
    }
    resetResult();
    file = selected;
    renderConvertCard();
  }

  async function convert() {
    if (!file || status === "processing") return;
    revokePages();
    revokeResult();
    status = "processing";
    processed = 0;
    pageCount = 0;
    hideResult();
    hideError();
    renderConvertCard();
    showProgress();
    elements.progressBar.style.width = "0%";
    elements.progressText.textContent = "Открываем документ…";

    try {
      var data = new Uint8Array(await file.arrayBuffer());
      var pdf = await pdfjsLib.getDocument({
        data: data,
        cMapUrl: CMAP_URL,
        cMapPacked: true,
        standardFontDataUrl: STANDARD_FONT_URL,
        wasmUrl: WASM_URL,
        iccUrl: ICC_URL,
      }).promise;
      pageCount = pdf.numPages;
      var baseName = sanitizeBaseName(file.name);
      var mime = format === "png" ? "image/png" : "image/jpeg";
      var ext = format === "png" ? "png" : "jpg";
      var result = [];

      for (var i = 1; i <= pdf.numPages; i++) {
        var page = await pdf.getPage(i);
        var viewport = page.getViewport({ scale: RENDER_SCALE });
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        await page.render({ canvas: canvas, viewport: viewport }).promise;
        page.cleanup();
        var blob = await canvasToBlob(canvas, mime, JPEG_QUALITY);
        var name =
          pdf.numPages === 1
            ? baseName + "." + ext
            : baseName + "-" + i + "." + ext;
        result.push({
          name: name,
          url: URL.createObjectURL(blob),
          bytes: new Uint8Array(await blob.arrayBuffer()),
          width: canvas.width,
          height: canvas.height,
        });
        processed = i;
        elements.progressBar.style.width =
          Math.round((processed / pageCount) * 100) + "%";
        elements.progressText.textContent =
          "Обработка страницы " + processed + " из " + pageCount + "…";
        await new Promise(function (resolve) {
          setTimeout(resolve, 0);
        });
      }

      await pdf.loadingTask.destroy();
      pages = result;

      if (result.length === 1) {
        resultUrl = result[0].url;
        resultName = result[0].name;
        resultSize = App.formatBytes(result[0].bytes.length);
        elements.downloadLink.href = resultUrl;
        elements.downloadLink.download = resultName;
        elements.downloadLink.innerHTML =
          App.icon("fileDown", 16) + " Скачать изображение";
        showResult(
          "Изображение готово",
          "Страниц: 1 · Формат: " +
            (format === "png" ? "PNG" : "JPG") +
            " · Размер: " +
            resultSize
        );
      } else {
        var zipped = zipSync(
          Object.fromEntries(
            result.map(function (page) {
              return [page.name, page.bytes];
            })
          )
        );
        var blobZip = new Blob([zipped], { type: "application/zip" });
        resultUrl = URL.createObjectURL(blobZip);
        resultName = baseName + ".zip";
        resultSize = App.formatBytes(blobZip.size);
        elements.downloadLink.href = resultUrl;
        elements.downloadLink.download = resultName;
        elements.downloadLink.innerHTML =
          App.icon("archive", 16) + " Скачать ZIP-архив";
        showResult(
          "Архив готов",
          "Страниц: " +
            pages.length +
            " · Формат: " +
            (format === "png" ? "PNG" : "JPG") +
            " · Размер: " +
            resultSize
        );
      }

      renderPreviews();
      hideProgress();
      status = "done";
      renderConvertCard();
      App.toast("Готово! Изображения можно скачать");
    } catch {
      hideProgress();
      revokePages();
      revokeResult();
      status = "error";
      renderConvertCard();
      showError(
        "Не удалось обработать PDF. Проверьте, что файл не повреждён, и попробуйте ещё раз."
      );
      App.toast("Не удалось обработать PDF. Попробуйте другой файл.", "error");
    }
  }

  function renderPreviews() {
    elements.previewsWrap.innerHTML = "";
    if (pages.length === 0) return;

    var previews = pages.slice(0, MAX_PREVIEWS);
    var hiddenPreviews = pages.length - previews.length;

    var heading = document.createElement("p");
    heading.className = "preview-heading";
    var headingText = previews.length + " из " + pages.length + " ";
    if (hiddenPreviews > 0) {
      headingText +=
        "· ещё " +
        hiddenPreviews +
        " " +
        App.plural(hiddenPreviews, "страница", "страницы", "страниц") +
        " в архиве";
    }
    heading.textContent = headingText;

    var grid = document.createElement("div");
    grid.className = "preview-grid";

    previews.forEach(function (page, index) {
      var card = document.createElement("div");
      card.className = "preview-card";

      var canvas = document.createElement("div");
      canvas.className = "preview-canvas";
      var img = document.createElement("img");
      img.src = page.url;
      img.alt = page.name;
      canvas.appendChild(img);

      var caption = document.createElement("div");
      caption.className = "preview-caption";
      var name = document.createElement("p");
      name.className = "preview-name";
      name.textContent = page.name;
      var meta = document.createElement("p");
      meta.className = "preview-meta";
      meta.textContent =
        "Стр. " + (index + 1) + " · " + page.width + " × " + page.height;
      caption.appendChild(name);
      caption.appendChild(meta);

      card.appendChild(canvas);
      card.appendChild(caption);
      grid.appendChild(card);
    });

    elements.previewsWrap.appendChild(heading);
    elements.previewsWrap.appendChild(grid);
  }

  function setupDropzone() {
    var zone = elements.dropzone;
    zone.addEventListener("click", function () {
      elements.fileInput.click();
    });
    zone.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        elements.fileInput.click();
      }
    });
    zone.addEventListener("dragover", function (event) {
      event.preventDefault();
      zone.classList.add("dragging");
    });
    zone.addEventListener("dragleave", function () {
      zone.classList.remove("dragging");
    });
    zone.addEventListener("drop", function (event) {
      event.preventDefault();
      zone.classList.remove("dragging");
      addFile(event.dataTransfer.files);
    });
    elements.fileInput.addEventListener("change", function (event) {
      addFile(event.target.files);
      event.target.value = "";
    });
  }

  elements.segmented.addEventListener("click", function (event) {
    var btn = event.target.closest("button[data-format]");
    if (btn && status !== "processing") {
      setFormat(btn.dataset.format);
    }
  });

  elements.convertBtn.addEventListener("click", function () {
    convert();
  });
  elements.resetBtn.addEventListener("click", function () {
    resetAll();
  });

  setupDropzone();
  renderConvertCard();
})();
