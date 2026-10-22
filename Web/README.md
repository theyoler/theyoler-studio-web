# Web de TheYoler Studio

Web estática (HTML, CSS y JS sin dependencias) del estudio, con la página de **Fragments of Olympus** dentro.

```
Web/
├─ index.html                     Portada del estudio (juegos en desarrollo, el estudio, contacto)
├─ fragments-of-olympus/index.html Página del juego
├─ 404.html                       Página de error (Cloudflare la usa sola)
├─ _headers                       Cabeceras y caché para Cloudflare Pages
├─ robots.txt
└─ assets/
   ├─ css/style.css               Estilos compartidos
   ├─ js/site.js                  Configuración (enlaces) + idiomas, menú, galería, vídeo
   ├─ js/i18n.js                  Traducciones (el español está en el HTML)
   ├─ fonts/                      Cinzel y Marcellus (OFL), las mismas del juego
   └─ img/                        Capturas y recortes sacados del proyecto
```

## Subirla a Cloudflare Pages

No hay paso de compilación: se publica la carpeta `Web` tal cual.

**Opción A — arrastrar y soltar (lo más rápido)**
1. Cloudflare → *Workers & Pages* → *Create* → *Pages* → *Upload assets*.
2. Nombre del proyecto (p. ej. `theyoler`) y arrastra la carpeta `Web`.
3. Queda en `https://theyoler.pages.dev`. Para actualizar: *Create new deployment* y volver a subirla.

**Opción B — desde Git**
1. Sube el repositorio a GitHub y en Cloudflare elige *Connect to Git*.
2. *Framework preset*: `None` · *Build command*: (vacío) · *Build output directory*: `Web`.

**Opción C — por consola** (necesita Node):
```bash
npx wrangler pages deploy Web --project-name theyoler
```

Dominio propio: en el proyecto de Pages → *Custom domains*.

## Qué falta (marcado en la web con etiquetas «Pendiente»)

Todo lo que se cambia a mano está arriba de `assets/js/site.js`, en `SITE`:

| Campo | Qué poner |
|---|---|
| `steamUrl` + `steamReady: true` | URL de la página de Steam cuando exista el App ID (ahora apunta a la portada de Steam) |
| `youtubeId` | Id del tráiler en YouTube (lo que va tras `watch?v=`). Se carga solo al pulsar, sin cookies |
| `email` | Correo real de prensa/contacto |
| `newsletterAction` | URL de envío del formulario del boletín (Buttondown, Brevo, Mailchimp…). Sin ella sale un aviso |
| `socials` | Enlaces de redes; las vacías no se muestran |

Además:
- **Key art y logo**: la portada del juego usa la escena del menú (`assets/img/fragments/hero.jpg`) y el título en texto. Cambiarlos cuando estén el key art y el logo en PNG transparente.
- **Capturas**: son provisionales del desarrollo; faltan dos huecos (combate en grupo y cooperativo). Mejor a 1920×1080 con el HUD final.
- **Retratos** de Atenea, Zeus y Cronos (modelos en curso).
- **Foto del estudio**, **kit de prensa** y **aviso legal / privacidad** (obligatorio si se recogen correos).
- `og:image` usa una ruta relativa: cuando haya dominio, ponerla absoluta (`https://…/assets/img/fragments/og.jpg`) para que se vea al compartir.

## Idiomas

El español está escrito en el HTML; el inglés en `assets/js/i18n.js`. Para añadir portugués, alemán, francés, chino o japonés: copiar el bloque `en` con el código nuevo, traducirlo y añadir el idioma a `LANGS` en `site.js`. Las claves que falten se ven en español. El idioma se elige por el navegador, se recuerda al cambiarlo y se puede forzar con `?lang=en`.

## Verla en local

Desde la raíz del proyecto:
```bash
python -m http.server 8780 --directory Web
```
y abrir http://localhost:8780 (o la configuración `web` de `.claude/launch.json`).
