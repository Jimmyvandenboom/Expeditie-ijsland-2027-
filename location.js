// Only request a location after a deliberate tap. Never persist or upload coordinates.
function currentLocationCard(){
  return `<section class="current-location panel" aria-labelledby="current-location-title"><div class="current-location-heading"><div><span class="eyebrow">HIER BEN IK</span><h2 id="current-location-title">Mijn locatie</h2></div><button class="button secondary" id="locate-me" type="button">Toon mijn locatie</button></div><div class="current-location-map" id="current-location-map" role="region" aria-label="Kaart van mijn actuele locatie"><div class="current-location-placeholder"><span aria-hidden="true">⌖</span><p>Tik op de knop om je locatie op de kaart te zien.</p></div></div><p id="current-location-status" class="current-location-status" role="status">Je browser vraagt toestemming. Je locatie wordt niet opgeslagen. Kaarttegels worden online opgehaald bij OpenStreetMap.</p></section>`;
}
window.CurrentLocation=(()=>{
  let map,marker,accuracy,tileLayer,button,handler,onlineHandler,epoch=0,tileUnavailable=false;
  function status(text){const node=document.querySelector('#current-location-status');if(node)node.textContent=text;}
  function destroy(){epoch++;button?.removeEventListener('click',handler);window.removeEventListener('online',onlineHandler);map?.remove();map=null;marker=null;accuracy=null;tileLayer=null;button=null;tileUnavailable=false;}
  function mount(){
    button=document.querySelector('#locate-me');if(!button)return;
    const attachTiles=()=>{if(!map||tileLayer||!navigator.onLine)return;tileLayer=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);tileLayer.on('tileerror',()=>{tileUnavailable=true;status('Je locatie is aangegeven. Achtergrondkaart niet beschikbaar; probeer het later opnieuw met internet.');});};
    onlineHandler=()=>{if(map){tileUnavailable=false;if(tileLayer)tileLayer.redraw();else attachTiles();}};
    window.addEventListener('online',onlineHandler);
    handler=()=>{
      if(!navigator.geolocation){status('Deze browser ondersteunt geen locatiebepaling. De dagroutes hieronder blijven beschikbaar.');return;}
      if(!window.isSecureContext){status('Locatiebepaling vereist een beveiligde verbinding. Open de app via HTTPS.');return;}
      const current=++epoch;button.disabled=true;status('Je locatie wordt bepaald…');
      navigator.geolocation.getCurrentPosition(position=>{
        if(current!==epoch||!document.querySelector('#current-location-map'))return;
        button.disabled=false;button.textContent='Vernieuw locatie';
        const {latitude,longitude}=position.coords;const radius=Math.max(1,Number(position.coords.accuracy)||1);
        if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||!window.L){status('De locatiekaart kon niet laden. De dagroutes blijven beschikbaar.');return;}
        if(!map){document.querySelector('#current-location-map').innerHTML='';map=L.map('current-location-map',{scrollWheelZoom:false}).setView([latitude,longitude],14);attachTiles();}
        else map.setView([latitude,longitude],14);
        accuracy?.remove();marker?.remove();
        accuracy=L.circle([latitude,longitude],{radius,color:'#00a8e8',fillColor:'#00a8e8',fillOpacity:.12,weight:1}).addTo(map);
        marker=L.circleMarker([latitude,longitude],{radius:8,color:'#fff',weight:3,fillColor:'#951b81',fillOpacity:1}).addTo(map).bindPopup('Mijn actuele locatie');
        if(radius>500)map.fitBounds(accuracy.getBounds(),{padding:[20,20],maxZoom:14});
        status(`Locatie gevonden · nauwkeurigheid ongeveer ${Math.round(radius)} meter.${!navigator.onLine||tileUnavailable?' Achtergrondkaart niet beschikbaar; je locatie is wel aangegeven.':''}`);
      },error=>{
        if(current!==epoch)return;button.disabled=false;
        const messages={1:'Geen locatietoestemming. Je kunt de dagroutes hieronder gewoon gebruiken.',2:'Je locatie is nu niet beschikbaar. Controleer de locatie-instellingen en probeer opnieuw.',3:'Locatie bepalen duurde te lang. Probeer het opnieuw.'};
        status(messages[error.code]||'Je locatie kon niet worden bepaald. Probeer het opnieuw.');
      },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
    };
    button.addEventListener('click',handler);
  }
  return {mount,destroy};
})();
