const {chromium}=require('playwright');const assert=require('node:assert/strict');const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{let file=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':new URL(req.url,'http://localhost').pathname);if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));});
const vm=require('node:vm');const {execFileSync}=require('node:child_process');
const baselineContext={window:{}};vm.runInNewContext(execFileSync('git',['show','3a5920b9a51395eb88f73f20b3e89b06c9b107e2:data.js'],{cwd:root}).toString(),baselineContext);
const expectedEvents=[['08:30','Verzamelen Maris Bohemen + paspoortcheck'],['11:20','Vertrek Schiphol met HV6887'],['13:45','Aankomst Keflavík'],['±14:30','Vertrek vanaf Keflavík Airport'],['±15:00','Bridge Between Continents'],['±15:45','Gunnuhver Geothermal Area'],['±16:15','Vertrek richting Laugarvatn'],['±18:00','Aankomst accommodatie Laugarvatn'],['19:00','Diner'],['20:00','Kamers & avondprogramma'],['21:30','Naar bed']];
const names=['Welkom in IJsland','Watervallen','Geologie & Ontspanning','Golden Circle & Reykjavík','Terugvlucht'];
const stops=[['Keflavík Airport','Bridge Between Continents','Gunnuhver Geothermal Area','Laugarvatn'],['Laugarvatn','Seljalandsfoss','Skógafoss','Sólheimajökull','Reynisfjara','Vík','Laugarvatn'],['Laugarvatn','Þingvellir / Silfra','Kerið','Secret Lagoon','Laugarvatn'],['Laugarvatn','Gullfoss','Geysir / Strokkur','Reykjavík'],['Reykjavík','Keflavík Airport']];
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const ctx=await browser.newContext();let mode='ok';await require('./map-fixtures.cjs')(ctx,()=>mode);await ctx.addInitScript(()=>localStorage.setItem('expeditie-ijsland-2027-profile',JSON.stringify({firstName:'Test',className:'4T'})));
 const page=await ctx.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto(url+'/#kaart');
 assert.deepEqual(await page.evaluate(()=>EXPEDITION.days.map(day=>day.title)),names);
 assert.deepEqual(await page.evaluate(()=>EXPEDITION.days.slice(1)),JSON.parse(JSON.stringify(baselineContext.window.EXPEDITION.days.slice(1))));
 const metadata=await page.evaluate(()=>['Bridge Between Continents, Iceland','Gunnuhver Geothermal Area, Iceland'].map(key=>EXPEDITION.routeLocations[key]));
 assert.deepEqual(metadata.map(location=>location.geoTheme),['platentektoniek / Mid-Atlantische Rug','geothermie / vulkanisme']);
 assert.deepEqual(metadata.map(location=>location.podcastTitle),['Waarom scheurt IJsland uit elkaar?','Waarom kookt de aarde hier?']);
 for(const location of metadata){for(const field of ['id','name','lat','lng','geoTheme','description','podcastTitle','audioSrc','fact','lookTask','photoChallenge','visited'])assert.ok(Object.hasOwn(location,field));assert.equal(location.audioSrc,null);assert.equal(location.visited,false);assert.ok(Number.isFinite(location.lat)&&Number.isFinite(location.lng));}
 assert.equal(await page.locator('audio').count(),0);
 for(const design of ['v1','v2','v3','v4'])for(const width of [375,1440]){
   await page.setViewportSize({width,height:950});await page.locator(`[data-design-choice=${design}]`).click();
   await page.goto(url+'/#dag-1');assert.deepEqual(await page.locator('.event').evaluateAll(rows=>rows.map(row=>[row.querySelector('time').textContent,row.querySelector('p').textContent])),expectedEvents);
   assert.match(await page.locator('.route-text').innerText(),/Bridge Between Continents → Gunnuhver Geothermal Area → Laugarvatn/);
   await page.goto(url+'/#kaart');
   for(let day=0;day<5;day++){
     await page.locator(`[data-route-day="${day}"]`).click();await page.waitForFunction(()=>document.querySelector('#route-map-status').textContent.startsWith('Wegroute via'));
     assert.equal(await page.locator(`[data-route-day="${day}"]`).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.route-day-selector [aria-pressed=true]').count(),1);
     assert.deepEqual(await page.locator('.route-stop-list strong').allTextContents(),stops[day]);assert.equal(await page.locator('#route-day-title').innerText(),`Dag ${day+1} — ${names[day]}`);
     assert.equal(await page.locator('.route-map-marker').count(),new Set(stops[day]).size);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.locator('#route-map').evaluate(el=>el.getBoundingClientRect().height>=450));
     assert.ok(await page.evaluate(()=>{const map=RouteMap.map;let valid=true;map.eachLayer(layer=>{if(layer.routeIndices)valid&&=map.getBounds().contains(layer.getLatLng());});return valid;}),`${design}/${width}/day ${day+1}: stop outside map bounds`);
     const external=new URL(await page.locator('.route-map-external .button').getAttribute('href'));
     const central=await page.evaluate(i=>EXPEDITION.days[i].route,day);assert.equal(external.searchParams.get('origin'),central[0]);assert.equal(external.searchParams.get('destination'),central.at(-1));assert.equal(external.searchParams.get('waypoints'),central.length>2?central.slice(1,-1).join('|'):null);
     await page.locator('[data-route-stop="1"]').click();await page.locator('.leaflet-popup').waitFor();assert.match(await page.locator('.leaflet-popup').innerText(),new RegExp(stops[day][1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
     const zoom=await page.evaluate(()=>RouteMap.map.getZoom());await page.locator('.leaflet-control-zoom-in').click();await page.waitForFunction(expected=>RouteMap.map.getZoom()===expected,zoom+1);assert.equal(await page.evaluate(()=>RouteMap.map.getZoom()),zoom+1);await page.locator('#route-fit').click();
     const center=await page.evaluate(()=>RouteMap.map.getCenter());await page.locator('#route-map').evaluate(()=>RouteMap.map.panBy([60,0],{animate:false}));assert.notEqual(await page.evaluate(()=>RouteMap.map.getCenter().lng),center.lng);
     if(design==='v4'&&day===3)await page.screenshot({path:`/tmp/routes-v4-${width}.png`,fullPage:true});
   }
 }
 // Rapid day changes cannot publish a previous day's route, and leaving destroys the map.
 await page.locator('[data-route-day="1"]').click();await page.locator('[data-route-day="4"]').click();await page.waitForFunction(()=>document.querySelector('#route-map-status').textContent.startsWith('Wegroute via'));assert.equal(await page.locator('.route-map-marker').count(),2);
 await page.goto(url+'/#home');assert.equal(await page.evaluate(()=>RouteMap.map),null);await page.goto(url+'/#kaart');assert.equal(await page.locator('[data-route-day="4"]').getAttribute('aria-pressed'),'true');
 mode='error';await page.locator('[data-route-day="2"]').click();await page.waitForFunction(()=>document.querySelector('#route-map-status').textContent.includes('schematisch'));assert.equal(await page.locator('.route-map-marker').count(),4);assert.ok(await page.locator('.route-map-external .button').isVisible());
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));await ctx.setOffline(true);await page.reload();assert.equal(await page.locator('.route-stop-list strong').count(),5);assert.match(await page.locator('#route-map-status').innerText(),/schematisch/);await page.locator('[data-route-day="1"]').click();assert.equal(await page.locator('.route-stop-list strong').count(),7);await ctx.setOffline(false);mode='ok';await page.evaluate(()=>window.dispatchEvent(new Event('online')));await page.waitForFunction(()=>document.querySelector('#route-map-status').textContent.startsWith('Wegroute via'));
 assert.deepEqual(errors,[]);console.log('PASS: updated Day 1 timeline/GEO fields without audio and unchanged Days 2–5; 5 routes × 4 themes × mobile/desktop; ordered stops, road-service contract, numbered markers, bounds, zoom/pan/popups, Maps URL, race/navigation cleanup, service outage and offline/reconnect. Live map services mocked because cloud access is blocked.');
 }finally{await browser.close();server.closeAllConnections();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
