// Run: npm test. Uses Chromium via CHROMIUM_PATH or /usr/bin/chromium.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const originalApp = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const legacyApp = originalApp.replace('<h1>Expeditie<br><em>IJsland</em></h1>', '<h1>Oude versie</h1>').replace(/<span class="day-label">DAG \$\{i\+1\}<\/span>/g, '<span class="pill">DAG 0${i+1}</span>').replace(/if \('serviceWorker' in navigator\) \{[\s\S]*$/, "navigator.serviceWorker.register('./sw.js');");
const legacyWorker = `const CACHE='expeditie-v3';const FILES=['./','./index.html','./app.js','./data.js','./style.css'];self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(new URL(e.request.url).origin===self.location.origin)e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));});`;
let deployment = 'legacy';
const counts = {};
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  counts[pathname] = (counts[pathname] || 0) + 1;
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  let body = fs.readFileSync(file);
  if (pathname === '/sw.js' && deployment === 'legacy') body = legacyWorker;
  if (pathname === '/app.js') body = deployment === 'legacy' ? legacyApp : deployment === 'next' ? originalApp.replace('<h1>Expeditie<br><em>IJsland</em></h1>', '<h1>Nieuwe deployment</h1>') : originalApp;
  if (pathname === '/data.js' && deployment === 'next') body = body.toString().replace('travelers: 27', 'travelers: 28');
  if ((pathname === '/' || pathname === '/index.html') && deployment === 'next') body = body.toString().replace('<body>', '<body data-deployment="next">');
  if (pathname === '/style.css' && deployment === 'next') body = body.toString() + '\n.day-label{font-size:48px}';
  // Simuleer lang gecachte appbestanden: de nieuwe strategie moet die HTTP-cache omzeilen.
  res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'text/plain', 'Cache-Control':'public, max-age=3600'});
  res.end(body);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const context = await browser.newContext({viewport:{width:375,height:812}});
    await context.addInitScript(()=>{if(!localStorage.getItem('expeditie-ijsland-2027-profile'))localStorage.setItem('expeditie-ijsland-2027-profile',JSON.stringify({firstName:'Test',className:'Testklas',bus:null}));});
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    console.log('Installing legacy');await page.goto(url + '/#home');
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    assert.equal(await page.locator('.hero h1').innerText(),'Oude versie');
    console.log('Upgrading legacy');deployment='current';
    // Oud appbestand heeft geen updatecode: trigger de normale browser-worker-update.
    await page.evaluate(()=>{navigator.serviceWorker.getRegistration().then(registration=>registration.update());});
    await page.waitForFunction(()=>document.querySelector('.hero h1')?.textContent==='ExpeditieIJsland',null,{timeout:15000});
    await page.waitForFunction(async()=>!(await caches.keys()).includes('expeditie-v3'));
    console.log('V1.1 loaded');await page.goto(url + '/#programma');
    assert.deepEqual(await page.locator('.day-label').allTextContents(),['DAG 1','DAG 2','DAG 3','DAG 4','DAG 5']);
    assert.ok(await page.locator('.day-label').evaluateAll(nodes=>nodes.every(n=>parseFloat(getComputedStyle(n).fontSize)>=40)));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.goto(url + '/#paklijst');await page.getByLabel('Muts',{exact:true}).check();
    console.log('Offline checks');await context.setOffline(true);await page.reload();assert.ok(await page.getByLabel('Muts',{exact:true}).isChecked());
    await page.goto(url + '/#home');assert.equal(await page.locator('.hero h1').innerText(),'Expeditie\nIJsland');
    // Zelfde sw.js, gewijzigde HTML/CSS/JS/data: reconnect moet ook die deployment ophalen.
    console.log('Reconnect check');deployment='next';await context.setOffline(false);
    await page.evaluate(()=>window.dispatchEvent(new Event('online')));
    await page.waitForFunction(()=>document.querySelector('.hero h1')?.textContent==='Nieuwe deployment');
    assert.equal(await page.evaluate(()=>EXPEDITION.travelers),28);assert.equal(await page.locator('body').getAttribute('data-deployment'),'next');
    await page.goto(url + '/#programma');assert.equal(await page.locator('.day-label').first().evaluate(el=>getComputedStyle(el).fontSize),'48px');
    await page.goto(url + '/#paklijst');assert.ok(await page.getByLabel('Muts',{exact:true}).isChecked());
    // Terug naar de echte release via foreground-check, zonder andere worker-versie.
    console.log('Foreground check');deployment='current';await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForFunction(()=>window.EXPEDITION?.travelers===27);
    await page.goto(url + '/#home');assert.equal(await page.locator('.hero h1').innerText(),'Expeditie\nIJsland');
    // De hero moet zowel zonder logo als met een portretvormig logo netjes schalen.
    const mockLogo = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="495" height="430"><rect width="495" height="430" fill="white"/></svg>');
    for (const width of [320,375,390,430,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(url + '/#home');
      assert.ok(!(await page.locator('.hero').innerText()).includes('EXPEDITIE 01'));
      assert.equal(await page.locator('.hero-island').count(),1);
      for (const logo of [null,mockLogo]) {
        await page.evaluate(value=>{EXPEDITION.heroLogo=value;render();},logo);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        const title = await page.locator('.hero h1').boundingBox();
        const island = await page.locator('.hero-island').boundingBox();
        assert.ok(width<=360 ? island.y>=title.y+title.height-1 : island.x>=title.x+title.width-1,'Kaart blijft naast de titel, of eronder op kleine schermen');
        if (logo) {
          const image=page.locator('.hero-logo');await image.evaluate(img=>img.decode());
          const box=await image.boundingBox();
          assert.ok(box.y+box.height<=title.y,'Logo valt niet over de titel');
          assert.equal(await image.evaluate(img=>getComputedStyle(img).objectFit),'contain');
        }
      }
    }
    await page.evaluate(()=>{EXPEDITION.heroLogo=null;render();});
    await page.screenshot({path:'/tmp/expeditie-hero-desktop.png',fullPage:true});
    await page.setViewportSize({width:375,height:812});
    await page.screenshot({path:'/tmp/expeditie-hero-mobile.png',fullPage:true});
    const before = counts['/index.html'];
    await page.evaluate(()=>navigator.serviceWorker.controller.postMessage({type:'CHECK_APP_UPDATE'}));
    await page.waitForFunction(async()=>{const cache=await caches.open('expeditie-v9');return Boolean(await cache.match('./app.js'));});
    await page.waitForTimeout(400);
    assert.ok(counts['/index.html']-before<=1,'Ongewijzigde bestanden veroorzaken geen reload-loop');
    assert.deepEqual(errors,[]);
    console.log('PASS: upgrade legacy V1 → V1.1, HTTP-cache bypass, large mobile day labels, offline navigation, reconnect/foreground update without sw.js change, CSS/data refresh, packing preserved, responsive hero/map/logo, no reload loop or JS errors.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.closeAllConnections();server.close();});
