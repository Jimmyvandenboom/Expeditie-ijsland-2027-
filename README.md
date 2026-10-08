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

Het originele schoollogo staat rechtsboven in de hero en wordt ook gebruikt in de header en het welkomstscherm. `heroLogo` in `data.js` verwijst naar `assets/maris-logo.png`, dat offline wordt gecachet. De beeldverhouding blijft behouden en mobiel is ruimte boven de titel gereserveerd. `assets/iceland-topography.png` is de lokale topografische homekaart zonder routes of plaatsnamen.

## Vier permanente stijlen

Via de stijlkiezer kies je jouw stijl: **V1 / V2 / V3 / V4 / V5**. Dit is een permanente keuze voor iedere reiziger.

- **V1 · Expedition:** het bestaande donkere expeditieontwerp.
- **V2 · Iceland Fresh:** lichte, ruime kaarten, turquoise accenten en een frisse lokale landschapillustratie.
- **V3 · Adventure:** avontuurlijke reisposter, vulkanisch landschap, grote titels en mosgroene/gletsjerblauwe dagkaarten.

- **V4 · GEO / Iceland Explorer:** cartografisch raster, contouren, kompasdetails en veldwerkstijl.

Het actieve ontwerp wordt gemarkeerd en lokaal onthouden onder `expeditie-ijsland-2027-design`. De paklijst gebruikt zijn bestaande, aparte opslagsleutel. Wisselen verandert de presentatie en laadt geen aparte app: alle ontwerpen gebruiken dezelfde pagina's, functies en `data.js`. De huidige pagina en aangevinkte items blijven behouden. De varianten staan in `themes.css`; V1 blijft gebaseerd op `style.css`. Alle afbeeldingen staan lokaal in `assets/` en werken offline.

`npm test` controleert ook alle vijf de ontwerpen op vier schermbreedtes, wisselen en herladen, behouden paklijstgegevens, gedeelde gegevenswijzigingen en offline gebruik.

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

`modules.js` beheert de gedeelde lokale profiel-/spelstaat en de voorbereide serviceadapters. Nieuwe spelinhoud, fotovermeldingen en bronconfiguratie staan centraal in `data.js`. `npm test` test daarnaast onboarding, profiel, bussen, alle vijf thema’s, vijf spellen, de foto-/pushinterfaces, Aurora-fixtures, offline herladen en behoud van bestaande paklijstgegevens. Voor online brongebruik gelden de toegangs- en gebruiksvoorwaarden van de aanbieders.

### V4 · GEO Future

V4 deelt de Adventure-componenten en basisstyling van V3. Alleen V4 krijgt de
cartografische SVG-laag, Geo Future Route-identiteit, countdown en locatiecards.
De achtergrondlijnen en stippelroute zijn illustratief, geen navigatiekaart.
`data.js` bevat alle GEO-locaties, afgeronde locatiecoördinaten, thema's, weetjes
en kijkopdrachten onder `geo`. Bestaande routes en tijden blijven de bron voor
de dagselectie en het verzameltijdstip. De countdown gebruikt `geo.startDate`
en het eerste programma-event, in Nederlandse wintertijd (UTC+1).
Voeg later een podcast toe aan de bestaande `episodes`-lijst met `locationId`
(gelijk aan het GEO-locatie-id), `title` en `src`; de locatiecard toont dan audio.
Tot die tijd staat er expliciet ‘Locatiepodcast volgt’. Afbeeldingen en GEO-code
worden offline opgeslagen door cacheversie v16.

`tests/geo-future.cjs` vergelijkt alle berekende stijlen en afmetingen van V1–V3-hero's met commit
`fb29c27` en controleert V4 op vier schermbreedtes, countdown-grenzen,
centrale gegevens en uitklapbare kijkopdrachten.


### Interactieve dagroutes

De kaartpagina gebruikt lokaal meegeleverde Leaflet 1.9.4 (BSD-2-Clause),
OpenStreetMap-kaarttegels met bronvermelding en de publieke OSRM-wegroutering.
Er is geen API-key nodig. Deze externe diensten vereisen internet en kunnen
tijdelijk onbeschikbaar zijn. Er worden geen tegels vooraf gedownload of door
de service worker bulk-gecachet. Blokkeert de routering, dan tonen expliciet
schematische stippellijnen de stopvolgorde. Offline blijven dagselector, stops
en deze lijnen werken; de achtergrondkaart vereist internet. Dit toont de
geplande reis, geen GPS-positie of live verkeersinformatie.

Alle dagvolgordes komen uit `days[].route` in `data.js`. `routeLocations` bevat
per unieke locatie één zichtbare naam en afgeronde kaartcoördinaten;
hetzelfde wordt gebruikt voor alle vijf de thema's. De laatst gekozen kaartdag
wordt lokaal onthouden. Stops zijn aanklikbaar en de knop ‘Alle stops’ zoomt
terug naar de volledige route. De externe Maps-link en de deelroutes voor
lange routes worden uit dezelfde daggegevens samengesteld.

`tests/route-map.cjs` test alle vijf dagen in vijf thema's op telefoon en
desktop, plus zoom/pan, pop-ups, routevolgorde, herstel na offline gebruik en
fouten van de routering. Externe diensten gebruiken expliciete testfixtures:
live OSM/OSRM zijn vanuit deze cloudomgeving geblokkeerd (HTTP 403).


De stops Bridge Between Continents en Gunnuhver hebben in `routeLocations`
ook voorbereide GEO-velden: `geoTheme`, `description`, `podcastTitle`,
`audioSrc`, `fact`, `lookTask`, `photoChallenge` en `visited`, naast id, naam en
coördinaten. `audioSrc: null` betekent dat er nog geen podcastaudio bestaat.
Lege contentvelden zijn gereserveerd voor later; `visited: false` is alleen
een standaardwaarde voor toekomstige lokale bezoekregistratie. Er wordt
geen bezoekstatus van leerlingen in de publieke reisdata opgeslagen.


### Topografische homekaart

De homekaart gebruikt `assets/iceland-topography.png`: een lokale uitsnede
van Natural Earth I met echt shaded relief en satelliet-afgeleid landdek,
gemaskerd met de gedetailleerde Natural Earth 1:10m-kustlijn. Zee is transparant;
de blauwe kleurtonen en kustverlichting passen bij de expeditie-achtergrond.
Er zijn geen verzonnen reliëflijnen of AI-geografische vormen toegevoegd.
Op desktop staat de kaart naast de titel; op telefoon schaalt hij onder de
titel. Bronvermelding, resolutie, projectie en reproduceerbare bronbestanden
staan in `assets/map-source/README.md`. De PNG is opgenomen in de offlinecache.


Het welkomstscherm, de header en de hero gebruiken hetzelfde originele logo:
`assets/maris-logo.png`, ingesteld via `heroLogo` in `data.js`. Het bestand is
byte voor byte gelijk aan de upload uit commit `317afc5`; alleen de bestandsnaam
is genormaliseerd. De oorspronkelijke kleuren en verhoudingen blijven behouden
met `height: auto` en `object-fit: contain`. De serviceworker bewaart het logo
offline in cacheversie v16. Bij een ontbrekend bestand blijven de logoplekken
verborgen zodat de app bruikbaar blijft.


### V5 · Maris Reisdashboard

Herstelpunt op GitHub: tag `restore-before-v5-2026-10-08`, gericht op commit
`8891d53` (vóór de V5-wijzigingen). De ontwerpreferentie staat ongewijzigd in
`assets/Expeditie IJsland Reisdashboard.png`. Het dashboard is opgebouwd uit
HTML, CSS en JavaScript, met witte navigatie, paarse pictogrammen/titelvlakken,
zes klikbare kaarten en een SVG-golf. Er wordt geen volledige screenshot als
achtergrond of interface gebruikt. De lokale fotografische assets (`v5-*.webp`)
zijn uitsneden van uitsluitend de fotografie uit de goedgekeurde referentie.
De echte IJslandkaart blijft de Natural Earth-topografische asset. De
referentiekaart met onjuiste daglabels/routes wordt niet overgenomen.

Alle links gaan naar bestaande app-pagina's; Downloads, Schoolgids, Groep
en Werken bij worden niet als nieuwe functies gesuggereerd. Reisdata,
locaties en het dag-2-onderdeel komen uitsluitend uit `data.js`, dat voor
V5 ongewijzigd blijft. `v5.js` bevat alleen de presentatie.

V5 is de nieuwe standaard. Bestaande installaties krijgen deze presentatie
eenmalig; profiel, buskeuze, paklijst en spellen blijven behouden. Daarna
wordt een eigen keus uit V1–V5 weer gewoon onthouden. De kleine stijlkiezer
staat bij V5 rechtsonder en V1–V4 blijven beschikbaar. Alle gebruikte assets
worden offline opgeslagen in cacheversie v16.

`tests/v5-dashboard.cjs` controleert de home-layout op 320, 375, 430 en 1440px,
kaart/titelplaatsing, actuele gedeelde data, werkende kaarten/links, naamopslag,
de paklijst bij versie wisselen, offline eerste aanmelding en behoud van
bestaande gebruikersgegevens tijdens de eenmalige overgang. De algemene
app- en routetests controleren daarnaast alle vijf ontwerpen.

V5 gebruikt de effen kleuren uit het originele logo: paars `#951b81` en
cyaan `#00a8e8`. Het originele PNG-logobestand is ongewijzigd.

### V6 — Maris GEO Mobile

V6 hergebruikt de mobiele componenten van V4 met het officiële Maris-palet (paars `#951b81`, cyaan `#00a8e8`). De hoogtelijnen, kompasdetails, countdown en GEO-locatiekaarten blijven behouden. V4 en V6 tonen geen IJslandkaart in de hero; de interactieve routekaart blijft werken. V5 blijft de brede dashboardvariant. De kiezer onthoudt alle zes stijlen zonder profiel of paklijst te wijzigen. Serviceworker-cache: `expeditie-v17`.

V3 is verwijderd uit de kiezer. Een opgeslagen V3-keuze gaat naar V4. Alle homescreens (V1, V2, V4, V5, V6) zijn zonder IJslandillustratie; de interactieve routekaart blijft behouden. PWA-cache: `expeditie-v18`.

De stijlen zijn opeenvolgend hernummerd: oude V4 → V3 (GEO Future), oude V5 → V4 (Maris Reisdashboard), oude V6 → V5 (Maris GEO Mobile). Eenmalige migratie behoudt de gekozen presentatie en alle overige opgeslagen gegevens. V5 heeft een smallere, compactere paarse hero en avontuurkaart. PWA-cache: `expeditie-v19`.
