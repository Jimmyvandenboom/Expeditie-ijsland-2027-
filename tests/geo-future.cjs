const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const baseline=new Map(['index.html','app.js','data.js','themes.css'].map(file=>[file,execFileSync('git',['show',`fb29c2797b925625c24d19ea3d27bf3d0f5ce0a7:${file}`],{cwd:root})]));
// Compare other hero styles with the explicitly requested original logo enabled.
baseline.set('data.js',Buffer.from(baseline.get('data.js').toString().replace('window.EXPEDITION = {',"window.EXPEDITION = { heroLogo:'assets/maris-logo.png',")));
// Apply the requested map replacement to the baseline; compare all remaining theme styles.
baseline.set('app.js',Buffer.from(baseline.get('app.js').toString().replace('class="hero-island" src="assets/iceland.svg"','class="hero-island hero-topography" src="assets/iceland-topography.png"')));
const homeMapCSS=fs.readFileSync(path.join(root,'themes.css'),'utf8').split('/* Topographic home map')[1];
assert.ok(homeMapCSS,'Explicit home-map styles must exist');
baseline.set('themes.css',Buffer.concat([baseline.get('themes.css'),Buffer.from('/* Topographic home map'+homeMapCSS)]));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
function serve(old){return http.createServer((req,res)=>{let file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(file==='sw.js'){res.writeHead(404);res.end();return;}const target=path.join(root,file);if(!fs.existsSync(target)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(old&&baseline.has(file)?baseline.get(file):fs.readFileSync(target));});}
(async()=>{
 const servers=[serve(true),serve(false)];for(const server of servers)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const pages=[];for(const server of servers){const ctx=await browser.newContext({serviceWorkers:'block'});await ctx.addInitScript(()=>localStorage.setItem('expeditie-ijsland-2027-profile',JSON.stringify({firstName:'Test',className:'4T'})));const page=await ctx.newPage();await page.goto(`http://127.0.0.1:${server.address().port}`);pages.push(page);}
 for(const design of ['v1','v2','v3'])for(const width of [375,1440]){
  const shots=[];for(const page of pages){await page.setViewportSize({width,height:1000});await page.locator(`[data-design-choice=${design}]`).click();await page.evaluate(()=>document.fonts.ready);shots.push(await page.locator('.hero').screenshot({animations:'disabled'}));}
  shots.forEach((shot,i)=>fs.writeFileSync(`/tmp/hero-regression-${design}-${width}-${i}.png`,shot));
  // GPU shadow rasterization can differ by one RGB unit between documents.
  // Compare complete computed styles and dimensions of every visible hero component.
  const layouts=[];
  for(const page of pages)layouts.push(await page.evaluate(()=>['.hero','.hero-content','.hero .eyebrow','.hero-heading','h1','h1 em','.hero-island','.hero-content>p','.hero-meta','.hero .button','.hero-caption','.hero-logo-slot'].map(selector=>{
    const el=document.querySelector(selector),style=getComputedStyle(el),rect=el.getBoundingClientRect();
    return {selector,width:rect.width,height:rect.height,styles:Object.fromEntries([...style].map(key=>[key,style.getPropertyValue(key).replaceAll(location.origin,'TEST_ORIGIN')]))};
  })));
  assert.deepEqual(layouts[0],layouts[1],`${design}/${width}: hero styles/layout changed`);
 }
 const page=pages[1];await page.locator('[data-design-choice=v4]').click();
 assert.equal(await page.locator('.geo-route-badge').innerText(),'GEO FUTURE ROUTE · ICELAND 2027');
 assert.equal(await page.locator('.geo-location-card').count(),6);
 await page.evaluate(()=>updateGeoCountdown(Date.parse('2027-01-30T07:30:00Z')));
 assert.equal(await page.locator('#geo-countdown-value strong').first().innerText(),'01');
 await page.evaluate(()=>updateGeoCountdown(Date.parse('2027-02-01T00:00:00Z')));
 assert.match(await page.locator('#geo-countdown-value').innerText(),/begonnen/);
 await page.locator('.geo-location-card').first().locator('summary').click();assert.ok(await page.locator('.geo-location-card').first().locator('details p').isVisible());
 for(const width of [320,375,430,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`/tmp/geo-future-${width}.png`,fullPage:true});}
 await page.evaluate(()=>{EXPEDITION.geo.locations[0].name='Gedeelde GEO-test';render();});assert.match(await page.locator('.geo-location-card').first().innerText(),/Gedeelde GEO-test/);
 console.log('PASS: V1–V3 identical computed hero styles and dimensions at mobile/desktop; V4 badge, six themed locations, central data, countdown boundaries, look assignments and four responsive widths.');
 }finally{await browser.close();for(const server of servers)server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
