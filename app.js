// Eén app, één gegevensbron: de kiezer verandert uitsluitend de CSS-presentatie.
const designNames = { v1: 'Expedition', v2: 'Iceland Fresh', v3: 'GEO Future', v4: 'Maris Reisdashboard', v5: 'Maris GEO Mobile' };
const designStorageKey = 'expeditie-ijsland-2027-design';
function applyDesign(design) {
  if (!Object.hasOwn(designNames, design)) design = 'v4';
  try { localStorage.setItem(designStorageKey, design); } catch { /* Opslag is optioneel. */ }
  document.documentElement.dataset.design = design;
  document.querySelectorAll('[data-design-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.designChoice === design)));
  document.querySelector('#design-name').textContent = `${design.toUpperCase()} · ${designNames[design]}`;
  document.querySelector('meta[name="theme-color"]').content = {v1:'#091823',v2:'#edf7f8',v3:'#102e35',v4:'#ffffff',v5:'#951b81'}[design];
  window.GeoUI?.refresh();
  if(homeDesignReady && (!location.hash || location.hash==='#home'))render();
}
let homeDesignReady = false;
let initialDesign = 'v4';
try {
  // Introduce the approved release once, while preserving profile and checklist.
  if(localStorage.getItem('expeditie-ijsland-2027-design-release')==='v5') {
    initialDesign=localStorage.getItem(designStorageKey)||'v4';
    if(localStorage.getItem('expeditie-ijsland-2027-design-numbering')!=='sequential-5'){
      initialDesign=({v3:'v3',v4:'v3',v5:'v4',v6:'v5'})[initialDesign]||initialDesign;
    }
  } else {
    localStorage.setItem('expeditie-ijsland-2027-design-release','v5');
    localStorage.setItem(designStorageKey,'v4');
  }
  localStorage.setItem('expeditie-ijsland-2027-design-numbering','sequential-5');
} catch { /* Default blijft bruikbaar zonder opslag. */ }
applyDesign(initialDesign);
document.querySelector('.design-switcher').addEventListener('click', event => {
  const button = event.target.closest('[data-design-choice]');
  if (!button) return;
  const design = button.dataset.designChoice;
  applyDesign(design);
  try { localStorage.setItem(designStorageKey, design); } catch {
    const status = document.querySelector('#status');
    status.textContent = 'Dit ontwerp kan niet worden onthouden in deze browser. Je kunt wel blijven wisselen.';
    status.hidden = false;
  }
});
window.addEventListener('storage', event => { if (event.key === designStorageKey) applyDesign(event.newValue); });

const D = window.EXPEDITION;
const main = document.querySelector('main');
const storageKey = 'expeditie-ijsland-2027-packing';
let packed = [];
let storageAvailable = true;
try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); packed = Array.isArray(saved) ? saved.filter(item => typeof item === 'string') : []; } catch { storageAvailable = false; }
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const e = escapeHTML;
function routeURL(stops) {
  const params = new URLSearchParams({api:'1', origin:stops[0], destination:stops.at(-1), travelmode:'driving'});
  if (stops.length > 2) params.set('waypoints',stops.slice(1,-1).join('|'));
  return 'https://www.google.com/maps/dir/?' + params;
}
function routeLinks(day) {
  let html = `<a class="button" href="${e(routeURL(day.route))}" target="_blank" rel="noopener noreferrer">Open route in Google Maps →</a>`;
  // Mobiele browsers ondersteunen soms maximaal drie tussenstops. Deel de lange route ook op.
  if (day.route.length > 5) html += `<p class="muted small">Mist Maps tussenstops op je telefoon? Gebruik de twee delen:</p><div class="inline-links"><a target="_blank" rel="noopener noreferrer" href="${e(routeURL(day.route.slice(0,5)))}">Deel 1: naar Reynisfjara →</a><a target="_blank" rel="noopener noreferrer" href="${e(routeURL(day.route.slice(4)))}">Deel 2: via Vík terug →</a></div>`;
  return html;
}
function heading(kicker,title,text='') { return `<div class="page-heading"><span class="eyebrow">${kicker}</span><h1>${title}</h1>${text ? `<p>${text}</p>` : ''}</div>`; }
const tiles = [ ['programma','📅','Programma','5 dagen vol avontuur'],['kaart','🗺️','Expeditiekaart','Volg onze route'],['paklijst','🎒','Paklijst','Klaar voor vertrek?'],['ontdek','🌋','Ontdek IJsland','Het land van vuur & ijs'],['podcast','🎙️','Podcast','Verhalen van onderweg'],['praktisch','🚨','Praktisch','Goed voorbereid op pad'],['spelletjes','🎮','Spelletjes','Quiz, bingo & busplezier'],['fotos','📸','Onze expeditie','Foto’s van onderweg'],['profiel','👤','Mijn profiel','Jouw gegevens & instellingen'] ];
function tileGrid(items) { return `<div class="tile-grid">${items.map(([href,icon,title,sub]) => `<a class="tile" href="#${href}"><span class="tile-icon">${icon}</span><span><strong>${title}</strong><small>${sub}</small></span><span class="arrow">→</span></a>`).join('')}</div>`; }
// Header, welcome and hero use the same original asset configured in data.js.
function schoolLogoMarkup(className) {
  return D.heroLogo ? `<img class="${className}" src="${e(D.heroLogo)}" alt="Maris College Bohemen" onerror="this.hidden=true" />` : '';
}
function syncSchoolLogos() {
  document.querySelectorAll('[data-school-logo]').forEach(slot=>{
    slot.replaceChildren();slot.hidden=!D.heroLogo;
    if(!D.heroLogo)return;
    const image=document.createElement('img');image.className='school-logo';
    image.alt='Maris College Bohemen';image.src=D.heroLogo;
    image.onerror=()=>{slot.hidden=true;};slot.append(image);
  });
}
function home() {
  if(document.documentElement.dataset.design==='v4')return dashboardHome();
  return `<section class="hero"><div class="hero-logo-slot">${schoolLogoMarkup('hero-logo')}</div><div class="hero-content"><span class="eyebrow">MARIS COLLEGE BOHEMEN</span>${geoHomeIdentity()}<div class="hero-heading"><h1>Expeditie<br><em>IJsland</em></h1></div><p>Vuur onder je voeten. Noorderlicht boven je hoofd.<br>Vijf dagen IJsland die je niet vergeet.</p><div class="hero-meta"><span>📅 ${e(D.dates)}</span><span>👥 ${D.travelers} reizigers</span></div><a class="button" href="#programma">Ontdek het programma <span>→</span></a></div><span class="hero-caption">IJSLAND / LAND VAN VUUR & IJS<br>Illustratie van het IJslandse landschap</span></section>
  ${geoLocationSection()}${profileGreeting()}<a class="aurora-home panel" href="#aurora"><span>🌌</span><div><strong>Aurora Watch · Laugarvatn</strong><small>Bekijk actuele bronnen en de bewolking →</small></div></a><div class="section-label"><span>JOUW EXPEDITIEGIDS</span><span>01 — 09</span></div>${tileGrid(tiles)}
  <section class="next-card"><div><span class="eyebrow">VOLGENDE AVONTUUR</span><h2>${e(D.days[0].title)}</h2><p>${e(D.days[0].date)} · 08:30 verzamelen bij school</p></div><a class="round-link" aria-label="Bekijk dag 1" href="#dag-1">→</a></section>
  <div class="fact-strip"><span>✦</span><p><strong>Wist je dat?</strong> ${e(D.facts[1])}</p><a href="#ontdek">Ontdek meer →</a></div>`;
}
function programme() { return heading('DE REIS','Vijf dagen. Eén expeditie.','Van de eerste paspoortcheck tot de laatste herinnering. Alle tijden zijn lokale tijden; het programma kan wijzigen.') + `<div class="day-grid">${D.days.map((day,i) => `<a class="day-card day-${i}" href="#dag-${i+1}"><div class="day-top"><span class="day-label">DAG ${i+1}</span><span>${day.icon}</span></div><small>${e(day.date)}</small><h2>${e(day.title)}</h2><p>${e(day.theme)}</p><span class="day-bottom">${day.events.length} momenten <span>Bekijk dag →</span></span></a>`).join('')}</div><p class="info-note">IJsland is in februari 1 uur vroeger dan Nederland. Tijden met ± zijn bij benadering.</p>`; }
function dayPage(index) {
  const day = D.days[index];
  return `<a class="back" href="#programma">← Alle reisdagen</a>${heading(`DAG 0${index+1} · ${e(day.date)}`, e(day.title),e(day.theme))}<nav class="day-tabs" aria-label="Kies een reisdag">${D.days.map((_,i) => `<a ${i===index?'aria-current="page"':''} href="#dag-${i+1}">Dag ${i+1}</a>`).join('')}</nav><section class="panel timeline"><span class="eyebrow">OP HET PROGRAMMA · LOKALE TIJDEN</span>${day.events.map(([time,event])=>`<div class="event"><time>${e(time)}</time><span class="event-dot"></span><p>${e(event)}</p></div>`).join('')}</section>${index===3?`<p class="info-note">🛏️ ${e(D.practical.reykjavik)}</p>`:''}${index===1?'<a class="warning compact" href="#praktisch">⚠️ Reynisfjara: houd ruim afstand van zee. Lees de veiligheidsinfo →</a>':''}<section class="panel"><span class="eyebrow">ONDERWEG</span><h2>De route van dag ${index+1}</h2><p class="route-text">${day.route.map(stop=>e(stop.replace(', Iceland',''))).join(' → ')}</p>${routeLinks(day)}</section>${geoLocationSection(index)}<div class="page-controls">${index>0?`<a href="#dag-${index}">← Dag ${index}</a>`:'<span></span>'}${index<4?`<a href="#dag-${index+2}">Dag ${index+2} →</a>`:'<a href="#home">Naar home →</a>'}</div>`;
}
function mapPage() { return routeMapPage(); }
const allItems = Object.values(D.packing).flat();
function packing() { return heading('VOOR VERTREK','Pak je avontuur in.','Warm, droog en goed voorbereid. Vink af wat al in je tas zit.') + `<section class="panel packing-progress"><div><h2 id="packing-count" aria-live="polite"></h2><span id="packing-percent"></span></div><progress id="packing-bar" max="${allItems.length}" value="0" aria-label="Voortgang paklijst"></progress><p class="muted small">Je vinkjes worden op dit apparaat bewaard.</p><p id="storage-warning" class="warning compact" ${storageAvailable?'hidden':''}>Opslaan is niet beschikbaar in deze browser. Je vinkjes blijven alleen tijdens dit bezoek bewaard.</p></section><div class="packing-grid">${Object.entries(D.packing).map(([category,items])=>`<section class="panel"><h2>${e(category)}</h2>${items.map(item=>`<label class="check-item"><input type="checkbox" data-item="${e(item)}" ${packed.includes(item)?'checked':''}><span>${e(item)}</span></label>`).join('')}</section>`).join('')}</div>`; }
function updatePacking() { const count = allItems.filter(item=>packed.includes(item)).length; document.querySelector('#packing-count').textContent = `${count} van ${allItems.length} ingepakt`; document.querySelector('#packing-percent').textContent = Math.round(count/allItems.length*100)+'%'; document.querySelector('#packing-bar').value = count; }
function discover() { return heading('LAND VAN VUUR & IJS','Een eiland. Eindeloos bijzonder.','Ontdek de natuurkracht achter de plekken die we bezoeken.') + `<div class="knowledge-grid">${D.knowledge.map(([icon,title,text])=>`<details class="panel knowledge"><summary><span class="knowledge-icon">${icon}</span><strong>${e(title)}</strong><span class="expand">+</span></summary><p>${e(text)}</p></details>`).join('')}</div><section class="panel fact-box"><span class="eyebrow">WIST JE DAT?</span><h2 id="fact-text">${e(D.facts[0])}</h2><button class="button secondary" id="new-fact">Nog een weetje ✦</button></section>`; }
function podcast() { return heading('VERHALEN VAN DE EXPEDITIE','Expeditie IJsland Podcast','Het avontuur, straks ook in je oren.') + `<section class="podcast-hero"><div class="mic" aria-hidden="true">🎙️</div><span class="pill">${D.episodes.length?'LUISTER MEE':'BINNENKORT BESCHIKBAAR'}</span><h2>Vuur, ijs & verhalen.</h2><p>${D.episodes.length?'Luister naar onze afleveringen.':'Onze podcast is nog in de maak. Hier verschijnen later de afleveringen.'}</p><div class="waveform" aria-hidden="true">${Array.from({length:32},(_,i)=>`<span style="height:${18+(i*37%65)}px"></span>`).join('')}</div></section><section class="panel"><span class="eyebrow">AFLEVERINGEN</span>${D.episodes.length?D.episodes.map(ep=>`<article class="episode"><h2>${e(ep.title)}</h2><p>${e(ep.description || '')}</p><audio controls preload="metadata" src="${e(ep.src)}">Je browser ondersteunt geen audiospeler.</audio></article>`).join(''):'<h2>Het eerste verhaal komt eraan.</h2><p class="muted">Zodra een aflevering beschikbaar is, kun je die hier afspelen.</p>'}</section>`; }
function practical() { const p=D.practical; return heading('GOED VOORBEREID','Praktisch & veilig','Alles wat je onderweg bij de hand wilt hebben.') + `<section class="contact-card"><div><span class="eyebrow">BIJ EEN NOODGEVAL</span><h2>Neem contact op met een begeleider</h2><p>${e(p.emergencyMessage)}</p></div><p class="small muted">Bij direct levensgevaar in IJsland: bel <a href="tel:112">112</a>.</p></section><div class="practical-grid"><section class="panel"><span class="eyebrow">JOUW TEAM</span><h2>Begeleiders</h2><ul class="plain-list">${p.guides.map(name=>`<li>${e(name)}</li>`).join('')}</ul></section><section class="panel"><span class="eyebrow">ONZE UITVALSBASIS</span><h2>${e(p.accommodation)}</h2><p>${e(p.address)}</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.accommodation+' '+p.address)}" target="_blank" rel="noopener noreferrer">Bekijk locatie →</a><p class="muted">${e(p.reykjavik)}</p></section><section class="panel"><span class="eyebrow">IN CONTACT</span><h2>${e(p.communication)}</h2><p>Houd de schoolgroep in Teams in de gaten voor updates en afspraken.</p></section></div><section class="warning"><span class="eyebrow">⚠ REYNISFJARA · ZWART STRAND</span><h2>De zee is sterker dan je denkt.</h2><p>Sneaker waves zijn plotselinge, grote golven die ver het strand op komen. Houd ruim afstand van de zee, blijf alert en volg altijd de instructies van je begeleiders. Ga niet het water in.</p></section><section class="panel"><h2>Samen op expeditie</h2><ul class="rules"><li>Geen alcohol of drugs.</li><li>Niet roken.</li><li>Afspraken en tijden naleven.</li><li>Instructies van begeleiders opvolgen.</li><li>Bij problemen direct contact opnemen met een begeleider.</li></ul></section>`; }
function more() { return heading('NOG MEER EXPEDITIE','Alles voor onderweg.','Ontdekken, luisteren en goed voorbereid op pad.') + tileGrid([...tiles.slice(3),['aurora','🌌','Aurora Watch','Noorderlicht bij Laugarvatn']]) + `<section class="panel"><h2>Neem je gids mee</h2><p>Op iPhone: open in Safari, tik op Deel en kies ‘Zet op beginscherm’. Op Android: open het browsermenu en kies ‘App installeren’ of ‘Toevoegen aan startscherm’.</p><p class="muted small">Na je eerste online bezoek zijn de gids en paklijst offline beschikbaar. Google Maps heeft internet nodig. Je paklijst blijft privé op dit apparaat.</p></section>`; }
let factIndex = 0;
function render() {
  window.RouteMap?.destroy();
  syncSchoolLogos();
  const page = location.hash.slice(1) || 'home';
  const routes = {home,programma:programme,kaart:mapPage,paklijst:packing,ontdek:discover,podcast,praktisch:practical,meer:more,profiel:profilePage,spelletjes:gamesPage,quiz:quizPage,bingo:bingoPage,raadplek:placesPage,'30seconds':secondsPage,challenges:challengesPage,fotos:photosPage,aurora:auroraPage};
  const match=page.match(/^dag-([1-5])$/);
  main.innerHTML = match ? dayPage(Number(match[1])-1) : (routes[page] || home)();
  document.title = `${match?D.days[Number(match[1])-1].title:({home:'Home',programma:'Programma',kaart:'Expeditiekaart',paklijst:'Paklijst',ontdek:'Ontdek IJsland',podcast:'Podcast',praktisch:'Praktisch',meer:'Meer',profiel:'Mijn profiel',spelletjes:'Spelletjes',quiz:'IJsland Quiz',bingo:'Busbingo',raadplek:'Raad de plek','30seconds':'IJsland 30 Seconds',challenges:'Challenges',fotos:'Onze expeditie',aurora:'Aurora Watch'}[page] || 'Home')} · Expeditie IJsland 2027`;
  const active = match?'programma':(['ontdek','podcast','praktisch','profiel','spelletjes','quiz','bingo','raadplek','30seconds','challenges','fotos','aurora'].includes(page)?'meer':routes[page]?page:'home');
  document.querySelectorAll('.bottom-nav a,.v5-top-nav a').forEach(link=>{ if(link.hash==='#'+(link.closest('.v5-top-nav')&&page==='praktisch'?'praktisch':active)) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
  if(page==='paklijst') updatePacking();
  afterModuleRender(page);
  if(page==='kaart') window.RouteMap?.mount();
  window.GeoUI?.refresh();
  window.scrollTo(0,0);
}
main.addEventListener('change',event=>{
  if(!event.target.matches('[data-item]')) return;
  const item=event.target.dataset.item;
  packed=packed.filter(value=>value!==item);
  if(event.target.checked) packed.push(item);
  try { localStorage.setItem(storageKey,JSON.stringify(packed)); } catch { storageAvailable=false; document.querySelector('#storage-warning').hidden=false; }
  updatePacking();
});
main.addEventListener('click',event=>{ if(event.target.closest('#new-fact')) { factIndex=(factIndex+1)%D.facts.length; document.querySelector('#fact-text').textContent=D.facts[factIndex]; } });
window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true});});
homeDesignReady = true;
document.querySelectorAll('[data-dashboard-icon]').forEach(slot=>slot.innerHTML=dashboardIcon(slot.dataset.dashboardIcon));
render();
initModules();
window.GeoUI?.start();
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  const reloadForUpdate = () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  };
  // Alleen een bestaande installatie herladen bij overname, niet het eerste bezoek.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) reloadForUpdate();
  });
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'APP_UPDATED') reloadForUpdate();
  });
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(registration => {
    const checkUpdate = async () => {
      if (!navigator.onLine || document.visibilityState !== 'visible') return;
      try { await registration.update(); } catch { /* Offline cache blijft bruikbaar. */ }
      navigator.serviceWorker.controller?.postMessage({ type: 'CHECK_APP_UPDATE' });
    };
    checkUpdate();
    window.addEventListener('online', checkUpdate);
    document.addEventListener('visibilitychange', checkUpdate);
    // Ook een tabblad dat open blijft staan krijgt nieuwe deployments, zonder handmatig wissen.
    setInterval(checkUpdate, 5 * 60 * 1000);
  }).catch(() => {
    const status = document.querySelector('#status');
    status.textContent = 'Offline opslaan is niet beschikbaar. Je kunt de app online blijven gebruiken.';
    status.hidden = false;
  });
}
