/* TheYoler Studio — aviso cuando LaLiga bloquea Cloudflare.
   Los días de partido las operadoras españolas bloquean las IP de Cloudflare y la web no responde.
   Este service worker se instala en la primera visita; en las siguientes, si la página no llega
   pero la copia de GitHub Pages sí, enseña un aviso con el enlace a esa copia.
   No guarda nada en caché: si la web funciona, todo pasa directo. */

const MIRROR = "https://theyoler.github.io/theyoler-studio-web";
const PAGE_TIMEOUT = 8000;   // ms antes de dar la web por bloqueada
const PROBE_TIMEOUT = 5000;  // ms para comprobar que la copia responde

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(navigate(e.request));
});

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

async function navigate(request) {
  try {
    return await withTimeout(fetch(request), PAGE_TIMEOUT);
  } catch {
    // Sin internet no es culpa del fútbol: solo avisamos si la copia sí responde.
    try {
      await withTimeout(fetch(MIRROR + "/robots.txt", { mode: "no-cors", cache: "no-store" }), PROBE_TIMEOUT);
    } catch {
      return Response.error();
    }
    const url = new URL(request.url);
    return new Response(blockedPage(MIRROR + url.pathname + url.search), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}

function blockedPage(mirrorUrl) {
  const href = mirrorUrl.replace(/"/g, "%22");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bloqueados por el fútbol — TheYoler Studio</title>
<style>
  :root { --ink: #1d2140; --ink-soft: #4a4f73; --marble: #fbf6ec; --gold: #e0a92e; --paper: #fff; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px;
         background: linear-gradient(160deg, #f7d7a8, #f4b8a6 55%, #c9b8e8); color: var(--ink);
         font: 18px/1.5 Georgia, "Times New Roman", serif; }
  .card { max-width: 520px; width: 100%; background: var(--marble); border: 3px solid var(--ink);
          border-radius: 14px; box-shadow: 5px 5px 0 var(--ink); padding: 32px 28px; text-align: center; }
  .ball { font-size: 56px; line-height: 1; }
  h1 { font-size: 26px; margin: 12px 0 8px; letter-spacing: .02em; }
  p { margin: 0 0 20px; color: var(--ink-soft); }
  a.btn { display: inline-block; background: var(--gold); color: var(--ink); text-decoration: none; font-weight: bold;
          border: 3px solid var(--ink); border-radius: 999px; box-shadow: 3px 3px 0 var(--ink); padding: 12px 24px; }
  a.btn:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--ink); }
  .retry { display: block; margin-top: 18px; font-size: 15px; color: var(--ink-soft); }
</style>
</head>
<body>
  <main class="card">
    <div class="ball" aria-hidden="true">⚽</div>
    <h1>Hoy LaLiga ha bloqueado media internet</h1>
    <p>…y a nosotros con ella. Los días de partido las operadoras españolas cortan el acceso a esta web. La copia de siempre sigue en pie:</p>
    <a class="btn" href="${href}">Ir a la web que no depende del fútbol →</a>
    <a class="retry" href="">Reintentar aquí</a>
  </main>
</body>
</html>`;
}
