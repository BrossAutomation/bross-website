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

  // Handy: Anruf kommt rein, KI nimmt ab, daraus wird ein neuer Auftrag
  var liste = document.getElementById("auftraege");
  var anruf = document.getElementById("anruf");
  var anrufText = document.getElementById("anruf-text");
  if (!liste || !anruf || ruhig) return;

  var beispiele = [
    ["normal", "Neu", "Licht im Flur flackert", "Wagner · Badenweiler"],
    ["angebot", "Angebot", "Badsanierung, Termin für Besichtigung", "Fischer · Schliengen"],
    ["notfall", "Notfall", "Wasser tropft aus der Decke", "Huber · Neuenburg"],
    ["normal", "Neu", "Heizung wird nicht mehr warm", "Becker · Müllheim"],
    ["angebot", "Angebot", "Photovoltaik fürs Dach", "Schmid · Auggen"],
    ["normal", "Neu", "Rollladen klemmt im Wohnzimmer", "Weber · Bad Bellingen"],
  ];
  var n = 0;

  function karte(b) {
    var d = document.createElement("div");
    d.className = "auftrag rein";
    d.innerHTML = '<span class="marke-klein ' + b[0] + '">' + b[1] + "</span><b>" + b[2] + "</b><small>" + b[3] + " · gerade eben</small>";
    return d;
  }

  function runde() {
    var b = beispiele[n++ % beispiele.length];
    anrufText.textContent = "Anruf · KI-Assistentin nimmt ab …";
    anruf.classList.add("an");
    setTimeout(function () { anrufText.textContent = "Fragt Name, Adresse, Anliegen ab …"; }, 1600);
    setTimeout(function () {
      anruf.classList.remove("an");
      var neu = karte(b);
      liste.insertBefore(neu, liste.firstChild);
      liste.querySelectorAll(".frisch").forEach(function (k) { k.classList.remove("frisch"); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { neu.classList.remove("rein"); neu.classList.add("frisch"); }); });
      var alle = liste.querySelectorAll(".auftrag");
      if (alle.length > 4) alle[alle.length - 1].remove();
    }, 3400);
  }
  setTimeout(function () { runde(); setInterval(runde, 6500); }, 1200);
})();
