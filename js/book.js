/**
 * Mesin Buku Foto 3D Interaktif ("My Sweet Diary")
 * - Desktop (>= 768px): Buku 2-halaman 3D flipbook (9 lembar / 18 sisi)
 * - Mobile (< 768px): Buku 1-halaman penuh dengan animasi 3D flip & touch swipe
 * - Mendukung klik halaman, tombol navigasi, keyboard (← → Home End), & galeri cepat.
 */
(function () {
  const config = window.DIARY_CONFIG;
  const decor = window.CoquetteDecor;
  const lightbox = window.PhotoLightbox;

  if (!config || !decor) return;

  const photos = config.photos || [];
  const pages = buildPageDescriptors();
  const totalPages = pages.length; // 18
  const totalLeaves = Math.ceil(totalPages / 2); // 9

  // State
  let currentLeaf = 0; // Desktop: 0 (sampul depan) .. totalLeaves (sampul belakang)
  let mobilePageIndex = 0; // Mobile: 0 .. totalPages - 1
  let isMobile = window.innerWidth < 768;
  let isGalleryOpen = false;
  let leafElements = [];
  let settleTimers = new Map();
  let touchStartX = 0;
  let touchStartY = 0;

  // Cached DOM nodes
  const bookEl = document.getElementById("book");
  const mobileWrapEl = document.getElementById("mobile-book-card-wrap");
  const mobileStageEl = document.getElementById("mobile-book-stage");
  const bookStageEl = document.getElementById("book-stage");

  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const sidePrev = document.getElementById("side-prev-btn");
  const sideNext = document.getElementById("side-next-btn");
  const btnCover = document.getElementById("btn-cover");
  const btnGallery = document.getElementById("btn-gallery");

  const indicatorText = document.getElementById("page-indicator-text");
  const progressFill = document.getElementById("page-progress-fill");

  const galleryModal = document.getElementById("gallery-modal");
  const galleryBackdrop = document.getElementById("gallery-backdrop");
  const galleryCloseBtn = document.getElementById("gallery-close-btn");
  const galleryGrid = document.getElementById("gallery-grid");

  /**
   * Menyusun daftar 18 halaman secara terstruktur:
   * 0: Front Cover
   * 1: Dedication / Intro
   * 2..15: 14 Foto Polaroid
   * 16: Closing Note
   * 17: Back Cover
   */
  function buildPageDescriptors() {
    const list = [];
    list.push({ type: "cover-front" });
    list.push({ type: "dedication", pageNumber: 1 });

    photos.forEach((photo, idx) => {
      list.push({
        type: "photo",
        photo,
        photoIndex: idx,
        pageNumber: idx + 2
      });
    });

    list.push({ type: "closing", pageNumber: photos.length + 2 });
    list.push({ type: "cover-back" });
    return list;
  }

  /**
   * Membuat HTML untuk setiap tipe halaman agar dipakai ulang di Desktop & Mobile.
   */
  function createPageContentHTML(desc, side) {
    const heartSVG = decor.getStickerSVG("heart");

    if (desc.type === "cover-front") {
      return `
        <div class="cover-lace-frame">
          <span class="cover-corner-heart c-tl">${heartSVG}</span>
          <span class="cover-corner-heart c-tr">${heartSVG}</span>
          <span class="cover-corner-heart c-bl">${heartSVG}</span>
          <span class="cover-corner-heart c-br">${heartSVG}</span>

          <span class="cover-tag">${escapeHTML(config.coverTag)}</span>
          ${decor.HERO_BOW_SVG}

          <div class="cover-medallion">
            <h1 class="cover-title">${escapeHTML(config.bookTitle)}</h1>
            <p class="cover-subtitle">${escapeHTML(config.bookSubtitle)}</p>
          </div>

          <button type="button" class="cover-open-btn" data-action="open-book">
            <span>Buka Buku</span>
            <span aria-hidden="true">✨</span>
          </button>
        </div>
      `;
    }

    if (desc.type === "cover-back") {
      return `
        <div class="cover-lace-frame">
          <span class="cover-corner-heart c-tl">${heartSVG}</span>
          <span class="cover-corner-heart c-tr">${heartSVG}</span>
          <span class="cover-corner-heart c-bl">${heartSVG}</span>
          <span class="cover-corner-heart c-br">${heartSVG}</span>

          ${decor.HERO_BOW_SVG}

          <div class="cover-medallion">
            <h2 class="cover-title" style="font-size: clamp(1.35rem, 2.1vw, 1.8rem);">${escapeHTML(config.closing.backCoverText)}</h2>
            <p class="cover-subtitle">${escapeHTML(config.closing.backCoverSub)}</p>
          </div>

          <button type="button" class="cover-open-btn" data-action="goto-cover">
            <span>Baca dari Awal</span>
            <span aria-hidden="true">🎀</span>
          </button>
        </div>
      `;
    }

    if (desc.type === "dedication") {
      const d = config.dedication;
      const cue = side === "back" ? `<span class="page-turn-cue">← Tutup Sampul</span>` : `<span></span>`;
      return `
        <div class="page-header">
          <span class="memory-badge">🎀 ${escapeHTML(d.badge)}</span>
          <span class="page-mini-doodle">${photos.length} Photos</span>
        </div>
        <div class="page-body">
          <div class="special-card">
            <div class="special-ribbon-icon">${decor.getStickerSVG("bow")}</div>
            <h2 class="special-title">${escapeHTML(d.title)}</h2>
            ${d.paragraphs.map((p) => `<p class="special-text">${escapeHTML(p)}</p>`).join("")}
            <div class="special-signature">
              <span>${escapeHTML(d.signature)}</span>
              <strong>${escapeHTML(d.author)}</strong>
            </div>
            <p class="special-tip">${escapeHTML(d.tip)}</p>
          </div>
        </div>
        <div class="page-footer">
          ${cue}
          <span>Hal. ${desc.pageNumber}</span>
        </div>
      `;
    }

    if (desc.type === "closing") {
      const c = config.closing;
      const cue = side === "front" ? `<span class="page-turn-cue">Tutup Buku →</span>` : `<span></span>`;
      return `
        <div class="page-header">
          <span class="memory-badge">✨ ${escapeHTML(c.badge)}</span>
          <span class="page-mini-doodle">The End</span>
        </div>
        <div class="page-body">
          <div class="special-card">
            <div class="special-ribbon-icon">${decor.getStickerSVG("heart")}</div>
            <h2 class="special-title">${escapeHTML(c.title)}</h2>
            <p class="special-text">${escapeHTML(c.message)}</p>
            <div class="special-quote">${escapeHTML(c.quote)}</div>
            <button type="button" class="replay-btn" data-action="goto-cover">
              <span>Ulang dari Sampul</span>
              <span aria-hidden="true">🎀</span>
            </button>
          </div>
        </div>
        <div class="page-footer">
          <span>Hal. ${desc.pageNumber}</span>
          ${cue}
        </div>
      `;
    }

    // Photo Page
    const p = desc.photo;
    const isLandscape = p.orientation === "landscape";
    const orientationClass = isLandscape ? "is-landscape" : "is-portrait";
    const stickerPos = desc.photoIndex % 2 === 0 ? "sticker-br" : "sticker-tl";
    const cueHTML =
      side === "front"
        ? `<span>Hal. ${desc.pageNumber}</span><span class="page-turn-cue">Lanjut →</span>`
        : side === "back"
          ? `<span class="page-turn-cue">← Kembali</span><span>Hal. ${desc.pageNumber}</span>`
          : `<span>Foto ${desc.photoIndex + 1} / ${photos.length}</span><span>Hal. ${desc.pageNumber}</span>`;

    return `
      <div class="page-header">
        <span class="memory-badge">♥ ${escapeHTML(p.dateLabel)}</span>
        <span class="page-mini-doodle">${String(desc.photoIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}</span>
      </div>
      <div class="page-body">
        <div
          class="polaroid-card ${orientationClass}"
          style="--tilt: ${p.tiltDeg || 0}deg;"
          role="button"
          tabindex="0"
          data-photo-index="${desc.photoIndex}"
          aria-label="Perbesar foto ${escapeHTML(p.title)}"
        >
          <span class="washi-tape tape-${escapeHTML(p.tapeStyle || "gingham")}" aria-hidden="true"></span>
          <span class="page-sticker ${stickerPos}" aria-hidden="true">${decor.getStickerSVG(p.sticker)}</span>

          <div class="polaroid-photo-wrap">
            <img
              src="${encodeURI(p.src)}"
              alt="${escapeHTML(p.title)} — ${escapeHTML(p.caption)}"
            />
            <span class="zoom-chip" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" /></svg>
              Zoom
            </span>
          </div>

          <div class="polaroid-caption-area">
            <h3 class="polaroid-title">${escapeHTML(p.title)}</h3>
            <p class="polaroid-desc">${escapeHTML(p.caption)}</p>
          </div>
        </div>
      </div>
      <div class="page-footer">
        ${cueHTML}
      </div>
    `;
  }

  /**
   * Merender 9 lembar 3D ke DOM untuk tampilan Desktop.
   */
  function renderDesktopBook() {
    if (!bookEl) return;
    bookEl.innerHTML = `<div class="book-ribbon-tail" aria-hidden="true"></div>`;
    leafElements = [];

    for (let i = 0; i < totalLeaves; i++) {
      const frontDesc = pages[i * 2];
      const backDesc = pages[i * 2 + 1];

      const leaf = document.createElement("div");
      leaf.className = "leaf";
      leaf.dataset.leafIndex = String(i);
      leaf.style.zIndex = String(totalLeaves - i);

      // Front Face (Right Side)
      const front = document.createElement("div");
      const frontIsCover = frontDesc.type.startsWith("cover");
      front.className = `page-face page-front ${frontIsCover ? "page-cover" : "page-paper"}`;
      front.innerHTML = createPageContentHTML(frontDesc, "front");
      front.addEventListener("click", (e) => handlePageFaceClick(e, "front", i));

      // Back Face (Left Side)
      const back = document.createElement("div");
      const backIsCover = backDesc.type.startsWith("cover");
      back.className = `page-face page-back ${backIsCover ? "page-cover" : "page-paper"}`;
      back.innerHTML = createPageContentHTML(backDesc, "back");
      back.addEventListener("click", (e) => handlePageFaceClick(e, "back", i));

      leaf.appendChild(front);
      leaf.appendChild(back);
      bookEl.appendChild(leaf);
      leafElements.push(leaf);
    }

    attachPolaroidKeyboardHandlers(bookEl);
    updateDesktopBookVisuals(false);
  }

  function handlePageFaceClick(event, side, leafIndex) {
    // 1. Tombol aksi spesial (Buka Buku / Ulang dari Sampul)
    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn) {
      event.stopPropagation();
      const action = actionBtn.dataset.action;
      if (action === "open-book") {
        decor.triggerSparkleBurst(event.clientX, event.clientY, 12);
        goNext();
      } else if (action === "goto-cover") {
        decor.triggerSparkleBurst(event.clientX, event.clientY, 10);
        goToCover();
      }
      return;
    }

    // 2. Klik foto Polaroid -> buka Lightbox Zoom (jangan membalik halaman)
    const polaroid = event.target.closest(".polaroid-card");
    if (polaroid) {
      event.stopPropagation();
      const photoIdx = Number(polaroid.dataset.photoIndex);
      if (!Number.isNaN(photoIdx) && lightbox) {
        lightbox.open(photoIdx, polaroid);
      }
      return;
    }

    // 3. Klik area halaman -> balik maju (kanan) atau balik mundur (kiri)
    if (side === "front" && leafIndex === currentLeaf) {
      decor.triggerSparkleBurst(event.clientX, event.clientY, 7);
      goNext();
    } else if (side === "back" && leafIndex === currentLeaf - 1) {
      decor.triggerSparkleBurst(event.clientX, event.clientY, 7);
      goPrev();
    }
  }

  function attachPolaroidKeyboardHandlers(container) {
    container.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const polaroid = e.target.closest(".polaroid-card");
      if (!polaroid) return;
      e.preventDefault();
      e.stopPropagation();
      const photoIdx = Number(polaroid.dataset.photoIndex);
      if (!Number.isNaN(photoIdx) && lightbox) {
        lightbox.open(photoIdx, polaroid);
      }
    });
  }

  /**
   * Memperbarui kelas flipped, state posisi buku, dan z-index secara presisi.
   */
  function updateDesktopBookVisuals(animateSingleLeaf, turningIndex) {
    if (!bookEl) return;

    if (currentLeaf === 0) {
      bookEl.dataset.state = "closed-front";
    } else if (currentLeaf >= totalLeaves) {
      bookEl.dataset.state = "closed-back";
    } else {
      bookEl.dataset.state = "open";
    }

    leafElements.forEach((leaf, i) => {
      const shouldBeFlipped = i < currentLeaf;
      const prevTimer = settleTimers.get(i);
      if (prevTimer) {
        clearTimeout(prevTimer);
        settleTimers.delete(i);
      }

      if (animateSingleLeaf && i === turningIndex) {
        leaf.classList.add("is-turning");
        leaf.style.zIndex = String(totalLeaves + 25);

        const finalZ = shouldBeFlipped ? i + 1 : totalLeaves - i;
        const timer = setTimeout(() => {
          leaf.style.zIndex = String(finalZ);
          leaf.classList.remove("is-turning");
          settleTimers.delete(i);
        }, 560);
        settleTimers.set(i, timer);
      } else {
        leaf.classList.remove("is-turning");
        leaf.style.zIndex = String(shouldBeFlipped ? i + 1 : totalLeaves - i);
      }

      leaf.classList.toggle("flipped", shouldBeFlipped);
    });

    updateControlsAndIndicator();
  }

  /**
   * Merender halaman aktif pada Mode Mobile (1-Halaman Penuh).
   */
  function renderMobilePage(direction) {
    if (!mobileWrapEl) return;
    const desc = pages[mobilePageIndex];
    if (!desc) return;

    const isCover = desc.type.startsWith("cover");
    const animClass =
      direction === "next" ? "anim-next-in" : direction === "prev" ? "anim-prev-in" : "";

    mobileWrapEl.innerHTML = "";
    const card = document.createElement("div");
    card.className = `mobile-page-card ${isCover ? "page-cover" : "page-paper"} ${animClass}`;
    card.innerHTML = createPageContentHTML(desc, "mobile");

    card.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        e.stopPropagation();
        if (actionBtn.dataset.action === "open-book") {
          decor.triggerSparkleBurst(e.clientX, e.clientY, 10);
          goNext();
        } else if (actionBtn.dataset.action === "goto-cover") {
          decor.triggerSparkleBurst(e.clientX, e.clientY, 10);
          goToCover();
        }
        return;
      }

      const polaroid = e.target.closest(".polaroid-card");
      if (polaroid) {
        e.stopPropagation();
        const photoIdx = Number(polaroid.dataset.photoIndex);
        if (!Number.isNaN(photoIdx) && lightbox) {
          lightbox.open(photoIdx, polaroid);
        }
        return;
      }

      // Di sampul depan mobile, ketuk mana saja membuka buku
      if (desc.type === "cover-front") {
        decor.triggerSparkleBurst(e.clientX, e.clientY, 9);
        goNext();
      }
    });

    mobileWrapEl.appendChild(card);
    updateControlsAndIndicator();
  }

  /**
   * Navigasi Utama (Sinkron Desktop & Mobile)
   */
  function goNext() {
    if (isMobile) {
      if (mobilePageIndex >= totalPages - 1) return;
      mobilePageIndex += 1;
      currentLeaf = Math.min(totalLeaves, Math.floor((mobilePageIndex + 1) / 2));
      renderMobilePage("next");
    } else {
      if (currentLeaf >= totalLeaves) return;
      const turning = currentLeaf;
      currentLeaf += 1;
      mobilePageIndex = Math.min(totalPages - 1, currentLeaf * 2 - 1);
      updateDesktopBookVisuals(true, turning);
    }
  }

  function goPrev() {
    if (isMobile) {
      if (mobilePageIndex <= 0) return;
      mobilePageIndex -= 1;
      currentLeaf = Math.min(totalLeaves, Math.floor((mobilePageIndex + 1) / 2));
      renderMobilePage("prev");
    } else {
      if (currentLeaf <= 0) return;
      currentLeaf -= 1;
      const turning = currentLeaf;
      mobilePageIndex = currentLeaf === 0 ? 0 : currentLeaf * 2 - 1;
      updateDesktopBookVisuals(true, turning);
    }
  }

  function goToCover() {
    if (isMobile) {
      if (mobilePageIndex === 0) return;
      mobilePageIndex = 0;
      currentLeaf = 0;
      renderMobilePage("prev");
    } else {
      if (currentLeaf === 0) return;
      currentLeaf = 0;
      mobilePageIndex = 0;
      updateDesktopBookVisuals(false);
    }
  }

  function goToBackCover() {
    if (isMobile) {
      if (mobilePageIndex === totalPages - 1) return;
      mobilePageIndex = totalPages - 1;
      currentLeaf = totalLeaves;
      renderMobilePage("next");
    } else {
      if (currentLeaf === totalLeaves) return;
      currentLeaf = totalLeaves;
      mobilePageIndex = totalPages - 1;
      updateDesktopBookVisuals(false);
    }
  }

  function goToPhoto(photoIndex) {
    const targetPageIndex = photoIndex + 2; // 2..15
    if (isMobile) {
      const dir = targetPageIndex >= mobilePageIndex ? "next" : "prev";
      mobilePageIndex = targetPageIndex;
      currentLeaf = Math.floor((targetPageIndex + 1) / 2);
      renderMobilePage(dir);
    } else {
      const leafIdx = Math.floor(targetPageIndex / 2);
      const targetLeaf = targetPageIndex % 2 === 1 ? leafIdx + 1 : leafIdx;
      const diff = Math.abs(targetLeaf - currentLeaf);
      if (diff === 1) {
        const turning = targetLeaf > currentLeaf ? currentLeaf : targetLeaf;
        currentLeaf = targetLeaf;
        mobilePageIndex = targetPageIndex;
        updateDesktopBookVisuals(true, turning);
      } else {
        currentLeaf = targetLeaf;
        mobilePageIndex = targetPageIndex;
        updateDesktopBookVisuals(false);
      }
    }
  }

  /**
   * Memperbarui label indikator halaman, progress bar, dan state tombol.
   */
  function updateControlsAndIndicator() {
    if (isMobile) {
      const desc = pages[mobilePageIndex];
      const progress = (mobilePageIndex / (totalPages - 1)) * 100;
      progressFill.style.width = `${progress.toFixed(1)}%`;

      if (desc.type === "cover-front") {
        indicatorText.textContent = "Sampul Depan";
      } else if (desc.type === "cover-back") {
        indicatorText.textContent = "Sampul Belakang";
      } else if (desc.type === "dedication") {
        indicatorText.textContent = "Pembuka • Hal. 1";
      } else if (desc.type === "closing") {
        indicatorText.textContent = `Penutup • Hal. ${desc.pageNumber}`;
      } else {
        indicatorText.textContent = `Foto ${desc.photoIndex + 1} / ${photos.length}`;
      }

      const atStart = mobilePageIndex === 0;
      const atEnd = mobilePageIndex === totalPages - 1;
      btnPrev.disabled = atStart;
      btnNext.disabled = atEnd;
      btnCover.disabled = atStart;
    } else {
      const progress = (currentLeaf / totalLeaves) * 100;
      progressFill.style.width = `${progress.toFixed(1)}%`;

      if (currentLeaf === 0) {
        indicatorText.textContent = "Sampul Depan";
      } else if (currentLeaf >= totalLeaves) {
        indicatorText.textContent = "Sampul Belakang";
      } else {
        const leftPage = currentLeaf * 2 - 1;
        const rightPage = currentLeaf * 2;
        indicatorText.textContent = `Halaman ${leftPage}–${rightPage} / ${totalPages - 2}`;
      }

      const atStart = currentLeaf === 0;
      const atEnd = currentLeaf >= totalLeaves;
      btnPrev.disabled = atStart;
      btnNext.disabled = atEnd;
      if (sidePrev) sidePrev.disabled = atStart;
      if (sideNext) sideNext.disabled = atEnd;
      btnCover.disabled = atStart;
    }

    updateGalleryHighlight();
  }

  /**
   * Modal Galeri Cepat (Daftar 14 Foto)
   */
  function renderGallery() {
    if (!galleryGrid) return;
    const frag = document.createDocumentFragment();

    photos.forEach((p, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-thumb";
      btn.dataset.photoIndex = String(idx);
      btn.innerHTML = `
        <div class="gallery-thumb-img-wrap">
          <img src="${encodeURI(p.src)}" alt="${escapeHTML(p.title)}" loading="lazy" />
        </div>
        <span class="gallery-thumb-num">Hal. ${idx + 2} • #${String(idx + 1).padStart(2, "0")}</span>
        <span class="gallery-thumb-name">${escapeHTML(p.title)}</span>
      `;
      btn.addEventListener("click", () => {
        closeGallery();
        goToPhoto(idx);
        decor.triggerSparkleBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 9);
      });
      frag.appendChild(btn);
    });

    galleryGrid.innerHTML = "";
    galleryGrid.appendChild(frag);
  }

  function updateGalleryHighlight() {
    if (!galleryGrid) return;
    const activePhotoIndices = new Set();

    if (isMobile) {
      const desc = pages[mobilePageIndex];
      if (desc && desc.type === "photo") activePhotoIndices.add(desc.photoIndex);
    } else if (currentLeaf > 0 && currentLeaf < totalLeaves) {
      const leftDesc = pages[currentLeaf * 2 - 1];
      const rightDesc = pages[currentLeaf * 2];
      if (leftDesc && leftDesc.type === "photo") activePhotoIndices.add(leftDesc.photoIndex);
      if (rightDesc && rightDesc.type === "photo") activePhotoIndices.add(rightDesc.photoIndex);
    }

    galleryGrid.querySelectorAll(".gallery-thumb").forEach((el) => {
      const idx = Number(el.dataset.photoIndex);
      el.classList.toggle("is-current", activePhotoIndices.has(idx));
    });
  }

  function openGallery() {
    if (!galleryModal) return;
    isGalleryOpen = true;
    updateGalleryHighlight();
    galleryModal.hidden = false;
    galleryCloseBtn.focus();
  }

  function closeGallery() {
    if (!galleryModal || !isGalleryOpen) return;
    isGalleryOpen = false;
    galleryModal.hidden = true;
    btnGallery.focus();
  }

  /**
   * Gestur Sentuh (Swipe Kiri/Kanan)
   */
  function attachSwipeHandlers(targetEl) {
    if (!targetEl) return;

    targetEl.addEventListener(
      "touchstart",
      (e) => {
        if (!e.changedTouches.length) return;
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
      },
      { passive: true }
    );

    targetEl.addEventListener(
      "touchend",
      (e) => {
        if (!e.changedTouches.length) return;
        if (isGalleryOpen || (lightbox && lightbox.isOpen())) return;

        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) {
          if (dx < 0) goNext();
          else goPrev();
        }
      },
      { passive: true }
    );
  }

  function escapeHTML(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Inisialisasi Aplikasi
   */
  function init() {
    decor.initAmbientDecorations();
    if (lightbox) lightbox.init(photos);

    // Opsional: dukung ?spread=N untuk langsung membuka bentangan halaman tertentu
    const params = new URLSearchParams(window.location.search);
    const initialSpread = parseInt(params.get("spread"), 10);
    if (!Number.isNaN(initialSpread) && initialSpread >= 0 && initialSpread <= totalLeaves) {
      currentLeaf = initialSpread;
      mobilePageIndex =
        currentLeaf === 0
          ? 0
          : currentLeaf >= totalLeaves
            ? totalPages - 1
            : currentLeaf * 2;
    }

    if (bookEl) bookEl.classList.add("no-transition");
    renderDesktopBook();
    if (bookEl) {
      void bookEl.offsetWidth;
      bookEl.classList.remove("no-transition");
    }
    renderGallery();

    if (isMobile) {
      renderMobilePage();
    }

    // Event Listener Tombol Navigasi
    btnNext.addEventListener("click", goNext);
    btnPrev.addEventListener("click", goPrev);
    if (sideNext) sideNext.addEventListener("click", goNext);
    if (sidePrev) sidePrev.addEventListener("click", goPrev);
    btnCover.addEventListener("click", goToCover);

    btnGallery.addEventListener("click", openGallery);
    galleryCloseBtn.addEventListener("click", closeGallery);
    galleryBackdrop.addEventListener("click", closeGallery);

    // Swipe di desktop touchscreen maupun mobile
    attachSwipeHandlers(bookStageEl);
    attachSwipeHandlers(mobileStageEl);
    attachPolaroidKeyboardHandlers(mobileWrapEl);

    // Navigasi Keyboard
    document.addEventListener("keydown", (e) => {
      if (lightbox && lightbox.isOpen()) return;

      if (isGalleryOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeGallery();
        }
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToCover();
      } else if (e.key === "End") {
        e.preventDefault();
        goToBackCover();
      }
    });

    // Sinkronisasi mulus saat resize antara Desktop dan Mobile
    window.addEventListener("resize", () => {
      const nowMobile = window.innerWidth < 768;
      if (nowMobile !== isMobile) {
        isMobile = nowMobile;
        if (isMobile) {
          mobilePageIndex =
            currentLeaf === 0
              ? 0
              : currentLeaf >= totalLeaves
                ? totalPages - 1
                : currentLeaf * 2 - 1;
          renderMobilePage();
        } else {
          currentLeaf =
            mobilePageIndex === 0
              ? 0
              : mobilePageIndex >= totalPages - 1
                ? totalLeaves
                : Math.floor((mobilePageIndex + 1) / 2);
          updateDesktopBookVisuals(false);
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
