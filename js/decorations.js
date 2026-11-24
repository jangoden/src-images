/**
 * Dekorasi Coquette SVG (Pita, Hati, Sparkle, Bunga, Kupu-kupu)
 * serta animasi partikel lembut & efek kilau saat membalik halaman.
 */
(function () {
  const STICKER_SVGS = {
    bow: `
      <svg viewBox="0 0 64 46" aria-hidden="true">
        <path d="M32 21 C23 8, 5 6, 7 20 C9 30, 23 28, 32 21 Z" fill="#f7a8c4" stroke="#d95d89" stroke-width="2" />
        <path d="M32 21 C41 8, 59 6, 57 20 C55 30, 41 28, 32 21 Z" fill="#f7a8c4" stroke="#d95d89" stroke-width="2" />
        <path d="M29 24 L17 42 L25 39 L31 26 Z" fill="#f28fb1" stroke="#d95d89" stroke-width="1.6" stroke-linejoin="round" />
        <path d="M35 24 L47 42 L39 39 L33 26 Z" fill="#f28fb1" stroke="#d95d89" stroke-width="1.6" stroke-linejoin="round" />
        <circle cx="32" cy="21" r="5.5" fill="#ec729d" stroke="#ffffff" stroke-width="1.5" />
      </svg>
    `,
    heart: `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 41 C24 41 7 30 7 17.5 C7 11.5 11.5 7.5 16.8 7.5 C20.2 7.5 22.8 9.4 24 12 C25.2 9.4 27.8 7.5 31.2 7.5 C36.5 7.5 41 11.5 41 17.5 C41 30 24 41 24 41 Z" fill="#f7a4c2" stroke="#d95d89" stroke-width="2.2" stroke-linejoin="round" />
        <path d="M14 15 C14.5 12.5 16.5 11.2 18.8 11.2" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    `,
    sparkle: `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 4 L28 19 L43 24 L28 29 L24 44 L20 29 L5 24 L20 19 Z" fill="#fde3a7" stroke="#d9a76a" stroke-width="2" stroke-linejoin="round" />
        <path d="M38 6 L39.5 11 L44 12.5 L39.5 14 L38 19 L36.5 14 L32 12.5 L36.5 11 Z" fill="#f7a4c2" />
      </svg>
    `,
    flower: `
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="13" r="8" fill="#fbd2e1" stroke="#e3799f" stroke-width="1.6" />
        <circle cx="34" cy="21" r="8" fill="#fbd2e1" stroke="#e3799f" stroke-width="1.6" />
        <circle cx="30" cy="33" r="8" fill="#fbd2e1" stroke="#e3799f" stroke-width="1.6" />
        <circle cx="18" cy="33" r="8" fill="#fbd2e1" stroke="#e3799f" stroke-width="1.6" />
        <circle cx="14" cy="21" r="8" fill="#fbd2e1" stroke="#e3799f" stroke-width="1.6" />
        <circle cx="24" cy="24" r="6.5" fill="#fde3a7" stroke="#d9a76a" stroke-width="1.6" />
      </svg>
    `,
    butterfly: `
      <svg viewBox="0 0 54 46" aria-hidden="true">
        <path d="M27 22 C19 8, 5 7, 7 19 C9 28, 19 28, 26 24 Z" fill="#f9bfd4" stroke="#d95d89" stroke-width="1.8" />
        <path d="M27 22 C35 8, 49 7, 47 19 C45 28, 35 28, 28 24 Z" fill="#f9bfd4" stroke="#d95d89" stroke-width="1.8" />
        <path d="M26 25 C17 26, 11 33, 15 39 C19 43, 25 37, 27 29 Z" fill="#fde0ea" stroke="#d95d89" stroke-width="1.6" />
        <path d="M28 25 C37 26, 43 33, 39 39 C35 43, 29 37, 27 29 Z" fill="#fde0ea" stroke="#d95d89" stroke-width="1.6" />
        <ellipse cx="27" cy="25" rx="2.4" ry="8" fill="#b8426e" />
      </svg>
    `
  };

  const HERO_BOW_SVG = `
    <svg class="cover-bow-hero" viewBox="0 0 120 76" aria-hidden="true">
      <defs>
        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff5f9" />
          <stop offset="48%" stop-color="#f7b3cc" />
          <stop offset="100%" stop-color="#e5729b" />
        </linearGradient>
        <linearGradient id="tailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ee82a9" />
          <stop offset="100%" stop-color="#f9c6d8" />
        </linearGradient>
      </defs>
      <path d="M54 34 C44 48, 32 61, 24 72 L38 67 L46 73 C51 60, 56 47, 58 37 Z" fill="url(#tailGrad)" stroke="#d95d89" stroke-width="2" stroke-linejoin="round" />
      <path d="M66 34 C76 48, 88 61, 96 72 L82 67 L74 73 C69 60, 64 47, 62 37 Z" fill="url(#tailGrad)" stroke="#d95d89" stroke-width="2" stroke-linejoin="round" />
      <path d="M58 32 C42 9, 9 7, 12 30 C15 47, 42 44, 58 32 Z" fill="url(#ribbonGrad)" stroke="#d95d89" stroke-width="2.2" />
      <path d="M62 32 C78 9, 111 7, 108 30 C105 47, 78 44, 62 32 Z" fill="url(#ribbonGrad)" stroke="#d95d89" stroke-width="2.2" />
      <path d="M24 27 C32 23, 44 25, 52 31" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.8" />
      <path d="M96 27 C88 23, 76 25, 68 31" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.8" />
      <rect x="52" y="23" width="16" height="18" rx="8" fill="#ec6f9b" stroke="#ffffff" stroke-width="2" />
    </svg>
  `;

  function getStickerSVG(name) {
    return STICKER_SVGS[name] || STICKER_SVGS.bow;
  }

  function initAmbientDecorations() {
    const layer = document.getElementById("ambient-layer");
    if (!layer) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const types = ["sparkle", "heart", "bow", "sparkle", "flower", "heart"];
    const count = window.innerWidth < 768 ? 11 : 18;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "ambient-item";
      const type = types[i % types.length];
      el.innerHTML = getStickerSVG(type);

      const left = ((i + 0.5) / count) * 96 + (Math.random() * 4 - 2);
      const size = 14 + Math.random() * 14;
      const dur = 14 + Math.random() * 12;
      const delay = -(Math.random() * dur);
      const drift = (Math.random() > 0.5 ? 1 : -1) * (16 + Math.random() * 26);
      const opacity = 0.25 + Math.random() * 0.3;

      el.style.left = `${Math.max(2, Math.min(96, left))}%`;
      el.style.setProperty("--size", `${size.toFixed(1)}px`);
      el.style.setProperty("--dur", `${dur.toFixed(1)}s`);
      el.style.setProperty("--delay", `${delay.toFixed(1)}s`);
      el.style.setProperty("--drift", `${drift.toFixed(1)}px`);
      el.style.setProperty("--max-opacity", opacity.toFixed(2));

      frag.appendChild(el);
    }

    layer.appendChild(frag);
  }

  function triggerSparkleBurst(originX, originY, count = 9) {
    const layer = document.getElementById("sparkle-burst-layer");
    if (!layer) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const cx = typeof originX === "number" ? originX : window.innerWidth * 0.5;
    const cy = typeof originY === "number" ? originY : window.innerHeight * 0.48;
    const icons = ["sparkle", "heart", "bow"];

    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "burst-particle";
      p.innerHTML = getStickerSVG(icons[i % icons.length]);

      const size = 14 + Math.random() * 11;
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
      const dist = 42 + Math.random() * 72;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 16;
      const rot = (Math.random() > 0.5 ? 1 : -1) * (35 + Math.random() * 80);

      p.style.left = `${cx - size / 2}px`;
      p.style.top = `${cy - size / 2}px`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.setProperty("--tx", `${tx.toFixed(1)}px`);
      p.style.setProperty("--ty", `${ty.toFixed(1)}px`);
      p.style.setProperty("--rot", `${rot.toFixed(1)}deg`);

      layer.appendChild(p);
      setTimeout(() => p.remove(), 820);
    }
  }

  window.CoquetteDecor = {
    getStickerSVG,
    HERO_BOW_SVG,
    initAmbientDecorations,
    triggerSparkleBurst
  };
})();
