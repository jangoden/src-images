/**
 * Lightbox Zoom Foto Resolusi Penuh
 * Mendukung navigasi klik, keyboard (Esc, ←, →), dan geser layar (swipe).
 */
(function () {
  let photos = [];
  let currentIndex = 0;
  let isOpen = false;
  let touchStartX = 0;
  let lastTriggerEl = null;

  const els = {};

  function cacheElements() {
    els.modal = document.getElementById("lightbox");
    els.backdrop = document.getElementById("lightbox-backdrop");
    els.img = document.getElementById("lightbox-img");
    els.badge = document.getElementById("lightbox-badge");
    els.counter = document.getElementById("lightbox-counter");
    els.title = document.getElementById("lightbox-title");
    els.desc = document.getElementById("lightbox-desc");
    els.closeBtn = document.getElementById("lightbox-close");
    els.prevBtn = document.getElementById("lightbox-prev");
    els.nextBtn = document.getElementById("lightbox-next");
  }

  function renderCurrent() {
    const item = photos[currentIndex];
    if (!item) return;

    els.img.src = encodeURI(item.src);
    els.img.alt = `${item.title} — ${item.caption}`;
    els.badge.textContent = item.dateLabel;
    els.counter.textContent = `${currentIndex + 1} / ${photos.length}`;
    els.title.textContent = item.title;
    els.desc.textContent = item.caption;
  }

  function open(photoIndex, triggerEl) {
    if (!photos.length) return;
    currentIndex = ((photoIndex % photos.length) + photos.length) % photos.length;
    lastTriggerEl = triggerEl || null;
    isOpen = true;

    renderCurrent();
    els.modal.hidden = false;
    document.body.style.overflow = "hidden";
    els.closeBtn.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    els.modal.hidden = true;
    document.body.style.overflow = "";
    if (lastTriggerEl && typeof lastTriggerEl.focus === "function") {
      lastTriggerEl.focus();
    }
  }

  function prev() {
    if (!isOpen) return;
    currentIndex = (currentIndex - 1 + photos.length) % photos.length;
    renderCurrent();
  }

  function next() {
    if (!isOpen) return;
    currentIndex = (currentIndex + 1) % photos.length;
    renderCurrent();
  }

  function init(photoList) {
    photos = Array.isArray(photoList) ? photoList : [];
    cacheElements();
    if (!els.modal) return;

    els.closeBtn.addEventListener("click", close);
    els.backdrop.addEventListener("click", close);
    els.prevBtn.addEventListener("click", prev);
    els.nextBtn.addEventListener("click", next);

    document.addEventListener("keydown", (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    });

    els.modal.addEventListener(
      "touchstart",
      (e) => {
        if (!isOpen || !e.changedTouches.length) return;
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );

    els.modal.addEventListener(
      "touchend",
      (e) => {
        if (!isOpen || !e.changedTouches.length) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 45) {
          if (dx < 0) next();
          else prev();
        }
      },
      { passive: true }
    );
  }

  window.PhotoLightbox = {
    init,
    open,
    close,
    isOpen: () => isOpen
  };
})();
