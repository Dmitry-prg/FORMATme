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
      description: "PDF, DOCX, TXT, таблицы и другие",
      formats: [
        "pdf",
        "docx",
        "odt",
        "doc",
        "xlsx",
        "csv",
        "txt",
        "html",
        "rtf",
        "md",
      ],
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
    odt: "ODT",
    doc: "DOC",
    xlsx: "XLSX",
    csv: "CSV",
    txt: "TXT",
    html: "HTML",
    rtf: "RTF",
    md: "MD",
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
  // Пары конвертации текстовых и офисных документов перечислены явно.
  var DOCUMENT_CONVERSIONS = {
    pdf: ["txt", "html", "rtf", "md"],
    docx: ["txt", "html", "rtf", "md", "odt"],
    odt: ["txt", "html", "rtf", "md", "doc"],
    doc: ["txt", "html", "rtf", "md", "odt"],
    xlsx: ["csv", "html", "txt"],
    csv: ["xlsx", "html", "txt"],
    txt: ["html", "rtf", "md", "odt", "doc", "csv"],
    html: ["txt", "rtf", "md", "odt", "doc"],
    rtf: ["txt", "html", "md", "odt", "doc"],
    md: ["txt", "html", "rtf", "odt", "doc"],
  };
  function getConversions(category) {
    if (!conversionsCache[category.id]) {
      conversionsCache[category.id] =
        category.id === "document"
          ? DOCUMENT_CONVERSIONS
          : conversionsFor(category.formats);
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
    odt: ["document", "odt"],
    doc: ["document", "doc"],
    xlsx: ["document", "xlsx"],
    csv: ["document", "csv"],
    txt: ["document", "txt"],
    html: ["document", "html"],
    htm: ["document", "html"],
    rtf: ["document", "rtf"],
    md: ["document", "md"],
    markdown: ["document", "md"],
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
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.oasis.opendocument.text": "odt",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/csv": "csv",
    "application/csv": "csv",
    "text/markdown": "md",
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

  /* ------------------------------------------------------------------ *
   * Движок конвертации документов (полностью локально в браузере)
   * PDF / DOCX / ODT / TXT / HTML / RTF / MD / CSV / XLSX
   * ------------------------------------------------------------------ */
  function utf8Decode(bytes) {
    return new TextDecoder("utf-8").decode(bytes);
  }
  // Точное 1:1 декодирование байтов в Latin-1 (без искажений windows-1252).
  function latinDecode(bytes) {
    var out = "";
    for (var i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
    return out;
  }

  function inflateStream(kind, data) {
    return new Response(
      new Blob([data]).stream().pipeThrough(new DecompressionStream(kind))
    )
      .arrayBuffer()
      .then(function (buf) {
        return new Uint8Array(buf);
      });
  }
  function inflateRaw(data) {
    return inflateStream("deflate-raw", data);
  }
  function inflateDeflate(data) {
    return inflateStream("deflate", data);
  }

  async function unzip(bytes) {
    var len = bytes.length;
    var eocd = -1;
    for (var i = len - 22; i >= 0; i--) {
      if (
        bytes[i] === 0x50 &&
        bytes[i + 1] === 0x4b &&
        bytes[i + 2] === 0x05 &&
        bytes[i + 3] === 0x06
      ) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw new Error("Файл не является ZIP-архивом.");
    var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var cdOffset = view.getUint32(eocd + 16, true);
    var entries = {};
    var pos = cdOffset;
    for (;;) {
      if (pos + 46 > len) break;
      if (
        bytes[pos] !== 0x50 ||
        bytes[pos + 1] !== 0x4b ||
        bytes[pos + 2] !== 0x01 ||
        bytes[pos + 3] !== 0x02
      )
        break;
      var method = view.getUint16(pos + 10, true);
      var compSize = view.getUint32(pos + 20, true);
      var nameLen = view.getUint16(pos + 28, true);
      var extraLen = view.getUint16(pos + 30, true);
      var commentLen = view.getUint16(pos + 32, true);
      var localOffset = view.getUint32(pos + 42, true);
      var name = utf8Decode(bytes.subarray(pos + 46, pos + 46 + nameLen));
      var data = new Uint8Array(0);
      if (name.slice(-1) !== "/") {
        var lname = view.getUint16(localOffset + 26, true);
        var lextra = view.getUint16(localOffset + 28, true);
        var dataStart = localOffset + 30 + lname + lextra;
        var raw = bytes.subarray(dataStart, dataStart + compSize);
        data = method === 8 ? await inflateRaw(raw) : new Uint8Array(raw);
      }
      entries[name] = data;
      pos += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  }

  var CRC_TABLE = (function () {
    var table = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(data) {
    var crc = 0xffffffff;
    for (var i = 0; i < data.length; i++) {
      crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function zip(parts) {
    var chunks = [];
    var central = [];
    var offset = 0;
    parts.forEach(function (part) {
      var nameBytes = new TextEncoder().encode(part.name);
      var crc = crc32(part.data);
      var local = new Uint8Array(30 + nameBytes.length);
      var lv = new DataView(local.buffer);
      local[0] = 0x50;
      local[1] = 0x4b;
      local[2] = 0x03;
      local[3] = 0x04;
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0x21, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, part.data.length, true);
      lv.setUint32(22, part.data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      chunks.push(local, part.data);

      var cd = new Uint8Array(46 + nameBytes.length);
      var cv = new DataView(cd.buffer);
      cd[0] = 0x50;
      cd[1] = 0x4b;
      cd[2] = 0x01;
      cd[3] = 0x02;
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0x21, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, part.data.length, true);
      cv.setUint32(24, part.data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(42, offset, true);
      cd.set(nameBytes, 46);
      central.push(cd);
      offset += local.length + part.data.length;
    });

    var cdSize = 0;
    central.forEach(function (c) {
      cdSize += c.length;
    });
    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    eocd[0] = 0x50;
    eocd[1] = 0x4b;
    eocd[2] = 0x05;
    eocd[3] = 0x06;
    ev.setUint16(8, parts.length, true);
    ev.setUint16(10, parts.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);

    var all = chunks.concat(central, [eocd]);
    var total = 0;
    all.forEach(function (c) {
      total += c.length;
    });
    var out = new Uint8Array(total);
    var p = 0;
    all.forEach(function (c) {
      out.set(c, p);
      p += c.length;
    });
    return new Blob([out], { type: "application/zip" });
  }

  /* -- текстовые преобразования -- */
  function normalizeLines(lines) {
    var result = [];
    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (trimmed === "") {
        if (result.length && result[result.length - 1] !== "") result.push("");
      } else {
        result.push(trimmed);
      }
    });
    while (result.length && result[result.length - 1] === "") result.pop();
    return result.join("\n").trim();
  }

  function stripHtml(value) {
    return normalizeLines(
      String(value)
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<br\s*\/?\s*>/gi, "\n")
        .replace(/<\/(p|div|h[1-6]|li|tr|pre)>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .split(/\r?\n/)
    );
  }

  function textToHtml(text, title) {
    var paragraphs = text
      .split(/\r?\n/)
      .map(function (line) {
        return "<p>" + escapeHtml(line) + "</p>";
      })
      .join("\n");
    return (
      '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<title>' +
      escapeHtml(title) +
      "</title>\n</head>\n<body>\n" +
      paragraphs +
      "\n</body>\n</html>"
    );
  }

  function textToRtf(text) {
    var escaped = text
      .replace(/\\/g, "\\\\")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/\n/g, "\\par\n")
      .replace(/\r/g, "");
    return (
      "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs24\n" +
      escaped +
      "\n}"
    );
  }

  function rtfToText(rtf) {
    var value = String(rtf);
    var out = "";
    var i = 0;
    var n = value.length;
    var depth = 0;
    var skipDepth = -1;
    while (i < n) {
      var ch = value[i];
      if (ch === "{") {
        depth++;
        if (
          skipDepth < 0 &&
          /^\{\\(?:fonttbl|colortbl|stylesheet|info|generator)\b/i.test(
            value.slice(i)
          )
        ) {
          skipDepth = depth;
        }
        i++;
        continue;
      }
      if (ch === "}") {
        if (skipDepth === depth) skipDepth = -1;
        depth--;
        i++;
        continue;
      }
      if (skipDepth >= 0) {
        i++;
        continue;
      }
      if (ch === "\\") {
        i++;
        if (i >= n) break;
        var c = value[i];
        if (c === "'") {
          var code = parseInt(value.slice(i + 1, i + 3), 16);
          out += isNaN(code) ? "" : String.fromCharCode(code);
          i += 3;
          continue;
        }
        if (c === "\\" || c === "{" || c === "}") {
          out += c;
          i++;
          continue;
        }
        if (/[a-zA-Z]/.test(c)) {
          var start = i;
          while (i < n && /[a-zA-Z]/.test(value[i])) i++;
          var word = value.slice(start, i);
          if (word === "par" || word === "line" || word === "ltrpar")
            out += "\n";
          else if (word === "tab") out += "\t";
          if (value[i] === "-") i++;
          while (i < n && /\d/.test(value[i])) i++;
          if (value[i] === " ") i++;
          continue;
        }
        i++;
        continue;
      }
      if (ch === "\r") {
        i++;
        continue;
      }
      out += ch;
      i++;
    }
    return normalizeLines(out.split(/\r?\n/));
  }

  function inlineMarkdown(value) {
    var out = escapeHtml(value);
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    out = out.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
    return out;
  }

  function markdownToHtml(markdown) {
    var html = [];
    var listOpen = false;
    function closeList() {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
    }
    String(markdown)
      .split(/\r?\n/)
      .forEach(function (raw) {
        var line = raw.replace(/\s+$/, "");
        if (/^\s*[-*+]\s+/.test(line)) {
          if (!listOpen) {
            html.push("<ul>");
            listOpen = true;
          }
          html.push(
            "<li>" + inlineMarkdown(line.replace(/^\s*[-*+]\s+/, "")) + "</li>"
          );
          return;
        }
        if (/^\s{0,3}\d+\.\s+/.test(line)) {
          closeList();
          html.push(
            "<ol><li>" +
              inlineMarkdown(line.replace(/^\s*\d+\.\s+/, "")) +
              "</li></ol>"
          );
          return;
        }
        closeList();
        var heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (heading) {
          html.push(
            "<h" +
              heading[1].length +
              ">" +
              inlineMarkdown(heading[2]) +
              "</h" +
              heading[1].length +
              ">"
          );
          return;
        }
        if (/^```/.test(line)) {
          closeList();
          html.push("<pre><code>");
          return;
        }
        if (html.length && html[html.length - 1] === "<pre><code>") {
          if (/^```$/.test(line)) {
            html.push("</code></pre>");
            return;
          }
          html.push(escapeHtml(line));
          return;
        }
        if (line.trim() === "") return;
        if (/^\s*---+$/.test(line)) {
          html.push("<hr />");
          return;
        }
        html.push("<p>" + inlineMarkdown(line) + "</p>");
      });
    closeList();
    return html.join("\n");
  }

  function markdownToText(markdown) {
    return normalizeLines(
      String(markdown)
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s{0,3}\d+\.\s+/gm, "")
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/^```/gm, "")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1")
        .replace(/!?\[([^\]]*)\]\(([^)]+)\)/g, "$2")
        .split(/\r?\n/)
    );
  }

  function textToMarkdown(text) {
    return normalizeLines(String(text).split(/\r?\n/));
  }

  function textToMarkdown(text) {
    return String(text)
      .split(/\r?\n/)
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line, index, arr) {
        return !(line === "" && arr[index - 1] === "");
      })
      .join("\n");
  }

  /* -- XML/OOXML -- */
  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function xmlBodyToText(xml) {
    return normalizeLines(
      String(xml)
        .replace(/<(w:text|text:p|text:h)\b[^>]*\/?>/gi, "\n")
        .replace(/<\/w:p>/gi, "\n")
        .replace(/<\/text:(p|h)>/gi, "\n")
        .replace(/<\/w:tr>/gi, "\n")
        .replace(/<\/text:table-row>/gi, "\n")
        .replace(/<\/w:tc>/gi, "\t")
        .replace(/<\/text:table-cell>/gi, "\t")
        .replace(/<(w:tab|text:tab)\b[^>]*\/?>/gi, "\t")
        .replace(/<w:br[^>]*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .split(/\r?\n/)
    );
  }

  async function docxToText(bytes) {
    var files = await unzip(bytes);
    var xml = files["word/document.xml"];
    if (!xml)
      throw new Error("Архив DOCX повреждён: не найден word/document.xml.");
    var text = xmlBodyToText(utf8Decode(xml));
    if (!text.trim()) throw new Error("Не удалось извлечь текст из DOCX.");
    return text;
  }

  async function odtToText(bytes) {
    var files = await unzip(bytes);
    var xml = files["content.xml"];
    if (!xml) throw new Error("Архив ODT повреждён: не найден content.xml.");
    var text = xmlBodyToText(utf8Decode(xml));
    if (!text.trim()) throw new Error("Не удалось извлечь текст из ODT.");
    return text;
  }

  /* -- генерация офисных форматов -- */
  function buildOdt(text) {
    var paragraphs = String(text)
      .split(/\r?\n/)
      .map(function (line) {
        return "<text:p>" + escapeXml(line) + "</text:p>";
      })
      .join("\n");
    var contentXml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">\n' +
      "<office:body><office:text>" +
      paragraphs +
      "</office:text></office:body>\n</office:document-content>";
    var manifest =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">\n' +
      '<manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text" manifest:version="1.2"/>\n' +
      '<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>\n</manifest:manifest>';
    var mimetype = new TextEncoder().encode(
      "application/vnd.oasis.opendocument.text"
    );
    return zip([
      { name: "mimetype", data: mimetype },
      { name: "content.xml", data: new TextEncoder().encode(contentXml) },
      {
        name: "META-INF/manifest.xml",
        data: new TextEncoder().encode(manifest),
      },
    ]);
  }

  function buildDocx(title, text) {
    var paragraphs = String(text)
      .split(/\r?\n/)
      .map(function (line) {
        return (
          '<w:p><w:r><w:t xml:space="preserve">' +
          escapeXml(line) +
          "</w:t></w:r></w:p>"
        );
      })
      .join("\n");
    var docXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      paragraphs +
      "</w:body></w:document>";
    var contentTypes =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      "</Types>";
    var rels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      "</Relationships>";
    var docRels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
    return zip([
      {
        name: "[Content_Types].xml",
        data: new TextEncoder().encode(contentTypes),
      },
      { name: "_rels/.rels", data: new TextEncoder().encode(rels) },
      {
        name: "word/_rels/document.xml.rels",
        data: new TextEncoder().encode(docRels),
      },
      { name: "word/document.xml", data: new TextEncoder().encode(docXml) },
    ]);
  }

  /* -- CSV / XLSX -- */
  function parseCsv(csv) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;
    var s = String(csv);
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (inQuotes) {
        if (ch === '"') {
          if (s[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        field = "";
        if (
          row.some(function (cell) {
            return cell.trim() !== "";
          })
        )
          rows.push(row);
        row = [];
      } else if (ch !== "\r") {
        field += ch;
      }
    }
    if (field !== "" || row.length > 0) {
      row.push(field);
      if (
        row.some(function (cell) {
          return cell.trim() !== "";
        })
      )
        rows.push(row);
    }
    return rows;
  }

  function csvCell(value) {
    var v = String(value);
    if (/[",\n\r]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  function tableToCsv(rows) {
    return rows
      .map(function (row) {
        return row.map(csvCell).join(",");
      })
      .join("\n");
  }

  function buildXlsx(rows) {
    var sheetRows = rows
      .map(function (row) {
        var cells = row
          .map(function (cell) {
            return (
              '<c t="inlineStr"><is><t xml:space="preserve">' +
              escapeXml(cell) +
              "</t></is></c>"
            );
          })
          .join("");
        return "<row>" + cells + "</row>";
      })
      .join("");
    var sheetXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
      sheetRows +
      "</sheetData></worksheet>";
    var workbookXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets><sheet name="Лист1" sheetId="1" r:id="rId1"/></sheets></workbook>';
    var contentTypes =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      "</Types>";
    var rels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      "</Relationships>";
    var workbookRels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      "</Relationships>";
    return zip([
      {
        name: "[Content_Types].xml",
        data: new TextEncoder().encode(contentTypes),
      },
      { name: "_rels/.rels", data: new TextEncoder().encode(rels) },
      { name: "xl/workbook.xml", data: new TextEncoder().encode(workbookXml) },
      {
        name: "xl/_rels/workbook.xml.rels",
        data: new TextEncoder().encode(workbookRels),
      },
      {
        name: "xl/worksheets/sheet1.xml",
        data: new TextEncoder().encode(sheetXml),
      },
    ]);
  }

  function colIndex(ref) {
    var result = 0;
    for (var i = 0; i < ref.length; i++) {
      result = result * 26 + (ref.charCodeAt(i) - 64);
    }
    return result;
  }

  async function xlsxToGrid(bytes) {
    var files = await unzip(bytes);
    var shared = [];
    var sharedXml = files["xl/sharedStrings.xml"];
    if (sharedXml) {
      var sharedText = utf8Decode(sharedXml);
      var siRe = /<si>[\s\S]*?<\/si>/g;
      var m;
      while ((m = siRe.exec(sharedText)) !== null) {
        var t = m[0].match(/<t[^>]*>([\s\S]*?)<\/t>/g) || [];
        shared.push(
          t
            .map(function (x) {
              return x
                .replace(/<[^>]+>/g, "")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">");
            })
            .join("")
        );
      }
    }
    var sheet =
      files["xl/worksheets/sheet1.xml"] || files["xl/worksheets/sheet.xml"];
    if (!sheet) throw new Error("Не удалось найти таблицу в XLSX.");
    var sheetText = utf8Decode(sheet);
    var grid = [];
    var rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
    var rMatch;
    while ((rMatch = rowRe.exec(sheetText)) !== null) {
      var rowXml = rMatch[1];
      var cells = [];
      var cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
      var cMatch;
      while ((cMatch = cellRe.exec(rowXml)) !== null) {
        var attrs = cMatch[1];
        var refMatch = /r="([A-Z]+)\d+"/.exec(attrs);
        var typeMatch = /t="(\w+)"/.exec(attrs);
        var type = typeMatch ? typeMatch[1] : "";
        var inner = cMatch[2];
        var valueMatch = /<v>([\s\S]*?)<\/v>/.exec(inner);
        var isMatch = /<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/.exec(inner);
        var value = "";
        if (type === "s" && valueMatch) {
          value = shared[parseInt(valueMatch[1], 10)] || "";
        } else if (type === "inlineStr" && isMatch) {
          value = isMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
        } else if (valueMatch) {
          value = valueMatch[1];
        }
        cells.push({ ref: refMatch ? refMatch[1] : "", value: value });
      }
      cells.sort(function (a, b) {
        return colIndex(a.ref) - colIndex(b.ref);
      });
      var rowArr = [];
      cells.forEach(function (cell) {
        if (cell.ref) {
          var idx = colIndex(cell.ref) - 1;
          while (rowArr.length < idx) rowArr.push("");
          rowArr[idx] = cell.value;
        } else {
          rowArr.push(cell.value);
        }
      });
      grid.push(rowArr);
    }
    return grid;
  }

  /* -- извлечение текста и генерация результата -- */
  async function extractPlainText(source, bytes) {
    switch (source) {
      case "pdf":
        return pdfToText(bytes);
      case "docx":
        return docxToText(bytes);
      case "odt":
        return odtToText(bytes);
      case "doc": {
        var parsed = rtfToText(latinDecode(bytes));
        if (parsed.trim()) return parsed;
        return docxToText(bytes);
      }
      case "txt":
        return utf8Decode(bytes);
      case "html":
        return stripHtml(utf8Decode(bytes));
      case "rtf":
        return rtfToText(latinDecode(bytes));
      case "md":
        return markdownToText(utf8Decode(bytes));
      case "csv":
        return tableToCsv(parseCsv(utf8Decode(bytes)));
      case "xlsx":
        return tableToCsv(await xlsxToGrid(bytes));
      default:
        throw new Error("Чтение этого формата на устройстве пока недоступно.");
    }
  }

  function buildResultFile(target, text, fileName) {
    var title = String(fileName).replace(/\.[^.]+$/, "");
    switch (target) {
      case "txt":
        return new Blob([text], { type: "text/plain;charset=utf-8" });
      case "html":
        return new Blob([textToHtml(text, title)], {
          type: "text/html;charset=utf-8",
        });
      case "rtf":
        return new Blob([textToRtf(text)], { type: "application/rtf" });
      case "md":
        return new Blob([textToMarkdown(text)], {
          type: "text/markdown;charset=utf-8",
        });
      case "odt":
        return buildOdt(text);
      case "docx":
        return buildDocx(title, text);
      case "doc":
        return new Blob([textToRtf(text)], { type: "application/msword" });
      case "csv":
        return new Blob([tableToCsv(parseCsv(text))], {
          type: "text/csv;charset=utf-8",
        });
      case "xlsx":
        return buildXlsx(parseCsv(text));
      default:
        throw new Error(
          "Сохранение документа в формат " +
            target.toUpperCase() +
            " пока не поддерживается."
        );
    }
  }

  /* -- PDF → текст -- */
  function decodePdfString(value) {
    return String(value)
      .replace(/\\([nrtbf()\\])/g, function (_m, ch) {
        switch (ch) {
          case "n":
            return "\n";
          case "r":
            return "\r";
          case "t":
            return "\t";
          case "b":
            return "\b";
          case "f":
            return "\f";
          default:
            return ch;
        }
      })
      .replace(/\\(\d{1,3})/g, function (_m, oct) {
        return String.fromCharCode(parseInt(oct, 8));
      });
  }

  function extractStringsFromContent(content) {
    var strings = [];
    var re = /\((?:[^()\\]|\\.)*\)/g;
    var m;
    while ((m = re.exec(content)) !== null) {
      strings.push(decodePdfString(m[0].slice(1, -1)));
    }
    return strings;
  }

  function extractPdfText(content) {
    var lines = [];
    var btRe = /BT([\s\S]*?)ET/g;
    var block;
    while ((block = btRe.exec(content)) !== null) {
      var body = block[1];
      var segments = body.split(/\b(Td|TD|Tm|T\*)\b/);
      for (var i = 0; i < segments.length; i++) {
        var trimmed = segments[i].trim();
        if (!trimmed) continue;
        if (/^(Td|TD|Tm|T\*)$/.test(trimmed)) continue;
        var joined = extractStringsFromContent(trimmed).join("");
        if (joined) lines.push(joined);
      }
    }
    return lines.join("\n").replace(/[ \t]+\n/g, "\n");
  }

  async function pdfToText(bytes) {
    var text = latinDecode(bytes);
    var objRe = /(\d+)\s+(\d+)\s+obj([\s\S]*?)endobj/g;
    var streams = [];
    var m;
    while ((m = objRe.exec(text)) !== null) {
      var body = m[3];
      var streamMatch = /stream\r?\n([\s\S]*?)\r?\nendstream/.exec(body);
      if (!streamMatch) continue;
      var dictPart = body.slice(0, body.indexOf("stream"));
      var filterFlate = /\/FlateDecode/.test(dictPart);
      var rawBytes = new Uint8Array(streamMatch[1].length);
      for (var i = 0; i < streamMatch[1].length; i++) {
        rawBytes[i] = streamMatch[1].charCodeAt(i) & 0xff;
      }
      var decoded;
      if (filterFlate) {
        try {
          decoded = await inflateDeflate(rawBytes);
        } catch (e) {
          continue;
        }
      } else {
        decoded = rawBytes;
      }
      streams.push(latinDecode(decoded));
    }
    var allContent = streams.join("\n");
    var extracted = extractPdfText(allContent);
    if (!extracted.trim()) {
      throw new Error(
        "Не удалось извлечь текст из PDF. Возможно, это отсканированный документ."
      );
    }
    return extracted;
  }

  function convertDocument(file, source, target) {
    return file
      .arrayBuffer()
      .then(function (buf) {
        return new Uint8Array(buf);
      })
      .then(async function (bytes) {
        var text = await extractPlainText(source, bytes);
        return buildResultFile(target, text, file.name);
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
    shareButton: document.getElementById("share-button"),
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
    setProgress(0);
    hideProgress();
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
    setProgress(0);
    hideProgress();
    clearResult();
    renderFormats();
  }

  function handleTargetChange() {
    state.target = el.targetSelect.value || "";
    setProgress(0);
    hideProgress();
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
   * Поделиться (Web Share API) и регистрация service worker
   * ------------------------------------------------------------------ */
  function initShare() {
    if (!el.shareButton) return;
    if (typeof navigator.share !== "function") {
      el.shareButton.hidden = true;
      return;
    }
    el.shareButton.hidden = false;
    el.shareButton.addEventListener("click", function () {
      navigator
        .share({
          title: document.title || "FORMATme",
          text: "FORMATme — конвертируйте файлы прямо в браузере.",
          url: window.location.href,
        })
        .catch(function (err) {
          if (err && err.name === "AbortError") return;
          showToast("Не удалось поделиться", true);
        });
    });
  }

  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {
        /* офлайн-режим недоступен (например, при открытии через file://) */
      });
    });
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
    initShare();
    initServiceWorker();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
