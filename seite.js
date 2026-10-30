// Startseite: Handy zeigt eintreffende Aufträge, Beispielgespräch baut sich beim Hinscrollen auf.
// Ohne Bibliotheken, ohne Daten an Dritte. Bei "weniger Bewegung" bleibt alles ruhig.
(function () {
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Chat-Blasen erscheinen nacheinander
  var chat = document.querySelector(".chat");
  function zeigeChat() {
    chat.querySelectorAll(".sprech").forEach(function (b, i) { b.style.transitionDelay = (ruhig ? 0 : i * 0.35) + "s"; });
    chat.classList.add("sichtbar");
  }
  if (chat) {
    if (!("IntersectionObserver" in window)) zeigeChat();
    else new IntersectionObserver(function (e, b) {
      if (e[0].isIntersecting) { zeigeChat(); b.disconnect(); }
    }, { rootMargin: "0px 0px -25% 0px" }).observe(chat);
  }

  // Ablauf: Der Schritt in der Bildschirmmitte bestimmt, was das stehende Handy zeigt
  var schritte = document.querySelectorAll(".schritt");
  var ebenen = document.querySelectorAll(".ablauf .ebene");
  var gsZeit = document.querySelector(".gs-zeit"), uhr = null;
  function zeigeSchritt(n) {
    schritte.forEach(function (s, i) { s.classList.toggle("an", i === n); });
    ebenen.forEach(function (e, i) { e.classList.toggle("an", i === n); });
    clearInterval(uhr);
    if (n === 1 && gsZeit) {
      var t = 0; gsZeit.textContent = "0:00";
      uhr = setInterval(function () { t++; gsZeit.textContent = Math.floor(t / 60) + ":" + ("0" + (t % 60)).slice(-2); }, 1000);
    }
  }
  if (schritte.length && "IntersectionObserver" in window) {
    var schmal = window.matchMedia("(max-width: 860px)").matches;
    var sb = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { if (e.isIntersecting) zeigeSchritt(+e.target.getAttribute("data-schritt")); });
    }, { rootMargin: schmal ? "-22% 0px -77% 0px" : "-48% 0px -51% 0px" });
    schritte.forEach(function (s) { sb.observe(s); });
  }

  // Inhalte gleiten beim Scrollen sanft ins Bild
  if (!ruhig && "IntersectionObserver" in window) {
    var teile = document.querySelectorAll("section h2, section .unterzeile, .variante, .beispiel-raster > div, .liste li, .kontakt .knoepfe");
    var eb = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("da"); eb.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    teile.forEach(function (t, i) {
      var geschwister = t.parentNode ? Array.prototype.indexOf.call(t.parentNode.children, t) : 0;
      t.style.transitionDelay = Math.min(geschwister, 5) * 70 + "ms";
      t.classList.add("einblenden");
      eb.observe(t);
    });
  }

  // Handy oben kippt leicht mit der Maus (nur mit Maus, nicht auf dem Handy)
  var startHandy = document.querySelector(".start .handy");
  if (startHandy && !ruhig && window.matchMedia("(hover: hover) and (min-width: 861px)").matches) {
    document.querySelector(".start").addEventListener("pointermove", function (e) {
      var r = startHandy.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      var y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      startHandy.style.setProperty("--ry", (x * 16).toFixed(2) + "deg");
      startHandy.style.setProperty("--rx", (-y * 12).toFixed(2) + "deg");
    });
    document.querySelector(".start").addEventListener("pointerleave", function () {
      startHandy.style.setProperty("--ry", "0deg"); startHandy.style.setProperty("--rx", "0deg");
    });
  }

  // Handy (Nachbau der App): Mitteilung "Neuer Auftrag", dann rutscht die Karte oben in die Liste
  var liste = document.getElementById("auftraege");
  var mitteilung = document.getElementById("mitteilung");
  var anzahl = document.getElementById("anzahl");
  if (!liste || !mitteilung || ruhig) return;
  var telefon = liste.querySelector(".rr svg").outerHTML;
  var warn = liste.querySelector(".mk.notfall svg").outerHTML;

  // [Dringlichkeit, Name, Anliegen, Adresse, Kategorie]
  var beispiele = [
    ["", "Petra Hofmann", "Im Bad flackert das Licht, seit gestern auch der Spiegelschrank.", "Schulstraße 12, 79410 Badenweiler", "Beleuchtung"],
    ["dringend", "Markus Becker", "Die Heizungspumpe läuft nicht mehr an, im Haus wird es kalt.", "Am Rain 5, 79379 Müllheim", "Heizung"],
    ["notfall", "Familie Weber", "Brandgeruch am Sicherungskasten, eine Sicherung ist heiß.", "Kirchweg 2, 79415 Bad Bellingen", "Sicherung/Elektrik"],
    ["pruefen", "Herr Schmid", "Drei Steckdosen im Wohnzimmer ohne Funktion, möchte einen Termin.", "Weinstraße, 79423 Heitersheim · Hausnummer fehlt", "Steckdose"],
    ["", "Julia Fischer", "Möchte ein Angebot für eine Photovoltaikanlage auf dem Garagendach.", "Mühlenweg 9, 79418 Schliengen", "Photovoltaik"],
  ];
  var marken = { notfall: warn + "NOTFALL", dringend: "DRINGEND", pruefen: "ANGABEN PRÜFEN" };
  var n = 0, zahl = 3;

  function karte(b) {
    var d = document.createElement("div");
    d.className = "ak rein" + (b[0] === "notfall" ? " notfall" : "");
    d.innerHTML = '<div class="ak-oben">' + (b[0] ? '<span class="mk ' + b[0] + '">' + marken[b[0]] + "</span>" : "<span></span>") +
      '<span class="zeit">gerade eben</span></div><div class="name">' + b[1] + '</div><div class="anliegen">' + b[2] +
      '</div><div class="adresse">' + b[3] + '</div><div class="ak-unten"><span class="kat">' + b[4] +
      '</span><span class="rr">' + telefon + " Zurückrufen</span></div>";
    return d;
  }

  function runde() {
    var b = beispiele[n++ % beispiele.length];
    document.getElementById("mt-titel").textContent = (b[0] === "notfall" ? "NOTFALL: " : "Neuer Auftrag: ") + b[1];
    document.getElementById("mt-text").textContent = b[2];
    mitteilung.classList.add("an");
    setTimeout(function () {
      mitteilung.classList.remove("an");
      var neu = karte(b);
      liste.querySelectorAll(".frisch").forEach(function (k) { k.classList.remove("frisch"); });
      liste.insertBefore(neu, liste.firstChild);
      anzahl.textContent = ++zahl;
      requestAnimationFrame(function () { requestAnimationFrame(function () { neu.classList.remove("rein"); neu.classList.add("frisch"); }); });
      var alle = liste.querySelectorAll(".ak");
      if (alle.length > 5) alle[alle.length - 1].remove();
    }, 2600);
  }
  setTimeout(function () { runde(); setInterval(runde, 6500); }, 1500);
})();
