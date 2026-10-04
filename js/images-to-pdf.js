(function () {
  "use strict";

  var PDFLib = window.PDFLib;

  var ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  var A4_WIDTH = 595.28;
  var A4_HEIGHT = 841.89;
  var PAGE_MARGIN = 24;
  var JPEG_QUALITY = 0.92;

  var elements = {
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("file-input"),
    listCard: document.getElementById("list-card"),
    listCount: document.getElementById("list-count"),
    fileList: document.getElementById("file-list"),
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
  };

  var images = [];
  var status = "idle";
  var pdfUrl = null;

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        reject(new Error("Не удалось загрузить изображение"));
      };
      img.src = url;
    });
  }

  function canvasToBytes(canvas, mime) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        async function (blob) {
          if (!blob) {
            reject(new Error("Не удалось обработать изображение"));
            return;
          }
          resolve(new Uint8Array(await blob.arrayBuffer()));
        },
        mime,
        JPEG_QUALITY
      );
    });
  }

  async function toJpegBytes(url) {
    var img = await loadImage(url);
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas не поддерживается браузером");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return canvasToBytes(canvas, "image/jpeg");
  }

  function fitOnPage(imageWidth, imageHeight, pageWidth, pageHeight) {
    var maxWidth = pageWidth - PAGE_MARGIN * 2;
    var maxHeight = pageHeight - PAGE_MARGIN * 2;
    var scale = Math.min(maxWidth / imageWidth, maxHeight / imageHeight);
    var width = imageWidth * scale;
    var height = imageHeight * scale;
    return {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width: width,
      height: height,
    };
  }

  function showProgress() {
    elements.progressCard.classList.remove("hidden");
  }

  function hideProgress() {
    elements.progressCard.classList.add("hidden");
  }

  function setProgress(processed, total, text) {
    var percent = total > 0 ? Math.round((processed / total) * 100) : 0;
    elements.progressBar.style.width = percent + "%";
    elements.progressText.textContent = text || "";
  }

  function showResult(message, meta) {
    elements.resultIcon.innerHTML = App.icon("checkCircle", 20);
    elements.resultTitle.textContent = message;
    elements.resultMeta.textContent = meta;
    elements.resultCard.classList.remove("hidden");
  }

  function hideResult() {
    elements.resultCard.classList.add("hidden");
  }

  function showError(text) {
    elements.errorText.textContent = text;
    elements.errorCard.classList.remove("hidden");
  }

  function hideError() {
    elements.errorCard.classList.add("hidden");
  }

  function clearPdf() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    pdfUrl = null;
  }

  function resetResult() {
    clearPdf();
    hideProgress();
    hideResult();
    hideError();
    status = "idle";
  }

  function resetAll() {
    images.forEach(function (image) {
      URL.revokeObjectURL(image.url);
    });
    images = [];
    renderList();
    resetResult();
    elements.fileInput.value = "";
  }

  function renderList() {
    var count = images.length;
    elements.listCard.classList.toggle("hidden", count === 0);
    elements.listCount.textContent =
      "Изображений: " +
      count +
      ". Каждая картинка станет отдельной страницей PDF.";
    elements.convertBtn.disabled = count === 0 || status === "processing";

    elements.fileList.innerHTML = "";
    images.forEach(function (image, index) {
      var li = document.createElement("li");
      li.className = "file-list-item";

      var indexEl = document.createElement("span");
      indexEl.className = "item-index";
      indexEl.textContent = String(index + 1);

      var thumb = document.createElement("img");
      thumb.className = "item-thumb";
      thumb.src = image.url;
      thumb.alt = image.name;

      var info = document.createElement("div");
      info.className = "item-info";
      var name = document.createElement("p");
      name.className = "item-name";
      name.textContent = image.name;
      var meta = document.createElement("p");
      meta.className = "item-meta";
      meta.textContent = image.width + " × " + image.height;
      info.appendChild(name);
      info.appendChild(meta);

      var actions = document.createElement("div");
      actions.className = "item-actions";

      var upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "btn btn-ghost btn-icon btn-sm";
      upBtn.innerHTML = App.icon("arrowUp", 16);
      upBtn.setAttribute("aria-label", 'Переместить выше "' + image.name + '"');
      upBtn.disabled = index === 0 || status === "processing";
      upBtn.addEventListener("click", function () {
        moveImage(index, -1);
      });

      var downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "btn btn-ghost btn-icon btn-sm";
      downBtn.innerHTML = App.icon("arrowDown", 16);
      downBtn.setAttribute(
        "aria-label",
        'Переместить ниже "' + image.name + '"'
      );
      downBtn.disabled = index === images.length - 1 || status === "processing";
      downBtn.addEventListener("click", function () {
        moveImage(index, 1);
      });

      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-ghost btn-icon btn-sm";
      delBtn.innerHTML = App.icon("trash", 16);
      delBtn.style.color = "var(--destructive)";
      delBtn.setAttribute("aria-label", 'Удалить "' + image.name + '"');
      delBtn.disabled = status === "processing";
      delBtn.addEventListener("click", function () {
        removeImage(image.id);
      });

      actions.appendChild(upBtn);
      actions.appendChild(downBtn);
      actions.appendChild(delBtn);

      li.appendChild(indexEl);
      li.appendChild(thumb);
      li.appendChild(info);
      li.appendChild(actions);
      elements.fileList.appendChild(li);
    });
  }

  async function addFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    var files = Array.from(fileList);
    var rejected = files.filter(function (file) {
      return !ACCEPTED_TYPES.includes(file.type);
    });
    var accepted = files.filter(function (file) {
      return ACCEPTED_TYPES.includes(file.type);
    });
    if (rejected.length > 0) {
      App.toast(
        "Пропущено файлов: " +
          rejected.length +
          ". Поддерживаются только JPG, PNG и WebP.",
        "error"
      );
    }
    var added = [];
    for (var i = 0; i < accepted.length; i++) {
      var acceptedFile = accepted[i];
      var url = URL.createObjectURL(acceptedFile);
      try {
        var img = await loadImage(url);
        added.push({
          id: App.uuid(),
          file: acceptedFile,
          url: url,
          name: acceptedFile.name,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      } catch {
        URL.revokeObjectURL(url);
        App.toast(
          'Не удалось прочитать изображение "' + acceptedFile.name + '".',
          "error"
        );
      }
    }
    if (added.length > 0) {
      images = images.concat(added);
      resetResult();
      renderList();
    }
  }

  function removeImage(id) {
    var target = images.find(function (image) {
      return image.id === id;
    });
    if (target) URL.revokeObjectURL(target.url);
    images = images.filter(function (image) {
      return image.id !== id;
    });
    resetResult();
    renderList();
  }

  function moveImage(index, direction) {
    var targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    var next = images.slice();
    next[index] = images[targetIndex];
    next[targetIndex] = images[index];
    images = next;
    resetResult();
    renderList();
  }

  async function convert() {
    if (images.length === 0 || status === "processing") return;
    clearPdf();
    hideResult();
    hideError();
    status = "processing";
    renderList();
    showProgress();
    setProgress(0, images.length, "Обработка…");

    try {
      var pdfDoc = await PDFLib.PDFDocument.create();
      for (var i = 0; i < images.length; i++) {
        var jpegBytes = await toJpegBytes(images[i].url);
        var pdfImage = await pdfDoc.embedJpg(jpegBytes);
        var isLandscape = pdfImage.width > pdfImage.height;
        var pageWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
        var pageHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;
        var page = pdfDoc.addPage([pageWidth, pageHeight]);
        var rect = fitOnPage(
          pdfImage.width,
          pdfImage.height,
          pageWidth,
          pageHeight
        );
        page.drawImage(pdfImage, {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        setProgress(
          i + 1,
          images.length,
          "Обработка страницы " + (i + 1) + " из " + images.length + "…"
        );
        await new Promise(function (resolve) {
          setTimeout(resolve, 0);
        });
      }
      var pdfBytes = await pdfDoc.save();
      var blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      pdfUrl = URL.createObjectURL(blob);
      elements.downloadLink.href = pdfUrl;
      hideProgress();
      showResult(
        "PDF готов",
        "Страниц: " + images.length + " · Размер: " + App.formatBytes(blob.size)
      );
      status = "done";
      renderList();
      App.toast("PDF готов к скачиванию");
    } catch {
      hideProgress();
      status = "error";
      renderList();
      showError(
        "Не удалось создать PDF. Попробуйте ещё раз или пересоберите список изображений."
      );
      App.toast("Не удалось создать PDF. Попробуйте ещё раз.", "error");
    }
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
      addFiles(event.dataTransfer.files);
    });
    elements.fileInput.addEventListener("change", function (event) {
      addFiles(event.target.files);
      event.target.value = "";
    });
  }

  elements.convertBtn.addEventListener("click", function () {
    convert();
  });
  elements.resetBtn.addEventListener("click", function () {
    resetAll();
  });

  setupDropzone();
  renderList();
})();
