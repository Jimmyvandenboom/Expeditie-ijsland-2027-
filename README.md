# 🇮🇸 EXPEDITIE IJSLAND 2027

Mobiele webapp/PWA voor **Maris College Bohemen**, 31 januari t/m 4 februari 2027, 27 reizigers.

## De app bekijken

**In deze cloudomgeving:** de lokale webserver draait op poort **8000**. Als je editor een poortenpaneel / Ports heeft, open daar poort 8000 met ‘Open in browser’ of ‘Preview’. Deze chatomgeving biedt niet altijd een browserpreview; gebruik dan een van de opties hieronder.

**Op je eigen computer:** download de repository via GitHub (Code → Download ZIP) en pak hem uit. Open een terminal in die map en voer uit:

```sh
python3 -m http.server 8000
```

Op Windows kun je `py -m http.server 8000` gebruiken. Open daarna **http://localhost:8000** in je browser. Met Node én Python geïnstalleerd werkt ook `npm start`. Je hoeft geen npm-pakketten te installeren. Open de HTML niet rechtstreeks als bestand: offline opslag via de serviceworker vereist een webserver.

**De eenvoudigste manier om op je telefoon te kijken:** publiceer de app met GitHub Pages (zie hieronder). De app heeft geen backend of API-sleutels nodig.

## Online publiceren met GitHub Pages

1. Zorg dat de nieuwe bestanden op de `main`-branch van GitHub staan (commit en push, of upload via GitHub).
2. Ga in de repository naar **Settings → Pages**.
3. Kies **Deploy from a branch**, branch **main**, map **/ (root)** en klik **Save**.
4. Zodra GitHub klaar is, toont dat paneel de echte website-link. Open die op je telefoon of computer.

Alle paden zijn relatief, dus de app werkt ook onder de projectmap van GitHub Pages. Alternatief: upload de volledige map naar een statische host zoals Netlify. Publicatie is niet automatisch uitgevoerd.

## Op je beginscherm zetten

- **iPhone:** open de online app in Safari → Deel → Zet op beginscherm.
- **Android:** open de online app in Chrome → menu → App installeren / Toevoegen aan startscherm.

Na het eerste bezoek en succesvol laden worden appbestanden offline opgeslagen. De paklijst bewaart vinkjes in localStorage op dit apparaat en in deze browser. Ze worden niet gedeeld met school of andere apparaten. Wissen van browsergegevens wist de vinkjes. Google Maps en toekomstige externe audio vereisen internet.

## Inhoud aanpassen

Bewerk **data.js**. Hier staan alle programma's, routestops, paklijstitems, kenniskaarten, weetjes, praktische gegevens en afleveringen.

- Hostel wijzigen: `practical.reykjavik`.
- Dagprogramma wijzigen: `days` → `events` (tijd, omschrijving).
- Maps-route wijzigen: `days` → `route` (eerste = vertrek, laatste = bestemming).
- Podcast toevoegen: zet een mp3 in een nieuwe map `audio` en voeg aan `episodes` toe:

```js
{ title: 'Aflevering 1', description: 'Onze eerste avonturen', src: 'audio/aflevering-1.mp3' }
```

De audiospeler verschijnt automatisch wanneer er afleveringen zijn. De kaartpagina heeft routeoverzichten met Google Maps-knoppen, geen ingebedde live kaart. De South Coast-route heeft ook twee deelroutes omdat mobiele Google Maps-browsers soms maximaal drie tussenstops ondersteunen. Brúarfoss in dag 4 is optioneel; de hoofdroute bevat deze stop.

De homekaart ‘Volgende avontuur’ gebruikt de eerste dag uit `days`; die kan later op datum/tijd worden geselecteerd. Alle weergegeven programmatijden zijn lokale tijden. De app geeft geen live wijzigingen of gegarandeerde noorderlichtwaarnemingen.

## Bestanden

- `index.html`: basispagina en navigatie.
- `style.css`: mobiele en desktopvormgeving.
- `app.js`: navigatie, interactieve kaarten, checklist en Maps-links.
- `data.js`: alle aanpasbare inhoud.
- `manifest.webmanifest`, `sw.js`, `assets/`: PWA, offline ondersteuning en lokale illustraties/iconen.

De serviceworker gebruikt network-first voor HTML, CSS, JavaScript, data en lokale assets, met `cache: no-store` om de browser-HTTP-cache te omzeilen. App-responses krijgen bovendien `Cache-Control: no-store`, zodat de browser geladen scripts niet opnieuw uit zijn geheugen-cache gebruikt. CacheStorage bewaart de offline kopieën onafhankelijk daarvan. Bij het openen, terugkeren naar het tabblad, opnieuw verbinden en elke vijf minuten in een zichtbaar tabblad controleert de app op updates. Gewijzigde bestanden worden opgeslagen en de pagina wordt automatisch herladen; de paklijst blijft behouden. Ook een deployment zonder wijziging in `sw.js` wordt zo opgehaald. Offline blijft de laatste opgeslagen versie beschikbaar. Een eerste online bezoek blijft nodig. Nieuwe audio wordt niet automatisch offline opgeslagen.

Bij veranderingen aan de cachestructuur verhoog je de cacheversie in `sw.js`. Oude caches worden na een succesvolle installatie opgeruimd. De overgang vanuit V1/V1.1 herlaadt bestaande tabbladen eenmalig omdat die oudere versies nog geen update-listener hebben. Een al geopende oude app kan pas vernieuwen zodra de browser de nieuwe serviceworker heeft opgehaald; open of herlaad de app daarvoor online. GitHub Pages moet de deployment eerst volledig hebben afgerond.

## Controleren

`npm run check` controleert de JavaScript-syntaxis. Controleer in de browser ook alle navigatie, de vijf reisdagen, Maps-routes en mobiele weergave. Vink een item af, herlaad en controleer of het vinkje blijft staan. Bezoek de app eerst online en herlaad vervolgens offline. Deze functionele controles zijn tijdens de bouw met Chromium uitgevoerd; iPhone/Safari en Android op echte apparaten blijven nuttige aanvullende controles.

## Automatische update-test

Voor de browsertest (niet nodig om de app te gebruiken): voer `npm ci` en `npm test` uit. De test gebruikt Chromium op `/usr/bin/chromium`; stel bij een andere installatie `CHROMIUM_PATH` in op het pad naar Chromium. De test simuleert een oude installatie, lang gecachte HTTP-bestanden, nieuwe deployments met dezelfde serviceworker, herverbinding en offline gebruik.

## Logo in de hero

De homepagina heeft rechtsboven ruimte voor het officiële logo; zonder logo blijft deze ruimte onzichtbaar. Zet het aangeleverde bestand later in `assets/maris-logo.png` en voeg `heroLogo: 'assets/maris-logo.png',` toe aan het object in `data.js`. Voeg dat bestand ook toe aan `FILES` in `sw.js` zodat het offline beschikbaar is, en verhoog de cacheversie. De weergave behoudt de beeldverhouding en reserveert op mobiel voldoende ruimte boven de titel. `assets/iceland.svg` is een lokaal, gestileerd silhouet zonder routes of plaatsnamen.

## Vier permanente stijlen

Bovenaan kies je jouw stijl: **V1 / V2 / V3 / V4**. Dit is een permanente keuze voor iedere reiziger.

- **V1 · Expedition:** het bestaande donkere expeditieontwerp.
- **V2 · Iceland Fresh:** lichte, ruime kaarten, turquoise accenten en een frisse lokale landschapillustratie.
- **V3 · Adventure:** avontuurlijke reisposter, vulkanisch landschap, grote titels en mosgroene/gletsjerblauwe dagkaarten.

- **V4 · GEO / Iceland Explorer:** cartografisch raster, contouren, kompasdetails en veldwerkstijl.

Het actieve ontwerp wordt gemarkeerd en lokaal onthouden onder `expeditie-ijsland-2027-design`. De paklijst gebruikt zijn bestaande, aparte opslagsleutel. Wisselen verandert alleen CSS en laadt geen aparte app: alle ontwerpen gebruiken dezelfde pagina's, functies en `data.js`. De huidige pagina en aangevinkte items blijven behouden. De varianten staan in `themes.css`; V1 blijft gebaseerd op `style.css`. Alle illustraties zijn lokale SVG-bestanden en werken offline.

`npm test` controleert ook alle vier de ontwerpen op vier schermbreedtes, wisselen en herladen, behouden paklijstgegevens, gedeelde gegevenswijzigingen en offline gebruik.

## Persoonlijk profiel en Mijn bus

Bij de eerste start vraagt de app alleen om voornaam en klas. Je profiel staat lokaal onder `expeditie-ijsland-2027-profile`, zonder account of netwerkopslag. Via **Mijn profiel** kun je beide wijzigen en later Bus 1, 2 of 3 kiezen. Zonder buskeuze verschijnt er geen buslabel op home. De paklijst en stijlopslag gebruiken hun bestaande sleutels en blijven behouden. Browsergegevens wissen verwijdert lokale voorkeuren. Een profiel wordt niet naar de weerbronnen verstuurd.

## Nieuwe modules

- **Spelletjes:** werkende quiz met feedback, Busbingo met lokaal opgeslagen vinkjes, Raad de plek met uitklapbare antwoorden, 30 Seconds met een echte 30-secondenklok en Challenges. Quiz en timer starten opnieuw na herladen; Busbingo blijft bewaard. Bus Battle is alleen voorbereid, zonder gedeelde scores of online competitie.
- **Foto’s:** fotowall, dagfilters en informatieknop. Er vindt nog geen upload plaats. `photos.entries` in `data.js` kan later goedgekeurde fotovermeldingen krijgen (`day`, `src`, `caption`, `approved: true`). Niet-goedgekeurde vermeldingen worden niet getoond. Voor echt uploaden, autorisatie en moderatie is later een backend nodig; alleen een clientfilter is geen toegangsbeveiliging.
- **Meldingen:** instellingeninterface en serviceworker-handlers voor `push` en `notificationclick`. Geen toestemming, pushabonnement, VAPID-keys of verzending actief. De latere dienst moet een verzendbackend, publieke VAPID-sleutel en veilige abonnementsopslag bieden; de private sleutel hoort uitsluitend op de backend.
- **Aurora Watch:** Laugarvatn met bronlinks, verse Kp-metingen en drie nachtkaarten voor bewolking zodra de externe bronnen geldig antwoorden. Geen fictieve verwachtingen of lokale kanspercentages. Kp is geen lokale kansvoorspelling. De kijkperiode wordt gekozen uit nachtelijke modeluren met de minste bewolking, niet als garantie op aurora.

## Aurora-bronnen en beperkingen

De app probeert rechtstreeks, zonder sleutel of credentials:

1. NOAA SWPC: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` voor actuele **waargenomen** wereldwijde Kp. Metingen ouder dan zes uur worden niet getoond.
2. Open-Meteo: `https://api.open-meteo.com/v1/forecast` met Laugarvatn-coördinaten, uur-bewolking en zonsopkomst/-ondergang in UTC. IJsland gebruikt UTC. Data-attributie: Open-Meteo, CC BY 4.0; voor eventuele commerciële toepassing moeten de dienstvoorwaarden opnieuw worden gecontroleerd.
3. IJslandse weerdienst: `https://en.vedur.is/weather/forecasts/aurora/` als officiële externe kaart met verwachting en bewolking.

Externe requests hebben een timeout en gecontroleerde JSON-invoer. Onbereikbare bronnen, CORS-beperkingen, ongeldige data, verlopen Kp of offline gebruik geven een expliciete fallback. Live data worden niet in de serviceworker-cache opgeslagen; de offline app blijft wel werken. De NOAA- en Open-Meteo-domeinen waren in de bouwomgeving door de netwerkproxy geblokkeerd (HTTP 403). **De live verbinding is daarom niet end-to-end bevestigd.** Fixtures testen geldige, verlopen en ontbrekende data, maar bewijzen geen live bereikbaarheid vanuit GitHub Pages. De officiële link blijft beschikbaar. Een specifieke voorspelling voor 31 januari–2 februari 2027 is pas kort voor vertrek zinvol.

`modules.js` beheert de gedeelde lokale profiel-/spelstaat en de voorbereide serviceadapters. Nieuwe spelinhoud, fotovermeldingen en bronconfiguratie staan centraal in `data.js`. `npm test` test daarnaast onboarding, profiel, bussen, alle vier thema’s, vijf spellen, de foto-/pushinterfaces, Aurora-fixtures, offline herladen en behoud van bestaande paklijstgegevens. Voor online brongebruik gelden de toegangs- en gebruiksvoorwaarden van de aanbieders.
