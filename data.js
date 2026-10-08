window.EXPEDITION = {
  heroLogo: 'assets/maris-logo.png',
  title: 'EXPEDITIE IJSLAND 2027', school: 'Maris College Bohemen', dates: '31 januari – 4 februari 2027', travelers: 27,
  practical: { guides: ['Mw. C. de Jong','Mr. J. van den Boom','Mr. Durmaz','Mr. Vink'], accommodation: 'Héraðsskólinn / The Old School', address: 'Laugarbraut 2, 840 Laugarvatn, Iceland', reykjavik: 'Hostel Reykjavík – wordt nog bekendgemaakt.', emergencyMessage: 'Bij een noodgeval: neem direct contact op met één van de begeleiders. Het noodnummer wordt tijdens de informatieavond gedeeld.', communication: 'Teams IJsland 2027' },
  days: [
    { date: 'Zondag 31 januari', title: 'Welkom in IJsland', theme: 'Tussen twee continenten', icon: '✈️', events: [['08:30','Verzamelen Maris Bohemen + paspoortcheck'],['11:20','Vertrek Schiphol met HV6887'],['13:45','Aankomst Keflavík'],['±14:30','Vertrek vanaf Keflavík Airport'],['±15:00','Bridge Between Continents'],['±15:45','Gunnuhver Geothermal Area'],['±16:15','Vertrek richting Laugarvatn'],['±18:00','Aankomst accommodatie Laugarvatn'],['19:00','Diner'],['20:00','Kamers & avondprogramma'],['21:30','Naar bed']], route: ['Keflavík International Airport, Iceland','Bridge Between Continents, Iceland','Gunnuhver Geothermal Area, Iceland','Laugarvatn, Iceland'] },
    { date: 'Maandag 1 februari', title: 'Watervallen', theme: 'Watervallen, ijs & zwart zand', icon: '🌊', events: [['08:00','Ontbijt + lunchpakket maken'],['09:00','Vertrek Laugarvatn'],['10:00–11:00','Seljalandsfoss'],['11:30–13:00','Skógafoss + lunch'],['13:30–14:30','Sólheimajökull – wandeling'],['15:00–16:00','Reynisfjara – zwart strand'],['16:15–17:00','Vík – boodschappen Krónan'],['19:30','Aankomst Laugarvatn'],['20:00','Diner'],['22:00','Aurora Lookout'],['23:00','Terug / bed']], route: ['Laugarvatn, Iceland','Seljalandsfoss, Iceland','Skógafoss, Iceland','Sólheimajökull, Iceland','Reynisfjara, Iceland','Vík, Iceland','Laugarvatn, Iceland'] },
    { date: 'Dinsdag 2 februari', title: 'Geologie & Ontspanning', theme: 'Aardplaten ontmoeten warm water', icon: '♨️', events: [['08:00','Ontbijt + lunchpakket'],['09:00','Vertrek'],['09:00–12:00','Þingvellir / Silfra wandeling'],['12:45–13:15','Kerið + lunch'],['14:45–17:00','Secret Lagoon'],['17:30','Laugarvatn'],['18:00','Spelletjes / vrije tijd'],['20:00','Optioneel Aurora Lookout'],['23:00','Bed']], route: ['Laugarvatn, Iceland','Silfra, Thingvellir, Iceland','Kerið, Iceland','Secret Lagoon, Iceland','Laugarvatn, Iceland'] },
    { date: 'Woensdag 3 februari', title: 'Golden Circle & Reykjavík', theme: 'Van natuurkracht naar stadslicht', icon: '🌋', events: [['08:00','Ontbijt + tassen pakken'],['09:00','Vertrek Laugarvatn'],['09:30–10:30','Gullfoss'],['10:45–13:00','Geysir / Strokkur'],['±15:00','Aankomst Reykjavík'],['15:00–18:30','Reykjavík ontdekken'],['18:30–19:30','Diner Reykjavík'],['±20:00','Hostel / overnachting Reykjavík']], route: ['Laugarvatn, Iceland','Gullfoss, Iceland','Geysir, Iceland','Reykjavík, Iceland'] },
    { date: 'Donderdag 4 februari', title: 'Terugvlucht', theme: 'Een rugzak vol herinneringen', icon: '🛫', events: [['07:00','Opstaan, inpakken en kamer opruimen'],['08:30','Ontbijt'],['09:30','Vertrek Keflavík Airport'],['11:30','Aankomst luchthaven'],['14:45','Vlucht HV6888 → Schiphol'],['18:55','Aankomst Schiphol'],['20:30','Verwachte aankomst Maris College Bohemen']], route: ['Reykjavík, Iceland','Keflavík International Airport, Iceland'] }
  ],
  // Eén locatiecatalogus voor de embedded kaart en de bestaande centrale dagroutes.
  routeLocations: {
    'Keflavík International Airport, Iceland': { name:'Keflavík Airport', lat:63.997, lng:-22.624 },
    // GEO-content voorbereid; audioSrc blijft null tot er echte audio beschikbaar is.
    // visited is een standaardwaarde voor toekomstige lokale bezoekregistratie.
    'Bridge Between Continents, Iceland': {
      id:'bridge-between-continents', name:'Bridge Between Continents', lat:63.868, lng:-22.675,
      geoTheme:'platentektoniek / Mid-Atlantische Rug',
      description:'Een brug over een spleet in het vulkanische landschap van Reykjanes, bij de grens tussen twee aardplaten.',
      podcastTitle:'Waarom scheurt IJsland uit elkaar?', audioSrc:null,
      fact:'', lookTask:'', photoChallenge:'', visited:false
    },
    'Gunnuhver Geothermal Area, Iceland': {
      id:'gunnuhver', name:'Gunnuhver Geothermal Area', lat:63.820, lng:-22.686,
      geoTheme:'geothermie / vulkanisme',
      description:'Een geothermisch gebied op Reykjanes met stoompluimen en hete modderbronnen.',
      podcastTitle:'Waarom kookt de aarde hier?', audioSrc:null,
      fact:'', lookTask:'', photoChallenge:'', visited:false
    },
    'Laugarvatn, Iceland': { name:'Laugarvatn', lat:64.218, lng:-20.733 },
    'Seljalandsfoss, Iceland': { name:'Seljalandsfoss', lat:63.6156, lng:-19.9886 },
    'Skógafoss, Iceland': { name:'Skógafoss', lat:63.532, lng:-19.511 },
    'Sólheimajökull, Iceland': { name:'Sólheimajökull', lat:63.532, lng:-19.370 },
    'Reynisfjara, Iceland': { name:'Reynisfjara', lat:63.404, lng:-19.044 },
    'Vík, Iceland': { name:'Vík', lat:63.418, lng:-19.006 },
    'Silfra, Thingvellir, Iceland': { name:'Þingvellir / Silfra', lat:64.255, lng:-21.124 },
    'Kerið, Iceland': { name:'Kerið', lat:64.041, lng:-20.885 },
    'Secret Lagoon, Iceland': { name:'Secret Lagoon', lat:64.137, lng:-20.309 },
    'Gullfoss, Iceland': { name:'Gullfoss', lat:64.327, lng:-20.121 },
    'Geysir, Iceland': { name:'Geysir / Strokkur', lat:64.312, lng:-20.301 },
    'Reykjavík, Iceland': { name:'Reykjavík', lat:64.147, lng:-21.940 }
  },
  packing: {
    'Documenten': ['Paspoort / ID','Verzekeringsbewijs','Pinpas'],
    'Kleding': ['Winterjas','Muts','Sjaal','Handschoenen','Thermokleding','Trui / hoodie','Lange mouwen','Ski- of joggingbroek','Ondergoed','Dikke sokken','Extra skisokken','Pyjama'],
    'Schoenen': ['Stevige waterdichte schoenen','Extra paar schoenen','Slippers'],
    'Zwemmen': ['Zwemkleding','Kleine handdoek'],
    'Persoonlijk': ['Toilettas','Eventuele medicijnen'],
    'Elektronica': ['Telefoon','Oplader','Powerbank'],
    'Overig': ['Rugzak','Eten voor de heenreis','Spelletjes']
  },
  knowledge: [
    ['🌍','Ontstaan van IJsland','IJsland ligt op de Mid-Atlantische Rug, waar twee aardplaten uit elkaar bewegen. Magma stijgt op en stolt tot nieuw gesteente. Ook een hotspot onder het eiland zorgt voor extra magma.'],
    ['🌋','Vulkanisme','Onder IJsland zit heet magma. Als dat aan het oppervlak komt, noemen we het lava. Uitbarstingen bouwen nieuw land op, maar kunnen ook as en gevaarlijke gassen verspreiden.'],
    ['🧊','Gletsjers','Een gletsjer ontstaat als sneeuw zich jarenlang ophoopt en samengedrukt wordt tot ijs. Het ijs beweegt langzaam en schuurt dalen uit. Door opwarming verliezen veel gletsjers ijs.'],
    ['♨️','Geothermische energie','Heet gesteente verwarmt water onder de grond. IJslanders gebruiken dit warme water voor huizen en zwembaden. Stoom kan ook turbines aandrijven om elektriciteit te maken.'],
    ['🌌','Noorderlicht','Deeltjes van de zon botsen met gassen hoog in de atmosfeer. Die gassen geven licht af. Een donkere, heldere hemel maakt het makkelijker te zien; een waarneming is nooit gegarandeerd.'],
    ['🌊','Watervallen','Rivieren vallen over harde gesteentelagen of steile randen. Smeltwater van gletsjers voedt veel IJslandse rivieren. Bij Skógafoss valt het water ongeveer 60 meter naar beneden.'],
    ['🪨','Zwarte stranden','Het zwarte zand is afkomstig van vulkanisch gesteente, zoals basalt. Golven breken het gesteente in kleine korrels. Bij Reynisfjara kunnen plotseling grote golven ver het strand op komen.'],
    ['🌍','Þingvellir en aardplaten','Hier zie je de grens tussen de Noord-Amerikaanse en Euraziatische plaat. Ze bewegen langzaam uit elkaar. De spleet Silfra is gevuld met helder grondwater. Wij wandelen hier; zwemmen is geen onderdeel van het programma.'],
    ['💦','Geysir & Strokkur','Ondergronds water wordt door heet gesteente verwarmd. Door druk kan het plots omhoog spuiten. Strokkur barst meestal om de paar minuten uit. Blijf op de paden: het water is extreem heet.']
  ],
  facts: ['IJsland heeft geen inheemse landreptielen.', 'Reykjavík betekent ongeveer “rookbaai”.', 'Het IJslandse parlement werd in 930 bij Þingvellir opgericht.', 'In februari zijn de dagen kort: perfect om de donkere hemel te bekijken.', 'Het woord “geiser” komt van de IJslandse naam Geysir.'],
  // Voeg afleveringen toe: { title: 'Aflevering 1', description: '...', src: 'audio/aflevering-1.mp3' }
  geo: {
    startDate: '2027-01-31',
    badge: 'GEO FUTURE ROUTE · ICELAND 2027',
    locations: [
      { id:'solheimajokull', routeName:'Sólheimajökull', name:'Sólheimajökull', latitude:63.532, longitude:-19.370, theme:'ice', label:'Gletsjers & klimaat', symbol:'🧊', fact:'Donkere strepen in het ijs kunnen bestaan uit vulkanische as en gesteente.', task:'Zoek vanaf het veilige pad naar sporen die het bewegende ijs in het landschap achterlaat.' },
      { id:'geysir', routeName:'Geysir', name:'Geysir & Strokkur', latitude:64.312, longitude:-20.301, theme:'heat', label:'Geothermie', symbol:'♨️', fact:'Het woord geiser is afgeleid van de naam Geysir.', task:'Observeer een uitbarsting van Strokkur vanaf het afgezette pad. Welke stappen zie je vóór de waterkolom?' },
      { id:'kerid', routeName:'Kerið', name:'Kerið', latitude:64.041, longitude:-20.885, theme:'lava', label:'Vulkanisme', symbol:'🌋', fact:'De rode kraterwanden danken hun kleur onder meer aan ijzerhoudend gesteente.', task:'Vergelijk de kleuren van de kraterwand, het water en de begroeiing. Welke processen zouden ze verklaren?' },
      { id:'thingvellir', routeName:'Silfra', name:'Þingvellir / Silfra', latitude:64.255, longitude:-21.124, theme:'tectonic', label:'Aardplaten & breuklijnen', symbol:'🗺️', fact:'Hier bewegen de Noord-Amerikaanse en Euraziatische plaat uit elkaar.', task:'Zoek vanaf het wandelpad naar scheuren en hoogteverschillen. Schets hoe twee platen uit elkaar bewegen.' },
      { id:'skogafoss', routeName:'Skógafoss', name:'Skógafoss', latitude:63.532, longitude:-19.511, theme:'water', label:'Water & erosie', symbol:'🌊', fact:'Skógafoss valt ongeveer 60 meter naar beneden.', task:'Kijk waar nevel ontstaat en waar water het gesteente raakt. Waar verwacht je de meeste erosie?' },
      { id:'reynisfjara', routeName:'Reynisfjara', name:'Reynisfjara', latitude:63.404, longitude:-19.044, theme:'nature', label:'Kust & vulkanisch landschap', symbol:'🌱', fact:'De basaltzuilen ontstonden toen lava afkoelde en kromp.', task:'Bekijk de vormen van de basaltzuilen vanaf veilige afstand. Blijf ruim uit de buurt van de zee.' }
    ]
  },
  photos: { enabled: false, entries: [], moderationRequired: true },
  push: { enabled: false, topics: ['Verzamelen en vertrek', 'Programmawijzigingen', 'Foto-opdrachten', 'Bus Battle', 'Aurora-alerts', 'Berichten van begeleiders'] },
  aurora: { location: 'Laugarvatn', latitude: 64.217, longitude: -20.733, officialURL: 'https://en.vedur.is/weather/forecasts/aurora/', kpURL: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', weatherURL: 'https://api.open-meteo.com/v1/forecast' },
  games: {
    quiz: [
      { question: 'Welk gesteente maakt het strand van Reynisfjara zwart?', options: ['Basalt', 'Krijt', 'Marmer'], answer: 0, explanation: 'Basalt ontstaat uit afgekoelde lava.' },
      { question: 'Welke twee aardplaten ontmoeten elkaar bij Þingvellir?', options: ['Afrikaanse en Pacifische', 'Noord-Amerikaanse en Euraziatische', 'Antarctische en Indische'], answer: 1, explanation: 'De Noord-Amerikaanse en Euraziatische plaat bewegen hier uit elkaar.' },
      { question: 'Waar komt geothermische warmte vandaan?', options: ['Van wind', 'Uit zeewater', 'Uit heet gesteente onder de grond'], answer: 2, explanation: 'Heet gesteente verwarmt grondwater.' },
      { question: 'Wat doe je bij Reynisfjara?', options: ['De golven opzoeken', 'Ruim afstand houden van zee', 'Op natte rotsen klimmen'], answer: 1, explanation: 'Sneaker waves kunnen plotseling ver het strand op komen.' },
      { question: 'Wat heb je nodig om noorderlicht goed te zien?', options: ['Een donkere, heldere hemel', 'Zon en wolken', 'Een volle maan'], answer: 0, explanation: 'Donkerte en weinig bewolking helpen, maar geven geen garantie.' }
    ],
    bingo: ['Waterval', 'Schaap', 'Paard', 'Zwart strand', 'Berg met sneeuw', 'Brug', 'IJslandse vlag', 'Lava', 'Kerk', 'Warme bron', 'Bus', 'Regenboog', 'Gletsjer', 'Vulkanisch gesteente', 'Zee', 'Wolk'],
    places: [{ clue: 'Ik ben een zwart strand met basaltzuilen. Mijn golven zijn gevaarlijk.', answer: 'Reynisfjara' }, { clue: 'Bij mij zie je aardplaten uit elkaar bewegen. Silfra ligt hier.', answer: 'Þingvellir' }, { clue: 'Mijn water spuit om de paar minuten omhoog.', answer: 'Strokkur' }, { clue: 'Ik ben een waterval van ongeveer 60 meter hoog aan de zuidkust.', answer: 'Skógafoss' }],
    words: ['Gletsjer', 'Noorderlicht', 'Geysir', 'Vulkaan', 'Laugarvatn', 'Waterval', 'Basalt', 'Reykjavík', 'Aardplaat', 'Thermokleding', 'Secret Lagoon', 'Zwart strand', 'Lunchpakket', 'Powerbank', 'Schiphol'],
    challenges: ['Bedenk met je buur drie verschillen tussen IJsland en Nederland.', 'Maak samen een mini-verhaal met de woorden lava, ijs en rugzak.', 'Leg in één minuut uit hoe een geiser werkt.', 'Spot drie verschillende soorten landschap vanuit je busstoel.']
  },
  episodes: []
};
