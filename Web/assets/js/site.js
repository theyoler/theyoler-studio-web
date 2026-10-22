/* TheYoler Studio — comportamiento común. Sin dependencias.
   Todo lo que hay que cambiar al publicar está en SITE (justo debajo). */

const SITE = {
  // PENDIENTE: cambiar por la URL real de la página de Steam cuando exista el App ID.
  steamUrl: "https://store.steampowered.com/",
  steamReady: false,             // true cuando steamUrl apunte a la página del juego
  // PENDIENTE: id del vídeo de YouTube del tráiler (lo que va tras "watch?v="). Vacío = marcador.
  youtubeId: "",
  githubUrl: "https://github.com/theyoler/Fragments-of-olympus",
  // PENDIENTE: dirección real de prensa/contacto.
  email: "contacto@theyoler.studio",
  // PENDIENTE: URL de envío del boletín (Buttondown, Mailchimp, Brevo…). Vacío = aviso "aún no disponible".
  newsletterAction: "",
  // PENDIENTE: redes. Las vacías se ocultan.
  socials: {
    x: "",
    bluesky: "",
    youtube: "",
    tiktok: "",
    instagram: "",
    discord: "",
  },
};

/* ---------- Idiomas ----------
   El español está escrito en el HTML. Las demás lenguas viven en i18n.js (window.I18N).
   Para añadir una: copia el bloque "en" con el código nuevo (pt, de, fr, zh, ja) y añádela a LANGS. */
const LANGS = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];
const STORE_KEY = "theyoler.lang";
const original = new Map(); // textos en español sacados del DOM

function store(get, value) {
  try { return get ? localStorage.getItem(STORE_KEY) : localStorage.setItem(STORE_KEY, value); } catch { return null; }
}

function pickLang() {
  const q = new URLSearchParams(location.search).get("lang");
  const saved = store(true);
  const nav = (navigator.language || "es").slice(0, 2);
  for (const c of [q, saved, nav]) if (c && LANGS.some(l => l.code === c)) return c;
  return "en";
}

function applyLang(code) {
  const dict = code === "es" ? null : (window.I18N || {})[code] || {};
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (!original.has(el)) original.set(el, el.innerHTML);
    const t = dict && dict[key];
    el.innerHTML = t != null ? t : original.get(el);
  });
  document.querySelectorAll("[data-i18n-attr]").forEach(el => {
    // formato: "placeholder:clave; aria-label:clave"
    el.dataset.i18nAttr.split(";").forEach(pair => {
      const [attr, key] = pair.split(":").map(s => s.trim());
      const orig = "i18nOrig" + attr.replace(/[^a-z]/gi, "");
      if (!(orig in el.dataset)) el.dataset[orig] = el.getAttribute(attr) || "";
      const t = dict && dict[key];
      el.setAttribute(attr, t != null ? t : el.dataset[orig]);
    });
  });
  document.documentElement.lang = code;
  document.querySelectorAll(".lang").forEach(s => (s.value = code));
}

function initLang() {
  document.querySelectorAll(".lang").forEach(sel => {
    sel.innerHTML = LANGS.map(l => `<option value="${l.code}">${l.label}</option>`).join("");
    sel.addEventListener("change", () => { store(false, sel.value); applyLang(sel.value); });
  });
  applyLang(pickLang());
}

/* ---------- Enlaces configurables ---------- */
function initLinks() {
  document.querySelectorAll('[data-link="steam"]').forEach(a => {
    a.href = SITE.steamUrl;
    if (!SITE.steamReady) a.title = "Enlace provisional: la página de Steam aún no está publicada";
  });
  document.querySelectorAll('[data-link="github"]').forEach(a => (a.href = SITE.githubUrl));
  document.querySelectorAll('[data-link="email"]').forEach(a => {
    a.href = "mailto:" + SITE.email;
    if (!a.children.length) a.textContent = SITE.email;
  });
  document.querySelectorAll("[data-social]").forEach(a => {
    const url = SITE.socials[a.dataset.social];
    if (url) a.href = url; else a.hidden = true;
  });
  document.querySelectorAll("[data-socials-empty]").forEach(el => {
    el.hidden = Object.values(SITE.socials).some(Boolean);
  });
  document.querySelectorAll("[data-steam-pending]").forEach(el => (el.hidden = SITE.steamReady));
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
}

/* ---------- Menú móvil ---------- */
function initMenu() {
  const btn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", e => {
    if (e.target.closest("a")) { nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }
  });
}

/* ---------- Tráiler: carga YouTube solo al pulsar (más ligero y sin cookies hasta entonces) ---------- */
function initVideo() {
  const box = document.querySelector("[data-video]");
  if (!box) return;
  const ph = box.querySelector(".placeholder");
  if (!SITE.youtubeId) return; // se queda el marcador
  ph.hidden = true;
  const thumb = document.createElement("img");
  thumb.src = `https://i.ytimg.com/vi/${SITE.youtubeId}/maxresdefault.jpg`;
  thumb.alt = "";
  const play = document.createElement("button");
  play.className = "video__play";
  play.setAttribute("aria-label", "Play");
  play.innerHTML = '<svg viewBox="0 0 24 24" fill="#1d2140"><path d="M6 4l15 8-15 8z"/></svg>';
  play.addEventListener("click", () => {
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${SITE.youtubeId}?autoplay=1&rel=0"
      title="Trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  });
  box.append(thumb, play);
}

/* ---------- Galería con visor ---------- */
function initGallery() {
  const dlg = document.querySelector(".lightbox");
  if (!dlg || !dlg.showModal) return;
  const img = dlg.querySelector("img");
  document.querySelectorAll(".gallery button[data-full]").forEach(b => {
    b.addEventListener("click", () => {
      img.src = b.dataset.full;
      img.alt = b.querySelector("img")?.alt || "";
      dlg.showModal();
    });
  });
  dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest(".lightbox__close")) dlg.close(); });
}

/* ---------- Boletín ---------- */
function initNewsletter() {
  const form = document.querySelector("[data-newsletter]");
  if (!form) return;
  const msg = form.parentElement.querySelector(".form-msg");
  if (SITE.newsletterAction) { form.action = SITE.newsletterAction; form.method = "post"; return; }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const lang = document.documentElement.lang;
    msg.textContent = (lang !== "es" && window.I18N?.[lang]?.["fo.news.pending"])
      || "El boletín aún no está abierto. Mientras tanto, añade el juego a tu lista de deseados de Steam.";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLinks();
  initLang();
  initMenu();
  initVideo();
  initGallery();
  initNewsletter();
});
