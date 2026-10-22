/* TheYoler Studio — comportamiento común. Sin dependencias.
   Todo lo que hay que cambiar al publicar está en SITE (justo debajo). */

const SITE = {
  // PENDIENTE: cambiar por la URL real de la página de Steam cuando exista el App ID.
  steamUrl: "https://store.steampowered.com/",
  steamReady: false,             // true cuando steamUrl apunte a la página del juego (y cambiar el texto de los botones de Steam)
  // PENDIENTE: id del vídeo de YouTube del tráiler (lo que va tras "watch?v="). Vacío = marcador.
  youtubeId: "",
  githubUrl: "https://github.com/theyoler/Fragments-of-olympus",
  email: "theyolerstudio@gmail.com",
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
    if (SITE.steamReady) { a.href = SITE.steamUrl; return; }
    // Sin página aún: los botones se quedan como aviso "próximamente" y el enlace de las redes se oculta
    if (!a.classList.contains("btn")) { a.hidden = true; return; }
    a.removeAttribute("href");
    a.removeAttribute("target");
    a.setAttribute("aria-disabled", "true");
    a.classList.add("is-soon");
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
  document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
}

/* ---------- Menú móvil ---------- */
function initMenu() {
  const btn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");
  if (!btn || !nav) return;
  const close = () => { nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", e => { if (e.target.closest("a")) close(); });
  // Se cierra también con Escape o tocando fuera del menú
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("is-open")) { close(); btn.focus(); } });
  document.addEventListener("click", e => { if (!nav.contains(e.target) && !btn.contains(e.target)) close(); });
}

/* ---------- Cabecera: sombra al bajar y enlace de la sección visible resaltado ---------- */
function initTopbar() {
  const bar = document.querySelector(".topbar");
  if (!bar) return;
  const onScroll = () => bar.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = new Map();
  document.querySelectorAll('.nav a[href^="#"]').forEach(a => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (sec) links.set(sec, a);
  });
  if (!links.size || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.remove("is-active"));
      links.get(e.target).classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((_, sec) => io.observe(sec));
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
      || "El boletín aún no está abierto. Vuelve a pasarte pronto.";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLinks();
  initLang();
  initMenu();
  initTopbar();
  initVideo();
  initNewsletter();
});
