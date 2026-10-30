// Maskottchen "Bross-Bot": winkt im Startbereich, begleitet beim Scrollen (Desktop) und kommentiert,
// was gerade zu sehen ist. Ohne Bibliotheken, ohne Daten an Dritte. Bei "weniger Bewegung" bleibt er ruhig.
(function () {
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var blase = document.getElementById("blase");
  var roboter = document.getElementById("roboter");
  if (!roboter) return;

  // Begleiter = Kopie des Roboters unten rechts
  var begleiter = document.createElement("div");
  begleiter.className = "begleiter";
  begleiter.setAttribute("aria-hidden", "true");
  var bBlase = document.createElement("div");
  bBlase.className = "blase";
  begleiter.appendChild(bBlase);
  begleiter.appendChild(roboter.cloneNode(true));
  begleiter.querySelector("svg").removeAttribute("id");
  document.body.appendChild(begleiter);

  function sagen(el, text) {
    if (!text || el.textContent === text) return;
    if (ruhig) { el.textContent = text; return; }
    el.classList.add("wechsel");
    setTimeout(function () { el.textContent = text; el.classList.remove("wechsel"); }, 200);
  }

  // Kopf neigt sich leicht mit der Scrollrichtung
  var letzte = window.scrollY, kopfe = document.querySelectorAll(".kopf-gruppe"), neigung = 0, ziel = 0;
  function rahmen() {
    neigung += (ziel - neigung) * 0.12;
    ziel *= 0.9;
    kopfe.forEach(function (k) { k.style.transform = "rotate(" + neigung.toFixed(2) + "deg)"; });
    requestAnimationFrame(rahmen);
  }
  if (!ruhig) requestAnimationFrame(rahmen);

  var start = document.querySelector(".start");
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    ziel = Math.max(-8, Math.min(8, (y - letzte) * 0.6));
    letzte = y;
    var unterStart = start.getBoundingClientRect().bottom < 80;
    begleiter.classList.toggle("sichtbar", unterStart);
  }, { passive: true });

  // Sprechblase passt sich dem Abschnitt an, der gerade in der Mitte des Bildschirms ist
  var stellen = document.querySelectorAll("[data-satz]");
  var chat = document.querySelector(".chat");
  if ("IntersectionObserver" in window) {
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        sagen(bBlase, e.target.getAttribute("data-satz"));
        if (e.target === chat) zeigeChat();
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    stellen.forEach(function (s) { beobachter.observe(s); });
  } else if (chat) { chat.classList.add("sichtbar"); }

  // Chat-Blasen erscheinen nacheinander
  var gezeigt = false;
  function zeigeChat() {
    if (gezeigt || !chat) return;
    gezeigt = true;
    var blasen = chat.querySelectorAll(".sprech");
    blasen.forEach(function (b, i) { b.style.transitionDelay = (ruhig ? 0 : i * 0.35) + "s"; });
    chat.classList.add("sichtbar");
  }
  if (chat && chat.getBoundingClientRect().top < window.innerHeight) zeigeChat();

  // Startbereich: Sprüche wechseln
  var sprueche = [
    "Hallo! Ich nehme ab, wenn Sie gerade nicht können.",
    "Ich arbeite auch nachts und am Wochenende.",
    "Notfall? Ich melde ihn sofort.",
    "Rufen Sie mich an: 07631 9054989",
  ];
  var i = 0;
  if (blase && !ruhig) setInterval(function () { i = (i + 1) % sprueche.length; sagen(blase, sprueche[i]); }, 4200);
})();
