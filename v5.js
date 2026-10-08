// V5 is a presentation of the existing pages and EXPEDITION data, not a second app.
function dashboardIcon(name) {
  const paths={
    home:'M3 10 12 3l9 7v11h-6v-7H9v7H3z',
    programma:'M5 5h14v16H5zM8 2v6m8-6v6M5 10h14m-11 4h2m4 0h2m-8 4h2',
    kaart:'M12 22s8-8 8-14a8 8 0 0 0-16 0c0 6 8 14 8 14zM12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    paklijst:'M7 7h10l3 15H4zM9 8V5a3 3 0 0 1 6 0v3m-6 5h6',
    praktisch:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 11v6m0-10v1',
    profiel:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 22v-3a8 8 0 0 1 16 0v3',
    podcast:'M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v8H3zm14 0h4v8h-4z',
    meer:'M5 11h2v2H5zm6 0h2v2h-2zm6 0h2v2h-2z'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]||paths.meer}"/></svg>`;
}
function dashboardHome() {
  const cards=[
    ['programma','Programma','Dag tot dag overzicht van onze reis'],
    ['kaart','Locaties','Alle routes en stops van onze expeditie'],
    ['paklijst','Paklijst','Vink af wat al in je tas zit'],
    ['praktisch','Praktische info','Belangrijke regels en afspraken'],
    ['profiel','Mijn expeditie','Jouw naam, klas en bus'],
    ['podcast','Podcast','Verhalen van onze expeditie']
  ];
  const featured=D.days[1];
  return `<section class="hero dashboard-hero"><div class="hero-logo-slot">${schoolLogoMarkup('hero-logo')}</div><div class="hero-content"><div class="hero-heading"><div class="dashboard-title"><h1>Expeditie<br><em>IJsland</em></h1><span class="dashboard-school">${e(D.school)}</span></div><img class="hero-island hero-topography" src="assets/iceland-topography.png" alt="Geografisch correcte IJslandkaart met bergreliëf en gletsjers" width="1040" height="660"></div><div class="dashboard-hero-details"><div class="hero-meta"><span>${D.days.length} dagen · ${D.travelers} reizigers</span><span>${e(D.dates)}</span></div><p>Vuur onder je voeten. Noorderlicht boven je hoofd.<br>Vijf dagen IJsland die je niet vergeet.</p><a class="button" href="#programma">Ontdek het programma <span>→</span></a></div></div></section>
    <div class="dashboard-cards">${cards.map(([page,title,description])=>`<a class="dashboard-card" href="#${page}">${dashboardIcon(page)}<strong>${title}</strong><p>${description}</p><span class="dashboard-arrow" aria-hidden="true">→</span></a>`).join('')}</div>
    <section class="dashboard-intro"><div><h2>Welkom bij Expeditie IJsland!</h2><p>Hier vind je het programma, de reislocaties, je paklijst en praktische informatie voor onze expeditie.</p>${profileGreeting()}<a class="dashboard-more" href="#meer">Ontdek alle functies →</a></div><a class="dashboard-feature" href="#dag-2"><img src="assets/v5-ice-landscape.webp" alt="IJslandlandschap uit de ontwerpreferentie" width="273" height="172"><div><span class="eyebrow">${e(featured.date)}</span><h2>Dag 2 — ${e(featured.title)}</h2><p>${e(featured.theme)}</p><span>${e(featured.route.slice(1,-1).map(stop=>D.routeLocations[stop]?.name||stop.replace(', Iceland','')).join(' · '))}</span></div><span class="dashboard-arrow" aria-hidden="true">→</span></a></section>
    <a class="dashboard-aurora" href="#aurora">🌌 Aurora Watch · ${e(D.aurora.location)} <span>Bekijk actuele bronnen →</span></a>
    <div class="dashboard-wave" aria-hidden="true"><svg viewBox="0 0 1440 110" preserveAspectRatio="none"><path d="M0 55Q190-15 420 45T870 55T1440 45V110H0Z" fill="#be72b9"/><path d="M0 75Q190 0 420 65T870 75T1440 55V110H0Z" fill="#e6c4e2"/><path d="M0 110Q180 85 420 105T880 75T1440 80V110Z" fill="#951b81"/></svg></div>`;
}
