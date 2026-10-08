const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(fs.readFileSync(file));
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const ctx=await browser.newContext({viewport:{width:375,height:812}});
    await require('./map-fixtures.cjs')(ctx);
    await ctx.addInitScript(()=>{if(!localStorage.getItem('expeditie-ijsland-2027-profile'))localStorage.setItem('expeditie-ijsland-2027-profile',JSON.stringify({firstName:'Test',className:'Testklas',bus:null}));});
    const page=await ctx.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
    await page.goto(url+'/#paklijst');
    await page.getByLabel('Winterjas',{exact:true}).check();
    const packingBefore=await page.evaluate(()=>localStorage.getItem('expeditie-ijsland-2027-packing'));
    const sharedData=await page.evaluate(()=>JSON.stringify(EXPEDITION));
    for(const design of ['v1','v2','v4','v5','v6']){
      await page.locator(`[data-design-choice="${design}"]`).click();
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.design),design);
      assert.equal(await page.locator('[aria-pressed="true"]').count(),1);
      assert.equal(await page.locator(`[data-design-choice="${design}"]`).getAttribute('aria-pressed'),'true');
      assert.ok(await page.getByLabel('Winterjas',{exact:true}).isChecked());
      assert.equal(await page.evaluate(()=>localStorage.getItem('expeditie-ijsland-2027-packing')),packingBefore);
      await page.reload();
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.design),design);
      assert.ok(await page.getByLabel('Winterjas',{exact:true}).isChecked());
      assert.equal(await page.evaluate(()=>JSON.stringify(EXPEDITION)),sharedData);
      for(const width of [320,375,430,1440]){
        await page.setViewportSize({width,height:900});
        for(const route of ['home','programma','dag-1','dag-2','dag-3','dag-4','dag-5','kaart','paklijst','ontdek','podcast','praktisch','meer']){
          await page.goto(url+'/#'+route);
          assert.equal(await page.locator('h1').count(),1);
          if(route==='home')assert.equal(await page.locator('.hero-island,.geo-atlas').count(),0);
          if(route==='home' && ['v4','v6'].includes(design)){assert.equal(await page.locator('.hero-island,.geo-atlas').count(),0);assert.ok(await page.locator('.geo-route-badge').isVisible());assert.ok(await page.locator('.geo-countdown').isVisible());if(design==='v6')assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ice').trim()),'#951b81');}
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${design}/${route}/${width}: overflow`);
        }
      }
      await page.goto(url+'/#programma');assert.equal(await page.locator('.day-card').count(),5);
      for(let day=1;day<=5;day++){
        await page.goto(url+'/#programma');await page.locator(`.day-card[href="#dag-${day}"]`).click();await page.locator('.timeline').waitFor();
        assert.equal(await page.locator('.event').count(),await page.evaluate(i=>EXPEDITION.days[i].events.length,day-1));
      }
      await page.goto(url+'/#kaart');assert.equal(await page.locator('.route-map-external .button').count(),1);
      for(const href of await page.locator('.route-map-external .button').evaluateAll(links=>links.map(link=>link.href))){const u=new URL(href);assert.equal(u.hostname,'www.google.com');assert.ok(u.searchParams.get('origin'));assert.ok(u.searchParams.get('destination'));}
      await page.goto(url+'/#ontdek');await page.locator('summary').first().click();assert.ok(await page.locator('details').first().evaluate(el=>el.open));
      const fact=await page.locator('#fact-text').textContent();await page.locator('#new-fact').click();assert.notEqual(await page.locator('#fact-text').textContent(),fact);
      await page.goto(url+'/#praktisch');assert.equal(await page.locator('.plain-list li').count(),4);assert.equal(await page.locator('a[href="tel:112"]').count(),1);
      // Eén centrale wijziging in data moet in ieder ontwerp zichtbaar blijven.
      await page.evaluate(()=>{EXPEDITION.days[0].events[0][0]='08:42';EXPEDITION.practical.reykjavik='Testhostel centraal';});
      for(const choice of ['v1','v2','v4','v5','v6']){
        await page.locator(`[data-design-choice="${choice}"]`).click();await page.goto(url+'/#dag-1');assert.equal(await page.locator('.event time').first().textContent(),'08:42');
        await page.goto(url+'/#praktisch');assert.ok((await page.locator('main').innerText()).includes('Testhostel centraal'));
      }
      await page.reload();await page.locator(`[data-design-choice="${design}"]`).click();
      for(const width of [375,1440]){
        await page.setViewportSize({width,height:900});await page.goto(url+'/#home');await page.screenshot({path:`/tmp/design-${design}-${width}.png`,fullPage:true});
        await page.goto(url+'/#programma');await page.screenshot({path:`/tmp/programme-${design}-${width}.png`,fullPage:true});
      }
      await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
      await ctx.setOffline(true);await page.reload();assert.equal(await page.locator('.day-card').count(),5);
      await page.goto(url+'/#paklijst');assert.ok(await page.getByLabel('Winterjas',{exact:true}).isChecked());
      await page.locator(`[data-design-choice="${design}"]`).click();await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.dataset.design),design);
      await ctx.setOffline(false);
    }
    await page.evaluate(()=>localStorage.setItem('expeditie-ijsland-2027-design','v3'));await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.dataset.design),'v4');assert.equal(await page.locator('[data-design-choice=v3]').count(),0);
    // Ongeldige opgeslagen keus heeft een werkende standaard.
    await page.evaluate(()=>localStorage.setItem('expeditie-ijsland-2027-design','invalid'));await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.dataset.design),'v5');
    assert.deepEqual(errors,[]);
    console.log('PASS: five designs, every page at four widths, active selector and persistence, shared data changes, checklist retained, day buttons/Maps/facts/contacts, offline design selection, no console errors.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{server.closeAllConnections();server.close();});
