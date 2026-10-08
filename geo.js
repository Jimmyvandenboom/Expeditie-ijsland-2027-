// GEO is een presentatielaag op dezelfde componenten en dezelfde centrale reisdata.
function geoHomeIdentity(includeBadge=true) {
  return `<div class="geo-only geo-identity">${includeBadge?`<span class="geo-route-badge">${e(D.geo.badge)}</span>`:''}<div class="geo-countdown" aria-label="Countdown tot vertrek"><span class="geo-countdown-label">TOT VERTREK</span><div id="geo-countdown-value"></div><small>Verzamelen op school · Nederlandse tijd</small></div></div>`;
}
function geoLocationSection(dayIndex) {
  const locations = Number.isInteger(dayIndex) ? D.geo.locations.filter(location=>D.days[dayIndex].route.some(stop=>stop.startsWith(location.routeName))) : D.geo.locations;
  if(!locations.length)return '';
  return `<section class="geo-only geo-locations"><div class="geo-section-heading"><div><span class="eyebrow">GEO FUTURE ROUTE</span><h2>Niet alleen kijken. Onderzoeken.</h2></div><span class="geo-field-tag">FIELD NOTES / 2027</span></div><div class="geo-location-grid">${locations.map(location=>{
    const episode = D.episodes.find(episode=>episode.locationId===location.id);
    return `<article class="geo-location-card geo-theme-${e(location.theme)}"><div class="geo-location-visual" aria-hidden="true"><span>${e(location.symbol)}</span><span class="geo-north">N ↑</span></div><div class="geo-location-body"><span class="geo-theme-label">${e(location.label)}</span><h3>📍 ${e(location.name)}</h3><p class="geo-coordinates">${Math.abs(location.latitude).toFixed(3)}° ${location.latitude<0?'S':'N'} · ${Math.abs(location.longitude).toFixed(3)}° ${location.longitude<0?'W':'E'}</p><p class="geo-location-fact"><strong>Wist je dat?</strong> ${e(location.fact)}</p><details><summary>Kijkopdracht →</summary><p>${e(location.task)}</p></details>${episode?`<div class="geo-location-audio"><strong>🎧 ${e(episode.title)}</strong><audio controls preload="none" src="${e(episode.src)}"></audio></div>`:'<span class="geo-podcast">🎧 Locatiepodcast volgt</span>'}</div></article>`;
  }).join('')}</div></section>`;
}
function updateGeoCountdown(now=Date.now()) {
  const target=document.querySelector('#geo-countdown-value');if(!target)return;
  const time=D.days[0].events[0][0];
  const departure=Date.parse(`${D.geo.startDate}T${time}:00+01:00`);
  if(!Number.isFinite(departure)){target.textContent='Vertrek op '+D.days[0].date;return;}
  const seconds=Math.max(0,Math.floor((departure-now)/1000));
  if(now>=departure){target.innerHTML='<strong>De expeditie is begonnen!</strong>';return;}
  const values=[Math.floor(seconds/86400),Math.floor(seconds%86400/3600),Math.floor(seconds%3600/60),seconds%60];
  target.innerHTML=values.map((value,i)=>`<span class="geo-countdown-unit"><strong>${String(value).padStart(2,'0')}</strong><span>${['dagen','uur','min','sec'][i]}</span></span>`).join('');
}
window.GeoUI={refresh:()=>updateGeoCountdown(),start:()=>{updateGeoCountdown();setInterval(()=>{if(['v3','v5'].includes(document.documentElement.dataset.design)&&document.visibilityState==='visible')updateGeoCountdown();},1000);}};
