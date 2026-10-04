(function () {
  "use strict";

  var ICONS = {
    sparkles:
      '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    check: '<path d="M21 12a9 9 0 1 1-9-9"/><path d="m9 12 2 2 4-4"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    alert:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    trash:
      '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    spinner: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    fileDown:
      '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>',
    archive:
      '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    share:
      '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  };

  var SVG_TEMPLATE =
    '<svg class="icon" width="__W__" height="__H__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">__BODY__</svg>';

  function icon(name, size) {
    size = size || 16;
    var body = ICONS[name] || "";
    return SVG_TEMPLATE.replace("__W__", String(size))
      .replace("__H__", String(size))
      .replace("__BODY__", body);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
    return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
  }

  function plural(count, one, few, many) {
    var mod10 = count % 10;
    var mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return (
      "id-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2)
    );
  }

  function toast(message, type) {
    var viewport = document.getElementById("toast-viewport");
    if (!viewport) return;
    var el = document.createElement("div");
    el.className = "toast " + (type === "error" ? "error" : "success");
    var iconName = type === "error" ? "alert" : "checkCircle";
    var iconClass = "toast-icon";
    el.innerHTML =
      '<span class="' +
      iconClass +
      '">' +
      icon(iconName, 16) +
      '</span><div class="toast-body"></div>' +
      '<button type="button" class="toast-close" aria-label="Закрыть">' +
      icon("x", 14) +
      "</button>";
    el.querySelector(".toast-body").textContent = message;
    el.querySelector(".toast-close").addEventListener("click", function () {
      remove();
    });
    viewport.appendChild(el);
    var timer = setTimeout(remove, 5000);
    function remove() {
      clearTimeout(timer);
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  }

  function initPwa() {
    var installBtn = document.getElementById("install-btn");
    var deferredPrompt = null;

    window.addEventListener("beforeinstallprompt", function (event) {
      event.preventDefault();
      deferredPrompt = event;
      if (installBtn) installBtn.classList.remove("hidden");
    });

    window.addEventListener("appinstalled", function () {
      deferredPrompt = null;
      if (installBtn) installBtn.classList.add("hidden");
    });

    if (installBtn) {
      installBtn.addEventListener("click", function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          installBtn.classList.add("hidden");
        });
      });
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    }
  }

  function initFooterYear() {
    var nodes = document.querySelectorAll("[data-year]");
    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = year;
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  function initShare() {
    var btn = document.getElementById("share-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var url = window.location.href;
      var title = document.title;
      if (typeof navigator.share === "function") {
        navigator.share({ title: title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(url)
          .then(function () {
            toast("Ссылка скопирована");
          })
          .catch(function () {
            if (fallbackCopy(url)) toast("Ссылка скопирована");
            else toast("Не удалось скопировать ссылку", "error");
          });
        return;
      }
      if (fallbackCopy(url)) toast("Ссылка скопирована");
      else toast("Не удалось скопировать ссылку", "error");
    });
  }

  function init() {
    initFooterYear();
    initPwa();
    initShare();
  }

  window.App = {
    icon: icon,
    formatBytes: formatBytes,
    plural: plural,
    uuid: uuid,
    toast: toast,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
