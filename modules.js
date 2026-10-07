// Centrale lokale staat; geen profielgegevens worden naar een server verstuurd.
const PROFILE_KEY = 'expeditie-ijsland-2027-profile';
function readLocal(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function saveLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { const status=document.querySelector('#status');status.textContent='Opslaan lukt niet in deze browser. Je wijzigingen blijven alleen tijdens dit bezoek bewaard.';status.hidden=false;return false; }
}
const storedProfile = readLocal(PROFILE_KEY, {});
let profile = { firstName: typeof storedProfile?.firstName==='string'?storedProfile.firstName.slice(0,40):'', className:typeof storedProfile?.className==='string'?storedProfile.className.slice(0,20):'', bus:[1,2,3].includes(storedProfile?.bus)?storedProfile.bus:null };
let bingoState = readLocal('expeditie-ijsland-2027-bingo', []);
if (!Array.isArray(bingoState)) bingoState=[];
bingoState=[...new Set(bingoState.filter(value=>Number.isInteger(value)&&value>=0&&value<16))];
let quizIndex=0, quizScore=0, quizAnswered=false, quizChoice=null, photoFilter=0, secondsTimer, secondsEnd=0;
let auroraState={loading:false, kp:null, weather:null, checked:null};
// Uitbreidingspunten voor de latere gezamenlijke diensten; géén fictieve uploads of pushabonnementen.
window.ExpeditionServices = {
  photos: { enabled:false, submit:async()=>{throw new Error('Gezamenlijke foto-upload is nog niet geactiveerd.');}, moderationRequired:true },
  push: { enabled:false, subscribe:async()=>{throw new Error('Meldingen worden later geactiveerd.');} },
  busBattle: { enabled:false, mode:'local-only' }
};
function profileGreeting() {
  return profile.firstName?`<div class="profile-greeting"><p>Welkom terug, <strong>${e(profile.firstName)}</strong> 👋${profile.bus?` <span class="pill">Bus ${profile.bus}</span>`:''}</p><a href="#profiel">Mijn profiel →</a></div>`:'';
}
function profilePage() {
  return heading('JOUW EXPEDITIE','Mijn profiel','Je gegevens en voorkeuren blijven op dit apparaat.')+`<section class="panel"><form id="profile-form"><label>Voornaam<input name="firstName" maxlength="40" value="${e(profile.firstName)}" required autocomplete="given-name"></label><label>Klas<input name="className" maxlength="20" value="${e(profile.className)}" required></label><button class="button" type="submit">Profiel opslaan</button><p id="profile-saved" role="status"></p></form></section><section class="panel"><span class="eyebrow">SAMEN ONDERWEG</span><h2>Mijn bus</h2><p>Kies je bus zodra je indeling bekend is. Je kunt dit later wijzigen.</p><div class="choice-row" aria-label="Mijn bus">${[1,2,3].map(bus=>`<button class="button secondary" data-bus="${bus}" aria-pressed="${profile.bus===bus}">Bus ${bus}</button>`).join('')}<button class="button secondary" data-bus="0" aria-pressed="${!profile.bus}">Nog niet bekend</button></div><p class="small muted">Bus Battle wordt later geactiveerd. Nu worden geen online teamscores bijgehouden.</p></section><section class="panel"><span class="eyebrow">🔔 EXPEDITIE-MELDINGEN</span><h2>Blijf straks op de hoogte</h2><p>Ontvang belangrijke berichten tijdens de reis.</p><span class="pill">WORDT LATER GEACTIVEERD</span><ul class="rules">${D.push.topics.map(topic=>`<li>${e(topic)}</li>`).join('')}</ul><p>Er worden nu nog geen pushberichten verzonden. We vragen pas toestemming wanneer de meldingenservice beschikbaar is.</p><p class="small muted">Op iPhone zijn web-pushmeldingen beschikbaar voor geïnstalleerde webapps op ondersteunde iOS-versies.</p></section>`;
}
const gameTiles=[['quiz','🧠','IJsland Quiz','Test je expeditiekennis'],['bingo','👀','Busbingo','Kijk, spot en vink af'],['raadplek','🗺️','Raad de plek','Herken de bestemming'],['30seconds','⏱️','IJsland 30 Seconds','Omschrijf, raad en race'],['challenges','⚡','Challenges','Kleine avonturen voor samen']];
function gamesPage() { return heading('🎮 VOOR ONDERWEG','Spelletjes','Busrit of vrije tijd? Deze spellen werken ook offline.')+tileGrid(gameTiles)+`<section class="panel module-banner"><h2>Bus Battle komt later</h2><p>${profile.bus?`Jij hebt Bus ${profile.bus} gekozen. `:''}Speel nu naast elkaar, met je buur of je groep. De gezamenlijke competitie tussen Bus 1, 2 en 3 is nog niet actief.</p><a class="text-link" href="#profiel">Mijn bus kiezen →</a></section>`; }
function gameHeading(title,text) {return `<a class="back" href="#spelletjes">← Alle spellen</a>`+heading('OFFLINE SPELEN',title,text);}
function quizPage() {
  if(quizIndex>=D.games.quiz.length)return gameHeading('IJsland Quiz','Goed gespeeld!')+`<section class="panel game-result"><h2>${quizScore} / ${D.games.quiz.length} goed</h2><p>Speel nog een keer of daag je buur uit.</p><button class="button" data-quiz-reset>Opnieuw spelen</button></section>`;
  const q=D.games.quiz[quizIndex];return gameHeading('IJsland Quiz',`Vraag ${quizIndex+1} van ${D.games.quiz.length}`)+`<section class="panel"><h2>${e(q.question)}</h2><div class="quiz-options">${q.options.map((option,i)=>`<button class="button secondary" data-answer="${i}" ${quizAnswered?'disabled':''}>${e(option)}</button>`).join('')}</div><p id="quiz-feedback" role="status">${quizAnswered?e((quizChoice===q.answer?'Goed! ':'Nog niet helemaal. ')+q.explanation):''}</p><button class="button" id="quiz-next" data-quiz-next ${quizAnswered?'':'hidden'}>Volgende →</button></section>`;
}
function bingoPage() {return gameHeading('Busbingo','Spot iets vanuit je stoel en vink het af. Blijf veilig zitten; geen zoekopdrachten buiten de bus.')+`<section class="panel"><div class="bingo-grid">${D.games.bingo.map((item,i)=>`<button data-bingo="${i}" aria-pressed="${bingoState.includes(i)}">${e(item)}</button>`).join('')}</div><p id="bingo-count" role="status">${bingoState.length} van ${D.games.bingo.length} gespot</p><button class="button secondary" data-bingo-reset>Nieuwe bingokaart</button></section>`;}
function placesPage() {return gameHeading('Raad de plek','Lees de aanwijzing. Raad eerst, klap daarna het antwoord open.')+`<div class="knowledge-grid">${D.games.places.map((place,i)=>`<section class="panel"><span class="eyebrow">PLEK ${i+1}</span><h2>${e(place.clue)}</h2><details><summary>Bekijk het antwoord</summary><p>${e(place.answer)}</p></details></section>`).join('')}</div>`;}
function secondsPage() {return gameHeading('IJsland 30 Seconds','Omschrijf vijf woorden zonder ze te noemen. Je team raadt. Eén ronde duurt 30 seconden.')+`<section class="panel seconds-game"><div id="seconds-clock" role="timer" aria-label="Resterende seconden">30</div><div id="seconds-words"><p>Klaar om te starten?</p></div><p id="seconds-result" role="status"></p><button class="button" data-seconds-start>Start ronde</button><p class="small muted">Tel zelf hoeveel woorden goed zijn geraden. Geen online scorebord.</p></section>`;}
function challengesPage() {return gameHeading('Challenges','Samen doen, zonder internet. Volg altijd de afspraken van je begeleiders.')+`<div class="knowledge-grid">${D.games.challenges.map((challenge,i)=>`<section class="panel"><span class="eyebrow">CHALLENGE ${i+1}</span><h2>${e(challenge)}</h2><details><summary>Tips voor je groep</summary><p>Geef iedereen een beurt. Houd het gezellig en blijf op je plek in de bus.</p></details></section>`).join('')}</div>`;}
function photosPage() {
  const approved=D.photos.entries.filter(photo=>photo.approved===true && (!photoFilter||photo.day===photoFilter));
  return heading('📸 ONZE EXPEDITIE','Foto’s van onderweg','De plek voor onze gezamenlijke herinneringen.')+`<div class="choice-row photo-filters" aria-label="Filter foto’s">${[0,1,2,3,4,5].map(day=>`<button class="button secondary" data-photo-filter="${day}" aria-pressed="${photoFilter===day}">${day?'Dag '+day:'Alles'}</button>`).join('')}</div><section class="panel"><div class="photo-toolbar"><span class="pill">GEZAMENLIJKE UPLOAD KOMT LATER</span><button class="button" data-photo-info>+ Foto toevoegen</button></div><p id="photo-info" role="status" hidden>De gezamenlijke uploadfunctie is nog niet geactiveerd. Bewaar je foto’s voorlopig op je eigen telefoon. Later controleert een begeleider ingezonden foto’s voordat iedereen ze kan zien.</p>${approved.length?`<div class="photo-wall">${approved.map(photo=>`<figure><img src="${e(photo.src)}" alt="${e(photo.caption)}" loading="lazy"><figcaption>Dag ${photo.day} · ${e(photo.caption)}</figcaption></figure>`).join('')}</div>`:`<div class="photo-wall">${(photoFilter?[photoFilter]:[1,2,3,4,5]).map(day=>`<div class="photo-placeholder"><span>📷</span><strong>Dag ${day}</strong><small>Hier komen straks onze foto’s</small></div>`).join('')}</div><p class="muted">Nog geen gedeelde foto’s${photoFilter?' voor dag '+photoFilter:''}. Je hoeft nu niets te uploaden.</p>`}</section>`;
}
function formatIcelandDate(date) {return new Intl.DateTimeFormat('nl-NL',{timeZone:'Atlantic/Reykjavik',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(date);}
function auroraPage() {
  return heading('🌌 64.217° N · 20.733° W','Aurora Watch – Laugarvatn','Onze uitvalsbasis tijdens nacht 1 t/m 3. Bekijk de omstandigheden voor een donkere, heldere hemel.')+`<section class="panel aurora-summary"><span class="eyebrow">VANNACHT · IJSLANDSE TIJD</span><h2>Kans: niet betrouwbaar te bepalen</h2><p>Noorderlicht is nooit gegarandeerd. Kp meet wereldwijde geomagnetische activiteit en is geen lokale kansvoorspelling voor Laugarvatn.</p><div class="aurora-metrics"><div><small>Actuele activiteit / Kp</small><strong>${auroraState.kp?e(auroraState.kp.value):'Niet beschikbaar'}</strong>${auroraState.kp?`<small>Meting: ${e(formatIcelandDate(auroraState.kp.time))} (UTC)</small>`:''}</div><div><small>Gegevens gecontroleerd</small><strong>${auroraState.checked?e(formatIcelandDate(auroraState.checked)):'Nog niet opgehaald'}</strong></div></div><p role="status">${auroraState.loading?'Actuele bronnen ophalen…':!navigator.onLine?'Je bent offline. Live omstandigheden kunnen nu niet worden vernieuwd.':!auroraState.kp&&!auroraState.weather?'Live gegevens zijn momenteel niet beschikbaar. Je bent mogelijk offline of de bron is niet bereikbaar. Gebruik de officiële bronnen hieronder.':''}</p><button class="button secondary" data-aurora-refresh ${auroraState.loading?'disabled':''}>Vernieuwen ↻</button></section><div class="route-grid">${auroraNights()}</div><section class="panel"><h2>Controleer de officiële verwachting</h2><a class="button" href="${e(D.aurora.officialURL)}" target="_blank" rel="noopener noreferrer">IJslandse weerdienst · aurorakaart ↗</a><p>De aurorakaart van de IJslandse weerdienst combineert bewolking met aurora-informatie. Kijk buiten pas na overleg met een begeleider; kleed je warm en blijf samen.</p><p class="small muted">Bronnen: NOAA SWPC (waargenomen Kp), <a class="text-link" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo (bewolkingsmodel, CC BY 4.0)</a> en de IJslandse weerdienst. Externe bronnen hebben internet nodig. Voor 31 januari–2 februari 2027 is pas kort voor vertrek een bruikbare weersverwachting beschikbaar.</p></section>`;
}
function auroraNights() {
  return ['Vanavond','Morgen','Overmorgen'].map((label,i)=>{
    const w=auroraState.weather;let info='<p>Bewolking en kijkperiode: geen actuele gegevens beschikbaar.</p>';
    if(w){
      const start=Date.parse(w.daily.sunset[i]+'Z'),end=Date.parse(w.daily.sunrise[i+1]+'Z');
      const candidates=w.hourly.time.map((time,j)=>({time:Date.parse(time+'Z'),cloud:w.hourly.cloud_cover[j]})).filter(item=>item.time>=Math.max(start,Date.now())&&item.time<end&&typeof item.cloud==='number'&&item.cloud>=0&&item.cloud<=100);
      if(candidates.length){const best=candidates.reduce((a,b)=>a.cloud<=b.cloud?a:b);info=`<p>Minste verwachte bewolking: <strong>${best.cloud}%</strong></p><p>Mogelijk kijkmoment: <strong>${e(formatIcelandDate(new Date(best.time)))}</strong></p><p class="small muted">Dit is een donker tijdvak met de minste modelbewolking, geen voorspelling dat er noorderlicht zichtbaar is.</p>`;}
    }
    return `<section class="panel"><span class="eyebrow">${label}</span><h2>Donkerte & opklaringen</h2>${info}</section>`;
  }).join('');
}
async function loadAurora(force=false) {
  if(auroraState.loading||(!force&&auroraState.checked&&Date.now()-auroraState.checked.getTime()<5*60*1000))return;
  auroraState={loading:true,kp:null,weather:null,checked:null};if(location.hash==='#aurora')render();
  async function json(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);try{const response=await fetch(url,{signal:controller.signal,cache:'no-store',credentials:'omit'});if(!response.ok)throw new Error('Bron niet beschikbaar');return await response.json();}finally{clearTimeout(timer);}}
  if(navigator.onLine){
    const params=new URLSearchParams({latitude:D.aurora.latitude,longitude:D.aurora.longitude,hourly:'cloud_cover',daily:'sunrise,sunset',forecast_days:'4',timezone:'UTC'});
    const results=await Promise.allSettled([json(D.aurora.kpURL),json(D.aurora.weatherURL+'?'+params)]);
    if(results[0].status==='fulfilled'){
      const rows=results[0].value;
      if(Array.isArray(rows)){const samples=rows.slice(1).filter(row=>Array.isArray(row)&&row[1]!==null&&row[1]!==''&&row[1]!==undefined).map(row=>({time:new Date(String(row[0]).replace(' ','T')+'Z'),value:Number(row[1])})).filter(row=>Number.isFinite(row.value)&&row.value>=0&&row.value<=9&&Number.isFinite(row.time.getTime())&&Date.now()-row.time.getTime()>=-15*60*1000&&Date.now()-row.time.getTime()<6*60*60*1000).sort((a,b)=>b.time-a.time);auroraState.kp=samples[0]||null;}
    }
    if(results[1].status==='fulfilled'){
      const w=results[1].value;
      if(Array.isArray(w?.hourly?.time)&&w.hourly.time.length&&Array.isArray(w.hourly.cloud_cover)&&w.hourly.time.length===w.hourly.cloud_cover.length&&Array.isArray(w.daily?.sunrise)&&Array.isArray(w.daily?.sunset)&&w.daily.sunrise.length>=4&&w.daily.sunset.length>=4&&w.daily.sunrise.every(time=>typeof time==='string'&&Number.isFinite(Date.parse(time+'Z')))&&w.daily.sunset.every(time=>typeof time==='string'&&Number.isFinite(Date.parse(time+'Z')))&&w.utc_offset_seconds===0&&w.hourly.time.every(time=>typeof time==='string'&&Number.isFinite(Date.parse(time+'Z')))&&w.hourly.time.some(time=>Date.parse(time+'Z')>Date.now()))auroraState.weather=w;
    }
  }
  auroraState.loading=false;auroraState.checked=new Date();if(location.hash==='#aurora')render();
}
function afterModuleRender(page) {if(page!=='30seconds') {clearInterval(secondsTimer);secondsTimer=undefined;}if(page==='aurora'&&!auroraState.loading&&!auroraState.checked)setTimeout(()=>loadAurora(),0);}
function initModules() {
  const welcome=document.querySelector('#welcome');
  if(!profile.firstName.trim()||!profile.className.trim())welcome.showModal();
  document.querySelector('#welcome-form').addEventListener('submit',event=>{
    event.preventDefault();const form=new FormData(event.target);const firstName=String(form.get('firstName')).trim(),className=String(form.get('className')).trim();
    if(!firstName||!className)return;profile={...profile,firstName:firstName.slice(0,40),className:className.slice(0,20)};saveLocal(PROFILE_KEY,profile);welcome.close();render();
  });
  welcome.addEventListener('cancel',event=>event.preventDefault());
  main.addEventListener('submit',event=>{
    if(event.target.id!=='profile-form')return;event.preventDefault();const form=new FormData(event.target);const firstName=String(form.get('firstName')).trim(),className=String(form.get('className')).trim();if(!firstName||!className)return;profile={...profile,firstName:firstName.slice(0,40),className:className.slice(0,20)};const saved=saveLocal(PROFILE_KEY,profile);document.querySelector('#profile-saved').textContent=saved?'Profiel opgeslagen ✓':'Voor dit bezoek bijgewerkt.';
  });
  main.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-bus')){profile.bus=Number(button.dataset.bus)||null;saveLocal(PROFILE_KEY,profile);document.querySelectorAll('[data-bus]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.bus)===(profile.bus||0))));}
    if(button.hasAttribute('data-answer')&&!quizAnswered){quizAnswered=true;quizChoice=Number(button.dataset.answer);const q=D.games.quiz[quizIndex],correct=Number(button.dataset.answer)===q.answer;if(correct)quizScore++;document.querySelectorAll('[data-answer]').forEach(el=>el.disabled=true);document.querySelector('#quiz-feedback').textContent=(correct?'Goed! ':'Nog niet helemaal. ')+q.explanation;document.querySelector('#quiz-next').hidden=false;}
    if(button.hasAttribute('data-quiz-next')){quizIndex++;quizAnswered=false;quizChoice=null;render();}
    if(button.hasAttribute('data-quiz-reset')){quizIndex=0;quizScore=0;quizAnswered=false;quizChoice=null;render();}
    if(button.hasAttribute('data-bingo')){const i=Number(button.dataset.bingo);bingoState=bingoState.includes(i)?bingoState.filter(v=>v!==i):[...bingoState,i];saveLocal('expeditie-ijsland-2027-bingo',bingoState);button.setAttribute('aria-pressed',String(bingoState.includes(i)));document.querySelector('#bingo-count').textContent=`${bingoState.length} van ${D.games.bingo.length} gespot`;}
    if(button.hasAttribute('data-bingo-reset')){bingoState=[];saveLocal('expeditie-ijsland-2027-bingo',bingoState);render();}
    if(button.hasAttribute('data-photo-filter')){photoFilter=Number(button.dataset.photoFilter);render();}
    if(button.hasAttribute('data-photo-info'))document.querySelector('#photo-info').hidden=false;
    if(button.hasAttribute('data-aurora-refresh'))loadAurora(true);
    if(button.hasAttribute('data-seconds-start')){
      clearInterval(secondsTimer);const pool=[...D.games.words];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      document.querySelector('#seconds-words').innerHTML=`<ul>${pool.slice(0,5).map(word=>`<li>${e(word)}</li>`).join('')}</ul>`;document.querySelector('#seconds-result').textContent='';secondsEnd=Date.now()+30000;document.querySelector('#seconds-clock').textContent='30';button.textContent='Nieuwe ronde';
      secondsTimer=setInterval(()=>{const remaining=Math.max(0,Math.ceil((secondsEnd-Date.now())/1000));const clock=document.querySelector('#seconds-clock');if(!clock){clearInterval(secondsTimer);return;}clock.textContent=remaining;if(!remaining){clearInterval(secondsTimer);document.querySelector('#seconds-result').textContent='Tijd! Hoeveel woorden had je goed?';}},200);
    }
  });
  window.addEventListener('online',()=>{if(location.hash==='#aurora')loadAurora(true);});
}
