(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Данные о форматах и конверсиях
   * ------------------------------------------------------------------ */
  var CATEGORIES = [
    {
      id: "image",
      label: "Изображения",
      description: "JPG, PNG, WebP и другие",
      formats: ["jpg", "png", "webp", "gif", "bmp", "tiff"],
    },
    {
      id: "document",
      label: "Документы",
      description: "PDF, DOCX, TXT и другие",
      formats: ["pdf", "docx", "txt", "html", "rtf", "odt"],
    },
    {
      id: "audio",
      label: "Аудио",
      description: "MP3, WAV, OGG и другие",
      formats: ["mp3", "wav", "ogg", "flac", "aac", "m4a"],
    },
    {
      id: "video",
      label: "Видео",
      description: "MP4, WebM, AVI и другие",
      formats: ["mp4", "webm", "avi", "mov", "mkv"],
    },
  ];

  var FORMAT_LABELS = {
    jpg: "JPG",
    png: "PNG",
    webp: "WebP",
    gif: "GIF",
    bmp: "BMP",
    tiff: "TIFF",
    pdf: "PDF",
    docx: "DOCX",
    txt: "TXT",
    html: "HTML",
    rtf: "RTF",
    odt: "ODT",
    mp3: "MP3",
    wav: "WAV",
    ogg: "OGG",
    flac: "FLAC",
    aac: "AAC",
    m4a: "M4A",
    mp4: "MP4",
    webm: "WebM",
    avi: "AVI",
    mov: "MOV",
    mkv: "MKV",
  };

  function conversionsFor(formats) {
    var map = {};
    formats.forEach(function (source) {
      map[source] = formats.filter(function (target) {
        return target !== source;
      });
    });
    return map;
  }

  var conversionsCache = {};
  function getConversions(category) {
    if (!conversionsCache[category.id]) {
      conversionsCache[category.id] = conversionsFor(category.formats);
    }
    return conversionsCache[category.id];
  }

  var CATEGORY_ICONS = {
    image:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    document:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z"/><polyline points="14 2 14 8 20 8"/></svg>',
    audio:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    video:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 9 6 3-6 3Z"/></svg>',
  };

  /* ------------------------------------------------------------------ *
   * Определение формата файла
   * ------------------------------------------------------------------ */
  var EXTENSION_TO_FORMAT = {
    jpg: ["image", "jpg"],
    jpeg: ["image", "jpg"],
    png: ["image", "png"],
    webp: ["image", "webp"],
    gif: ["image", "gif"],
    bmp: ["image", "bmp"],
    tiff: ["image", "tiff"],
    tif: ["image", "tiff"],
    pdf: ["document", "pdf"],
    docx: ["document", "docx"],
    txt: ["document", "txt"],
    html: ["document", "html"],
    htm: ["document", "html"],
    rtf: ["document", "rtf"],
    odt: ["document", "odt"],
    mp3: ["audio", "mp3"],
    wav: ["audio", "wav"],
    ogg: ["audio", "ogg"],
    flac: ["audio", "flac"],
    aac: ["audio", "aac"],
    m4a: ["audio", "m4a"],
    mp4: ["video", "mp4"],
    webm: ["video", "webm"],
    avi: ["video", "avi"],
    mov: ["video", "mov"],
    mkv: ["video", "mkv"],
  };

  var MIME_TO_EXTENSION = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "text/html": "html",
    "application/rtf": "rtf",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/wave": "wav",
    "audio/ogg": "ogg",
    "application/ogg": "ogg",
    "audio/flac": "flac",
    "audio/aac": "aac",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/x-msvideo": "avi",
    "video/quicktime": "mov",
    "video/x-matroska": "mkv",
  };

  function detectFormat(file) {
    var name = file.name || "";
    var dot = name.lastIndexOf(".");
    var extension =
      dot > 0
        ? name
            .slice(dot + 1)
            .toLowerCase()
            .trim()
        : "";

    if (extension && EXTENSION_TO_FORMAT[extension]) {
      return {
        categoryId: EXTENSION_TO_FORMAT[extension][0],
        format: EXTENSION_TO_FORMAT[extension][1],
      };
    }

    var mime = (file.type || "").toLowerCase().trim();
    if (mime) {
      var mimeExtension = MIME_TO_EXTENSION[mime];
      if (mimeExtension && EXTENSION_TO_FORMAT[mimeExtension]) {
        return {
          categoryId: EXTENSION_TO_FORMAT[mimeExtension][0],
          format: EXTENSION_TO_FORMAT[mimeExtension][1],
        };
      }
    }

    return null;
  }

  /* ------------------------------------------------------------------ *
   * Конвертация
   * ------------------------------------------------------------------ */
  var IMAGE_MIME = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
  var MIME_TYPE = {
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
    bmp: "image/bmp",
    gif: "image/gif",
    txt: "text/plain;charset=utf-8",
    html: "text/html;charset=utf-8",
    rtf: "application/rtf",
  };

  function fail(message) {
    throw new Error(message);
  }

  function canvasToBlob(canvas, mime) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(
        function (blob) {
          if (blob) resolve(blob);
          else reject(new Error("Не удалось закодировать изображение."));
        },
        mime,
        0.92
      );
    });
  }

  function decodeImage(file) {
    return createImageBitmap(file)
      .then(function (bitmap) {
        var canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        var ctx = canvas.getContext("2d");
        if (!ctx) {
          bitmap.close();
          throw new Error("Не удалось инициализировать конвертер.");
        }
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return { canvas: canvas, data: data };
      })
      .catch(function () {
        throw new Error(
          "Не удалось прочитать изображение. Возможно, браузер не поддерживает этот формат."
        );
      });
  }

  function convertImage(file, target) {
    return decodeImage(file).then(function (image) {
      var mime = IMAGE_MIME[target];
      if (mime) return canvasToBlob(image.canvas, mime);
      if (target === "bmp") return encodeBmp(image.data);
      if (target === "gif") return encodeGif(image.data);
      throw new Error(
        "Кодирование в формат " +
          target.toUpperCase() +
          " пока не поддерживается в браузере."
      );
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function convertDocument(file, source, target) {
    if (source !== "txt") {
      return Promise.reject(
        new Error(
          "Чтение документов этого формата на устройстве пока недоступно. Откройте файл в редакторе и сохраните как TXT."
        )
      );
    }
    if (target === "txt") {
      return Promise.resolve(new Blob([file], { type: MIME_TYPE.txt }));
    }
    return file.text().then(function (text) {
      if (target === "html") {
        var html =
          '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<title>' +
          escapeHtml(file.name) +
          "</title>\n</head>\n<body>\n" +
          text
            .split(/\r?\n/)
            .map(function (line) {
              return "<p>" + escapeHtml(line) + "</p>";
            })
            .join("\n") +
          "\n</body>\n</html>";
        return new Blob([html], { type: MIME_TYPE.html });
      }
      if (target === "rtf") {
        var escaped = text
          .replace(/\\/g, "\\\\")
          .replace(/\{/g, "\\{")
          .replace(/\}/g, "\\}")
          .replace(/\n/g, "\\par\n")
          .replace(/\r/g, "");
        var rtf =
          "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs24\n" +
          escaped +
          "\n}";
        return new Blob([rtf], { type: MIME_TYPE.rtf });
      }
      throw new Error(
        "Сохранение документа в формат " +
          target.toUpperCase() +
          " на устройстве пока не поддерживается."
      );
    });
  }

  function convertFile(file, categoryId, source, target) {
    if (categoryId === "image") return convertImage(file, target);
    if (categoryId === "document") return convertDocument(file, source, target);
    return Promise.reject(
      new Error(
        "Конвертация этой категории выполняется на устройстве, но выбранная пара форматов пока не поддерживается в браузере."
      )
    );
  }

  function buildPalette() {
    var palette = [];
    var levels = [0, 51, 102, 153, 204, 255];
    levels.forEach(function (r) {
      levels.forEach(function (g) {
        levels.forEach(function (b) {
          palette.push([r, g, b]);
        });
      });
    });
    for (var i = 0; i < 40; i++) {
      var v = Math.round((i / 39) * 255);
      palette.push([v, v, v]);
    }
    return palette;
  }

  function nearestColor(palette, r, g, b) {
    var best = 0;
    var bestDist = Infinity;
    for (var i = 0; i < palette.length; i++) {
      var dr = palette[i][0] - r;
      var dg = palette[i][1] - g;
      var db = palette[i][2] - b;
      var dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  function lzwToBytes(indices, minCodeSize) {
    var clearCode = 1 << minCodeSize;
    var endCode = clearCode + 1;
    var codeSize = minCodeSize + 1;
    var nextCode = endCode + 1;
    var dict = new Map();

    function reset() {
      dict = new Map();
      for (var i = 0; i < clearCode; i++) {
        dict.set(String.fromCharCode(i), i);
      }
      dict.set(String.fromCharCode(clearCode), clearCode);
      dict.set(String.fromCharCode(endCode), endCode);
      codeSize = minCodeSize + 1;
      nextCode = endCode + 1;
    }
    reset();

    var chunks = [];
    var bitBuffer = 0;
    var bitCount = 0;

    function emit(code) {
      bitBuffer |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        chunks.push(bitBuffer & 0xff);
        bitBuffer >>= 8;
        bitCount -= 8;
      }
    }

    emit(clearCode);
    var last = String.fromCharCode(indices[0]);

    for (var j = 1; j < indices.length; j++) {
      var char = String.fromCharCode(indices[j]);
      var combined = last + char;
      if (dict.has(combined)) {
        last = combined;
        continue;
      }
      emit(dict.get(last));
      if (nextCode === 4096) {
        emit(clearCode);
        reset();
      } else {
        // GIF LZW: ширину кода увеличиваем до вставки новой записи словаря,
        // когда следующее значение достигло текущего предела (совместимо с
        // декодерами GIF). Иначе поток битов рассинхронизируется, и картинка
        // превращается в шум.
        if (nextCode >= 1 << codeSize && codeSize < 12) codeSize++;
        dict.set(combined, nextCode++);
      }
      last = char;
    }
    emit(dict.get(last));
    emit(endCode);
    if (bitCount > 0) chunks.push(bitBuffer & 0xff);

    var blocks = [];
    for (var k = 0; k < chunks.length; k += 255) {
      var slice = chunks.slice(k, k + 255);
      blocks.push(slice.length);
      Array.prototype.push.apply(blocks, slice);
    }
    return new Uint8Array(blocks);
  }

  function ascii(value) {
    var arr = new Uint8Array(value.length);
    for (var i = 0; i < value.length; i++) arr[i] = value.charCodeAt(i);
    return arr;
  }

  function encodeBmp(image) {
    var width = image.width;
    var height = image.height;
    var data = image.data;
    var rowSize = Math.ceil((width * 3) / 4) * 4;
    var pixelArraySize = rowSize * height;
    var fileSize = 54 + pixelArraySize;

    var buffer = new ArrayBuffer(fileSize);
    var view = new DataView(buffer);
    var bytes = new Uint8Array(buffer);

    bytes[0] = 0x42;
    bytes[1] = 0x4d;
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, 54, true);

    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    var offset = 54;
    for (var y = height - 1; y >= 0; y--) {
      var rowStart = offset;
      for (var x = 0; x < width; x++) {
        var idx = (y * width + x) * 4;
        bytes[offset++] = data[idx + 2];
        bytes[offset++] = data[idx + 1];
        bytes[offset++] = data[idx];
      }
      offset = rowStart + rowSize;
    }

    return new Blob([buffer], { type: MIME_TYPE.bmp });
  }

  function encodeGif(image) {
    var width = image.width;
    var height = image.height;
    var data = image.data;
    var palette = buildPalette();

    var indices = new Uint8Array(width * height);
    for (var i = 0; i < width * height; i++) {
      var o = i * 4;
      indices[i] = nearestColor(palette, data[o], data[o + 1], data[o + 2]);
    }

    var lzwData = lzwToBytes(indices, 8);
    var parts = [];

    parts.push(ascii("GIF89a"));

    var lsd = new Uint8Array(7);
    lsd[0] = width & 0xff;
    lsd[1] = (width >> 8) & 0xff;
    lsd[2] = height & 0xff;
    lsd[3] = (height >> 8) & 0xff;
    lsd[4] = 0x80 | 0x07;
    lsd[5] = 0;
    lsd[6] = 0;
    parts.push(lsd);

    var gct = new Uint8Array(256 * 3);
    for (var p = 0; p < 256; p++) {
      gct[p * 3] = palette[p][0];
      gct[p * 3 + 1] = palette[p][1];
      gct[p * 3 + 2] = palette[p][2];
    }
    parts.push(gct);

    var imgDesc = new Uint8Array(10);
    imgDesc[0] = 0x2c;
    imgDesc[1] = 0;
    imgDesc[2] = 0;
    imgDesc[3] = 0;
    imgDesc[4] = 0;
    imgDesc[5] = width & 0xff;
    imgDesc[6] = (width >> 8) & 0xff;
    imgDesc[7] = height & 0xff;
    imgDesc[8] = (height >> 8) & 0xff;
    imgDesc[9] = 0x00;
    parts.push(imgDesc);

    parts.push(new Uint8Array([8]));
    parts.push(lzwData);
    parts.push(new Uint8Array([0x00]));
    parts.push(new Uint8Array([0x3b]));

    var total = 0;
    parts.forEach(function (part) {
      total += part.length;
    });
    var out = new Uint8Array(total);
    var off = 0;
    parts.forEach(function (part) {
      out.set(part, off);
      off += part.length;
    });

    return new Blob([out], { type: MIME_TYPE.gif });
  }

  /* ------------------------------------------------------------------ *
   * Состояние и DOM-элементы
   * ------------------------------------------------------------------ */
  var state = {
    file: null,
    categoryId: "image",
    source: "",
    sourceLocked: false,
    target: "",
    converting: false,
    downloadUrl: null,
  };

  var timer = null;
  var el = {
    dropzone: document.getElementById("dropzone"),
    fileInput: document.getElementById("file-input"),
    pickButton: document.getElementById("pick-button"),
    selectedCard: document.getElementById("selected-card"),
    fileName: document.getElementById("file-name"),
    fileSize: document.getElementById("file-size"),
    removeFile: document.getElementById("remove-file"),
    selector: document.getElementById("selector"),
    categories: document.getElementById("categories"),
    sourceSelect: document.getElementById("source-select"),
    targetSelect: document.getElementById("target-select"),
    progressWrap: document.getElementById("progress-wrap"),
    progressLabel: document.getElementById("progress-label"),
    progressBar: document.getElementById("progress-bar"),
    result: document.getElementById("result"),
    downloadButton: document.getElementById("download-button"),
    downloadLabel: document.getElementById("download-label"),
    convertButton: document.getElementById("convert-button"),
    toast: document.getElementById("toast"),
    themeToggle: document.getElementById("theme-toggle"),
  };

  function currentCategory() {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === state.categoryId) return CATEGORIES[i];
    }
    return CATEGORIES[0];
  }

  function availableTargets() {
    if (!state.source) return [];
    var category = currentCategory();
    var allowed = getConversions(category)[state.source] || [];
    return category.formats.filter(function (format) {
      return allowed.indexOf(format) !== -1;
    });
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " ГБ";
  }

  function buildFileName(name, target) {
    var dot = name.lastIndexOf(".");
    var base = dot > 0 ? name.slice(0, dot) : name;
    return base + "." + target;
  }

  /* ------------------------------------------------------------------ *
   * Отрисовка
   * ------------------------------------------------------------------ */
  function renderCategories() {
    el.categories.innerHTML = "";
    CATEGORIES.forEach(function (item) {
      var disabled = state.sourceLocked && item.id !== state.categoryId;
      var card = document.createElement("div");
      card.className =
        "category-card" +
        (item.id === state.categoryId ? " active" : "") +
        (disabled ? " disabled" : "");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      if (disabled) {
        card.setAttribute("aria-disabled", "true");
        card.tabIndex = -1;
      }
      card.dataset.id = item.id;

      var icon = document.createElement("div");
      icon.className = "category-icon";
      icon.innerHTML = CATEGORY_ICONS[item.id];

      var text = document.createElement("div");
      var name = document.createElement("p");
      name.className = "category-name";
      name.textContent = item.label;
      var desc = document.createElement("p");
      desc.className = "category-desc";
      desc.textContent = item.description;
      text.appendChild(name);
      text.appendChild(desc);

      card.appendChild(icon);
      card.appendChild(text);

      card.addEventListener("click", function () {
        if (disabled) return;
        selectCategory(item.id);
      });
      card.addEventListener("keydown", function (event) {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectCategory(item.id);
        }
      });

      el.categories.appendChild(card);
    });
  }

  function fillSelect(select, options, placeholder, disabled) {
    select.innerHTML = "";
    var placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);
    options.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = FORMAT_LABELS[value] || value;
      select.appendChild(option);
    });
    select.disabled = disabled;
  }

  function renderFormats() {
    var category = currentCategory();

    if (state.sourceLocked) {
      fillSelect(
        el.sourceSelect,
        [state.source],
        FORMAT_LABELS[state.source] || state.source,
        true
      );
      el.sourceSelect.value = state.source;
    } else {
      fillSelect(el.sourceSelect, category.formats, "Выберите формат", false);
      if (state.source) el.sourceSelect.value = state.source;
    }

    var targets = availableTargets();
    fillSelect(el.targetSelect, targets, "Выберите формат", !state.source);
    if (state.target) el.targetSelect.value = state.target;

    renderCategories();
    updateConvertState();
  }

  function updateConvertState() {
    var canConvert = Boolean(
      state.file && state.source && state.target && !state.converting
    );
    el.convertButton.disabled = !canConvert;
  }

  function renderFile() {
    if (!state.file) {
      el.dropzone.hidden = false;
      el.selectedCard.hidden = true;
      el.selector.hidden = true;
      hideProgress();
      hideResult();
      return;
    }
    // После выбора файла скрываем меню загрузки; оно возвращается при удалении.
    el.dropzone.hidden = true;
    el.selectedCard.hidden = false;
    el.fileName.textContent = state.file.name;
    el.fileName.title = state.file.name;
    el.fileSize.textContent = formatFileSize(state.file.size);
    el.selector.hidden = false;
  }

  /* ------------------------------------------------------------------ *
   * Управление прогрессом, результатом, тостами
   * ------------------------------------------------------------------ */
  function clearResult() {
    if (state.downloadUrl) URL.revokeObjectURL(state.downloadUrl);
    state.downloadUrl = null;
    hideResult();
  }

  function showResult(label) {
    el.downloadLabel.textContent = "Скачать в " + label;
    el.result.hidden = false;
  }

  function hideResult() {
    el.result.hidden = true;
  }

  function showProgress() {
    el.progressWrap.hidden = false;
    setProgress(0);
  }

  function hideProgress() {
    el.progressWrap.hidden = true;
    stopTimer();
  }

  function setProgress(value) {
    el.progressBar.style.width = value + "%";
    el.progressLabel.textContent = Math.round(value) + "%";
  }

  function startTimer() {
    stopTimer();
    setProgress(0);
    timer = setInterval(function () {
      var current = parseFloat(el.progressBar.style.width) || 0;
      setProgress(Math.min(90, current + Math.random() * 14));
    }, 180);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  var toastTimer = null;
  function showToast(message, isError) {
    el.toast.textContent = message;
    el.toast.style.background = isError ? "#dc2626" : "var(--foreground)";
    el.toast.style.color = isError ? "#ffffff" : "var(--background)";
    el.toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.hidden = true;
    }, 3500);
  }

  /* ------------------------------------------------------------------ *
   * Действия
   * ------------------------------------------------------------------ */
  function selectCategory(id) {
    if (state.categoryId === id) return;
    state.categoryId = id;
    state.source = "";
    state.sourceLocked = false;
    state.target = "";
    clearResult();
    renderFormats();
  }

  function handleFiles(files) {
    var candidate = files && files[0];
    if (!candidate) return;
    state.file = candidate;

    var detected = detectFormat(candidate);
    if (detected) {
      state.categoryId = detected.categoryId;
      state.source = detected.format;
      state.sourceLocked = true;
    } else {
      state.source = "";
      state.sourceLocked = false;
    }
    state.target = "";
    clearResult();
    renderFile();
    renderFormats();
  }

  function resetFile() {
    state.file = null;
    state.source = "";
    state.sourceLocked = false;
    state.target = "";
    clearResult();
    el.fileInput.value = "";
    renderFile();
    renderFormats();
  }

  function handleSourceChange() {
    var value = el.sourceSelect.value || "";
    stopTimer();
    state.source = value;
    state.target = "";
    clearResult();
    renderFormats();
  }

  function handleTargetChange() {
    state.target = el.targetSelect.value || "";
    clearResult();
    updateConvertState();
  }

  function handleConvert() {
    if (!state.file || !state.source || !state.target || state.converting)
      return;
    stopTimer();
    clearResult();
    state.converting = true;
    showProgress();
    startTimer();
    updateConvertState();

    var category = currentCategory();
    convertFile(state.file, category.id, state.source, state.target)
      .then(function (blob) {
        stopTimer();
        setProgress(100);
        state.downloadUrl = URL.createObjectURL(blob);
        showResult((FORMAT_LABELS[state.target] || state.target).toUpperCase());
        showToast("Конвертация завершена", false);
      })
      .catch(function (err) {
        stopTimer();
        setProgress(0);
        hideProgress();
        showToast(
          err && err.message ? err.message : "Не удалось конвертировать файл.",
          true
        );
      })
      .then(function () {
        state.converting = false;
        updateConvertState();
      });
  }

  function handleDownload() {
    if (!state.downloadUrl || !state.target) return;
    var link = document.createElement("a");
    link.href = state.downloadUrl;
    link.download = buildFileName(
      state.file ? state.file.name : "file",
      state.target
    );
    link.rel = "noopener";
    link.style.position = "fixed";
    link.style.left = "-9999px";
    link.style.opacity = "0";
    document.body.appendChild(link);
    link.click();
    // Удаляем элемент не синхронно: в ряде браузеров и PWA/standalone-режиме
    // немедленное удаление обрывает старт скачивания.
    window.setTimeout(function () {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 1000);
  }

  /* ------------------------------------------------------------------ *
   * Тема
   * ------------------------------------------------------------------ */
  function initTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem("formatme-theme");
    } catch (e) {
      stored = null;
    }
    var apply = function (theme) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    };
    if (stored === "light" || stored === "dark") {
      apply(stored);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      apply("dark");
    } else {
      apply("light");
    }
  }

  function toggleTheme() {
    var isDark = document.documentElement.classList.contains("dark");
    var next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("formatme-theme", next);
    } catch (e) {
      /* ignore */
    }
  }

  /* ------------------------------------------------------------------ *
   * События
   * ------------------------------------------------------------------ */
  function bindEvents() {
    el.pickButton.addEventListener("click", function () {
      el.fileInput.click();
    });
    el.dropzone.addEventListener("click", function () {
      el.fileInput.click();
    });
    el.dropzone.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        el.fileInput.click();
      }
    });
    el.fileInput.addEventListener("change", function (event) {
      handleFiles(event.target.files);
    });

    ["dragenter", "dragover"].forEach(function (name) {
      el.dropzone.addEventListener(name, function (event) {
        event.preventDefault();
        el.dropzone.classList.add("dragging");
      });
    });
    el.dropzone.addEventListener("dragleave", function () {
      el.dropzone.classList.remove("dragging");
    });
    el.dropzone.addEventListener("drop", function (event) {
      event.preventDefault();
      el.dropzone.classList.remove("dragging");
      handleFiles(event.dataTransfer.files);
    });

    el.removeFile.addEventListener("click", resetFile);
    el.sourceSelect.addEventListener("change", handleSourceChange);
    el.targetSelect.addEventListener("change", handleTargetChange);
    el.convertButton.addEventListener("click", handleConvert);
    el.downloadButton.addEventListener("click", handleDownload);
    el.themeToggle.addEventListener("click", toggleTheme);
  }

  /* ------------------------------------------------------------------ *
   * Инициализация
   * ------------------------------------------------------------------ */
  function init() {
    initTheme();
    var yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    bindEvents();
    renderFile();
    renderFormats();
    updateConvertState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
