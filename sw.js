const CACHE = 'expeditie-v23';
const FILES = ['./index.html','./style.css','./themes.css','./data.js','./app.js','./modules.js','./geo.js','./routes.js','./v5.js','./assets/geo-tectonic.svg','./assets/geo-volcano.svg','./assets/geo-glacier.svg','./assets/geo-energy.svg','./assets/geo-aurora.svg','./assets/geo-waterfall.svg','./assets/geo-basalt.svg','./assets/geo-rift.svg','./assets/geo-geyser.svg','./assets/v5-waterfall.webp','./assets/v5-valley.webp','./assets/v5-sky.webp','./assets/v5-ice-landscape.webp','./assets/leaflet/leaflet.js','./assets/leaflet/leaflet.css','./manifest.webmanifest','./assets/landscape.svg','./assets/iceland.svg','./assets/iceland-topography.png','./assets/maris-logo.png','./assets/geo-contours.svg','./assets/geo-atlas.svg','./assets/geo-future-layer.svg','./assets/fresh-landscape.svg','./assets/adventure-landscape.svg','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png'];
const appURLs = new Set(FILES.map(file => new URL(file, self.registration.scope).href));
const indexURL = new URL('./index.html', self.registration.scope).href;
let refreshPromise;
let refreshQueued = false;

// CacheStorage verzorgt offline gebruik. De HTTP-cache mag geen oude deployment leveren.
async function download(file) {
  const response = await fetch(new Request(file, { cache: 'no-store' }));
  if (!response.ok) throw new Error(`Appbestand niet beschikbaar: ${response.status}`);
  return response;
}
async function refreshApp(notify) {
  if (refreshPromise) {
    // Een foreground/reconnect-check tijdens een oudere check verdient een
    // nieuwe downloadronde: de deployment kan intussen veranderd zijn.
    if (notify) refreshQueued = true;
    await refreshPromise;
    if (refreshQueued) {
      refreshQueued = false;
      return refreshApp(true);
    }
    return;
  }
  refreshQueued = false;
  refreshPromise = (async () => {
    const cache = await caches.open(CACHE);
    const urls = [...appURLs];
    const previous = await Promise.all(urls.map(url => cache.match(url)));
    const responses = await Promise.all(urls.map(download));
    let changed = false;
    for (let i = 0; i < urls.length; i++) {
      if (previous[i] && !changed) {
        const oldBytes = new Uint8Array(await previous[i].arrayBuffer());
        const newBytes = new Uint8Array(await responses[i].clone().arrayBuffer());
        changed = oldBytes.length !== newBytes.length || oldBytes.some((byte, j) => byte !== newBytes[j]);
      }
    }
    // Pas publiceren als alle downloads gelukt zijn; mislukte checks bewaren de offline versie.
    await Promise.all(urls.map((url, i) => cache.put(url, responses[i])));
    if (notify && changed) {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => client.postMessage({ type: 'APP_UPDATED' }));
    }
  })().finally(() => { refreshPromise = undefined; });
  return refreshPromise;
}
self.addEventListener('install', event => {
  event.waitUntil(refreshApp(false).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const legacyInstallation = keys.some(key => /^expeditie-v[123]$/.test(key));
    await Promise.all(keys.filter(key => key.startsWith('expeditie-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
    // De oude app heeft nog geen update-listener. Eenmalig ook die open tabbladen vernieuwen.
    if (legacyInstallation) {
      const clients = await self.clients.matchAll({ type: 'window' });
      // Niet wachten op navigatie tijdens activate: de nieuwe pagina wacht op deze activatie.
      clients.filter(client => client.url.startsWith(self.registration.scope)).forEach(client => { client.navigate(client.url).catch(() => {}); });
    }
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'CHECK_APP_UPDATE') {
    // Offline is een normale situatie; de bestaande complete cache blijft behouden.
    event.waitUntil(refreshApp(true).catch(() => {}));
  }
});
function withoutHTTPCache(response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const navigation = request.mode === 'navigate' && url.href.startsWith(self.registration.scope);
  if (!navigation && !appURLs.has(url.href)) return;
  const cacheKey = navigation ? indexURL : url.href;
  event.respondWith((async () => {
    try {
      // Network-first, ook voorbij de browser-HTTP-cache. Geen timeout die traag internet
      // ten onrechte als offline behandelt en bezoekers opnieuw de oude versie toont.
      const response = await fetch(new Request(request, { cache: 'no-store' }));
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(cacheKey, copy)));
        return withoutHTTPCache(response);
      }
      const cached = await (await caches.open(CACHE)).match(cacheKey);
      return withoutHTTPCache(cached || response);
    } catch {
      const cached = await (await caches.open(CACHE)).match(cacheKey);
      return cached ? withoutHTTPCache(cached) : Response.error();
    }
  })());
});

// Ontvangst voorbereid; geen abonnement, keys of verzendbackend actief.
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { /* Ongeldige payload toont een algemene melding. */ }
  const title = typeof payload.title === 'string' ? payload.title.slice(0,100) : 'Expeditie IJsland';
  const body = typeof payload.body === 'string' ? payload.body.slice(0,300) : 'Er is een nieuw expeditiebericht.';
  let target = new URL('./#home', self.registration.scope);
  try { const requested = new URL(payload.url, self.registration.scope); if (requested.href.startsWith(self.registration.scope)) target = requested; } catch {}
  event.waitUntil(self.registration.showNotification(title, { body, icon:new URL('./assets/icon-192.png',self.registration.scope).href, data:{url:target.href} }).catch(() => {}));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || new URL('./#home',self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({type:'window'}).then(async clients => {
    const client=clients.find(client=>client.url.startsWith(self.registration.scope));
    if(client){await client.navigate(target);return client.focus();}
    return self.clients.openWindow(target);
  }));
});
