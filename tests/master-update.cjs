const {chromium}=require('playwright');const assert=require('node:assert/strict');const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(fs.readFileSync(file));});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const ctx=await browser.newContext({viewport:{width:375,height:812}});let apiMode='unavailable';
  const today=new Date();today.setUTCHours(0,0,0,0);const iso=t=>new Date(t).toISOString().slice(0,16);
  // Synthetic fixtures are only used in tests; production contains no fictional predictions.
  const weather={utc_offset_seconds:0,hourly:{time:Array.from({length:96},(_,i)=>iso(today.getTime()+i*3600000)),cloud_cover:Array.from({length:96},(_,i)=>i%24===23?20:70)},daily:{sunrise:Array.from({length:4},(_,i)=>iso(today.getTime()+i*86400000+6*3600000)),sunset:Array.from({length:4},(_,i)=>iso(today.getTime()+i*86400000+18*3600000))}};
  await ctx.route('https://services.swpc.noaa.gov/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(apiMode==='valid'?[['time_tag','Kp'],[iso(Date.now()-3600000)+':00',4]]:apiMode==='stale'?[['time_tag','Kp'],['2020-01-01 00:00:00',9]]:[])}));
  await ctx.route('https://api.open-meteo.com/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(apiMode==='valid'?weather:apiMode==='malformed'?{utc_offset_seconds:0,hourly:{time:'invalid',cloud_cover:[20]},daily:{sunrise:[],sunset:[]}}:{})}));
  await ctx.addInitScript(()=>{if(!localStorage.getItem('expeditie-ijsland-2027-packing'))localStorage.setItem('expeditie-ijsland-2027-packing','["Winterjas"]');});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);assert.ok(await page.locator('#welcome').isVisible());assert.equal(await page.locator('#welcome input').count(),2);assert.equal(await page.locator('#welcome [data-bus]').count(),0);
  await page.locator('#welcome input[name=firstName]').fill('Testreiziger');await page.locator('#welcome input[name=className]').fill('4T');await page.getByRole('button',{name:'Start mijn expeditie'}).click();
  assert.ok(await page.locator('#welcome').isHidden());assert.ok((await page.locator('.profile-greeting').innerText()).includes('Testreiziger'));assert.equal(await page.locator('.profile-greeting .pill').count(),0);
  await page.reload();assert.ok(await page.locator('#welcome').isHidden());await page.goto(url+'/#paklijst');assert.ok(await page.getByLabel('Winterjas',{exact:true}).isChecked());
  await page.goto(url+'/#profiel');await page.locator('#profile-form input[name=firstName]').fill('Gewijzigd');await page.locator('#profile-form input[name=className]').fill('4B');await page.getByRole('button',{name:'Profiel opslaan'}).click();assert.ok((await page.locator('#profile-saved').innerText()).includes('opgeslagen'));await page.locator('[data-bus="2"]').click();
  await page.reload();assert.equal(await page.locator('#profile-form input[name=firstName]').inputValue(),'Gewijzigd');assert.equal(await page.locator('[data-bus="2"]').getAttribute('aria-pressed'),'true');assert.ok((await page.locator('main').innerText()).includes('geen pushberichten'));assert.equal(await page.evaluate(()=>window.ExpeditionServices.push.enabled),false);
  for(const design of ['v1','v2','v3','v4']){
    await page.locator(`[data-design-choice=${design}]`).click();await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.dataset.design),design);
    for(const width of [320,375,430,1440]){
      await page.setViewportSize({width,height:900});
      for(const route of ['home','profiel','spelletjes','quiz','bingo','raadplek','30seconds','challenges','fotos','aurora']){
        await page.goto(url+'/#'+route);assert.equal(await page.locator('h1').count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${design}/${route}/${width} overflow`);
      }
    }
    await page.goto(url+'/#home');assert.equal(await page.locator('.geo-identity').isVisible(),design==='v4');
    await page.goto(url+'/#paklijst');assert.ok(await page.getByLabel('Winterjas',{exact:true}).isChecked());
  }
  await page.goto(url+'/#quiz');await page.locator('[data-answer="0"]').click();assert.ok((await page.locator('#quiz-feedback').textContent()).includes('Goed!'));await page.goto(url+'/#spelletjes');await page.goto(url+'/#quiz');assert.ok(await page.locator('#quiz-next').isVisible());
  const answers=[0,1,2,1,0];for(let i=0;i<answers.length;i++){if(i>0)await page.locator(`[data-answer="${answers[i]}"]`).click();await page.locator('#quiz-next').click();}
  assert.ok((await page.locator('.game-result').innerText()).includes('5 / 5'));await page.locator('[data-quiz-reset]').click();assert.equal(await page.locator('[data-answer]').count(),3);
  await page.goto(url+'/#bingo');await page.locator('[data-bingo="0"]').click();await page.reload();assert.equal(await page.locator('[data-bingo="0"]').getAttribute('aria-pressed'),'true');
  await page.goto(url+'/#raadplek');await page.locator('summary').first().click();assert.ok(await page.locator('details').first().evaluate(el=>el.open));
  await page.goto(url+'/#30seconds');await page.locator('[data-seconds-start]').click();assert.equal(await page.locator('#seconds-words li').count(),5);await page.waitForFunction(()=>Number(document.querySelector('#seconds-clock').textContent)<30);await page.evaluate(()=>secondsEnd=Date.now()-1);await page.waitForFunction(()=>document.querySelector('#seconds-clock').textContent==='0');assert.ok((await page.locator('#seconds-result').textContent()).includes('Tijd'));
  await page.goto(url+'/#challenges');assert.equal(await page.locator('details').count(),4);
  await page.goto(url+'/#fotos');await page.locator('[data-photo-filter="3"]').click();assert.equal(await page.locator('.photo-placeholder').count(),1);await page.locator('[data-photo-info]').click();assert.ok((await page.locator('#photo-info').textContent()).includes('nog niet geactiveerd'));assert.equal(await page.locator('input[type=file]').count(),0);
  // Moderation gate: only an explicitly approved entry can appear.
  await page.evaluate(()=>{EXPEDITION.photos.entries=[{day:3,approved:false,caption:'Unapproved fixture',src:'assets/icon.svg'}];render();});assert.equal(await page.locator('.photo-wall img').count(),0);await page.reload();
  await page.goto(url+'/#aurora');await page.locator('[data-aurora-refresh]:not([disabled])').waitFor();assert.ok((await page.locator('.aurora-summary').innerText()).includes('niet beschikbaar'));
  apiMode='valid';await page.locator('[data-aurora-refresh]').click();await page.waitForFunction(()=>auroraState.kp?.value===4&&!!auroraState.weather);assert.ok((await page.locator('main').innerText()).includes('20%'));assert.ok((await page.locator('main').innerText()).includes('geen lokale kansvoorspelling'));
  apiMode='malformed';await page.locator('[data-aurora-refresh]').click();await page.waitForFunction(()=>!auroraState.loading&&auroraState.weather===null);
  apiMode='stale';await page.locator('[data-aurora-refresh]').click();await page.waitForFunction(()=>!auroraState.loading&&auroraState.kp===null);assert.ok((await page.locator('main').innerText()).includes('niet beschikbaar'));
  await page.setViewportSize({width:1440,height:1000});await page.goto(url+'/#home');await page.screenshot({path:'/tmp/master-geo-desktop.png',fullPage:true});await page.setViewportSize({width:375,height:812});await page.screenshot({path:'/tmp/master-geo-mobile.png',fullPage:true});
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));await ctx.setOffline(true);
  for(const route of ['profiel','bingo','spelletjes','fotos','aurora','paklijst']){await page.goto(url+'/#'+route);await page.reload();assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('#welcome').isHidden());}
  assert.ok(await page.getByLabel('Winterjas',{exact:true}).isChecked());await page.goto(url+'/#profiel');assert.equal(await page.locator('[data-bus="2"]').getAttribute('aria-pressed'),'true');await page.goto(url+'/#bingo');assert.equal(await page.locator('[data-bingo="0"]').getAttribute('aria-pressed'),'true');await page.goto(url+'/#aurora');await page.locator('[data-aurora-refresh]').click();await page.waitForFunction(()=>!auroraState.loading);assert.ok((await page.locator('main').innerText()).includes('offline'));
  // Onboarding itself also works after the shell is installed offline.
  await page.evaluate(()=>localStorage.removeItem('expeditie-ijsland-2027-profile'));await page.reload();assert.ok(await page.locator('#welcome').isVisible());
  assert.deepEqual(errors,[]);console.log('PASS: four themes, onboarding/profile/bus persistence, old checklist retained, five offline games, photo filters/moderation placeholder, push placeholder, valid/stale/unavailable Aurora fixtures, mobile/desktop and offline onboarding. Live APIs were mocked, not claimed verified.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.closeAllConnections();server.close();});
