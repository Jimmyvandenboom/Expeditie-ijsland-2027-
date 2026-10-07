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
