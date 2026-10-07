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

Na een update: wijzig de cacheversie bovenin `sw.js` (bijvoorbeeld `expeditie-v2`) als appbestanden zijn veranderd. Online bezoeken laden de nieuwste bestanden; eerdere offline bestanden kunnen verouderd zijn. Nieuwe audio wordt niet automatisch offline opgeslagen.

## Controleren

`npm run check` controleert de JavaScript-syntaxis. Controleer in de browser ook alle navigatie, de vijf reisdagen, Maps-routes en mobiele weergave. Vink een item af, herlaad en controleer of het vinkje blijft staan. Bezoek de app eerst online en herlaad vervolgens offline. Deze functionele controles zijn tijdens de bouw met Chromium uitgevoerd; iPhone/Safari en Android op echte apparaten blijven nuttige aanvullende controles.
