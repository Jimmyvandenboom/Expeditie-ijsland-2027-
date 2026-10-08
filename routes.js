// One map, one ordered route source (EXPEDITION.days), for all four designs.
let selectedRouteDay = 0;
try { const saved=Number(localStorage.getItem('expeditie-ijsland-2027-route-day'));if(Number.isInteger(saved)&&saved>=0&&saved<5)selectedRouteDay=saved; } catch {}
function routeStops(dayIndex) {
  return D.days[dayIndex].route.map(key => D.routeLocations[key]);
}
function routeMapPage() {
  return heading('OP EXPEDITIE','Route','Kies je dag. Bekijk de route en ontdek alle stops onderweg.') +
    `${document.documentElement.dataset.design==='v5'?currentLocationCard():''}<nav class="route-day-selector" aria-label="Kies een route">${D.days.map((day,i)=>`<button type="button" data-route-day="${i}" aria-pressed="${i===selectedRouteDay}"><strong>Dag ${i+1}</strong><span>${e(day.title)}</span></button>`).join('')}</nav><section class="route-explorer" aria-labelledby="route-day-title"><div id="route-day-content"></div><div class="route-map-wrap"><div id="route-map" role="region" aria-label="Interactieve routekaart" tabindex="0"></div><span class="route-north" aria-hidden="true">N ↑</span><button type="button" class="route-fit" id="route-fit">Alle stops ↗</button></div><p class="route-map-status" id="route-map-status" role="status"></p><div id="route-stop-content"></div><div class="route-map-external" id="route-map-external"></div></section>`;
}
window.RouteMap = (()=>{
  let map, routeLayer, markers, request, generation=0, retry, tilesUnavailable=false, statusMessage='';
  function destroy() {
    generation++;request?.abort();clearTimeout(retry);map?.remove();map=null;routeLayer=null;markers=null;tilesUnavailable=false;
  }
  function status(message){statusMessage=message;const node=document.querySelector('#route-map-status');if(node)node.textContent=message+(tilesUnavailable?' Achtergrondkaart niet beschikbaar; stops en routelijn blijven zichtbaar.':'');}
  function fit(){if(routeLayer){map.invalidateSize({pan:false,animate:false});map.fitBounds(routeLayer.getBounds(),{padding:[40,50],maxZoom:12,animate:false});}}
  async function select(index) {
    selectedRouteDay=index;try { localStorage.setItem('expeditie-ijsland-2027-route-day',String(index)); } catch {} request?.abort();clearTimeout(retry);const current=++generation;
    const day=D.days[index], stops=routeStops(index);
    document.querySelectorAll('[data-route-day]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.routeDay)===index)));
    document.querySelector('#route-day-content').innerHTML=`<div class="route-day-heading"><div><span class="eyebrow">${e(day.date)}</span><h2 id="route-day-title">Dag ${index+1} — ${e(day.title)}</h2></div><span class="route-distance" id="route-distance">${stops.length} stops</span></div>`;
    document.querySelector('#route-stop-content').innerHTML=`<ol class="route-stop-list" aria-label="Stops in reisvolgorde">${stops.map((stop,i)=>`<li><button type="button" data-route-stop="${i}"><span class="route-stop-number">${i+1}</span><span><strong>${e(stop.name)}</strong><small>${i===0?'Vertrek':i===stops.length-1?'Aankomst':'Tussenstop'}<span class="route-coordinates"> · ${stop.lat.toFixed(3)}° N · ${Math.abs(stop.lng).toFixed(3)}° W</span></small></span></button></li>`).join('')}</ol>`;
    document.querySelector('#route-map-external').innerHTML=routeLinks(day).replace('Open route in Google Maps →','Open volledige route →');
    if(!map){status('De interactieve kaart kon niet laden. Bekijk de stops of open de volledige route.');return;}
    map.closePopup();markers?.clearLayers();if(routeLayer)map.removeLayer(routeLayer);
    markers=L.layerGroup().addTo(map);
    // Repeated start/end coordinates share a numbered marker: every stop remains visible.
    const groups=new Map();stops.forEach((stop,i)=>{const key=`${stop.lat},${stop.lng}`;if(!groups.has(key))groups.set(key,{stop,indices:[]});groups.get(key).indices.push(i);});
    for(const {stop,indices} of groups.values()){
      const numbers=indices.map(i=>i+1).join(' / ');
      const marker=L.marker([stop.lat,stop.lng],{icon:L.divIcon({className:'route-map-marker '+(indices[0]%2?'route-marker-down':'route-marker-up'),html:`<span>${numbers}</span>`,iconSize:[indices.length>1?54:34,34],iconAnchor:[indices.length>1?27:17,17]}),title:`Stop ${numbers}: ${stop.name}`,keyboard:true}).addTo(markers);
      marker.bindPopup(`<strong>${e(stop.name)}</strong><br>Stop ${numbers} · ${stop.lat.toFixed(3)}° N, ${Math.abs(stop.lng).toFixed(3)}° W`);
      marker.routeIndices=indices;
    }
    const coordinates=stops.map(stop=>[stop.lat,stop.lng]);
    routeLayer=L.polyline(coordinates,{color:'#147b96',weight:5,opacity:.85,dashArray:'8 9'}).addTo(map);fit();
    status(navigator.onLine?'Stops geladen. Wegroute wordt opgehaald…':'Offline: stippellijnen verbinden de stops schematisch. De achtergrondkaart en wegroute hebben internet nodig.');
    if(!navigator.onLine)return;
    request=new AbortController();retry=setTimeout(()=>request?.abort(),12000);
    try{
      const points=stops.map(stop=>`${stop.lng},${stop.lat}`).join(';');
      const response=await fetch(`https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson&steps=false`,{signal:request.signal});
      if(!response.ok)throw Error('Route unavailable');const result=await response.json();
      const road=result.routes?.[0];if(result.code!=='Ok'||!Array.isArray(road?.geometry?.coordinates)||road.geometry.coordinates.length<2)throw Error('Invalid route');
      if(current!==generation||!map)return;
      routeLayer.setLatLngs(road.geometry.coordinates.map(([lng,lat])=>[lat,lng]));routeLayer.setStyle({dashArray:null});fit();
      document.querySelector('#route-distance').textContent=`${stops.length} stops · ± ${Math.round(road.distance/1000)} km`;
      status('Wegroute via OSRM · OpenStreetMap. Zoom, verschuif of tik op een genummerde stop. Geen live locatie of verkeersinformatie.');
    }catch(error){if(current===generation&&map)status('Wegroute niet beschikbaar: stippellijnen verbinden de stops schematisch, niet via de wegen. Achtergrondkaart heeft internet nodig.');}
    finally{if(current===generation)clearTimeout(retry);}
  }
  function mount(){
    if(window.L){
      map=L.map('route-map',{scrollWheelZoom:false,zoomControl:true,attributionControl:true,zoomAnimation:false,fadeAnimation:false});
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}).on('tileerror',()=>{tilesUnavailable=true;status(statusMessage);}).on('tileload',()=>{if(tilesUnavailable){tilesUnavailable=false;status(statusMessage);}}).addTo(map);
      L.control.scale({imperial:false}).addTo(map);
    }
    document.querySelector('#route-fit').onclick=()=>{if(map)fit();};
    select(selectedRouteDay);
  }
  document.addEventListener('click',event=>{
    const day=event.target.closest('[data-route-day]');if(day){select(Number(day.dataset.routeDay));return;}
    const stop=event.target.closest('[data-route-stop]');if(stop&&map){const index=Number(stop.dataset.routeStop);markers.eachLayer(marker=>{if(marker.routeIndices.includes(index)){map.setView(marker.getLatLng(),12,{animate:false});marker.openPopup();}});}
  });
  window.addEventListener('online',()=>{if(map)select(selectedRouteDay);});
  return {mount,destroy,get map(){return map;}};
})();
