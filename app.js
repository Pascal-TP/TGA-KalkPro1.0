let users = {};
let currentUser = null;
let logoutTimer;
let remaining = 600;

// CSV laden
fetch("users.csv")
  .then(r => r.text())
  .then(text => {
    let lines = text.split("\n").slice(1);
    lines.forEach(l => {
        let [u,p] = l.trim().split(";");
        if (u) users[u] = p;
    });

    // Passwort-Overrides (Simulation)
    let saved = JSON.parse(localStorage.getItem("pwOverrides") || "{}");
    Object.assign(users, saved);
  });

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    if (id === "page-14") {
        loadPage14();
    }
if (id === "page-14-3") {
        loadPage143();
    }
}

function login() {
    let u = loginUser.value.trim();
    let p = loginPass.value;

    if (!u || !p) {
        loginError.innerText = "Bitte Nutzername und Passwort eingeben.";
        return;
    }

    if (!users[u] || users[u] !== p) {
        loginError.innerText = "Nutzername oder Passwort falsch.";
        return;
    }

    currentUser = u;
    startTimer();
    showPage("page-select");
}

function forgotPassword() {
    let u = loginUser.value.trim();
    if (!u) {
        loginError.innerText = "Nutzername bitte eingeben.";
        return;
    }
    window.location.href =
      "mailto:info@ndf-gmbh.de?subject=Passwort zurücksetzen&body=Bitte Passwort zurücksetzen für Nutzer: " + u;
}

function goToChange() {
    if (!loginUser.value.trim()) {
        loginError.innerText = "Nutzername bitte eingeben.";
        return;
    }
    currentUser = loginUser.value.trim();
    showPage("page-change");
}

function savePassword() {
    let oldP = oldPass.value;
    let n1 = newPass1.value;
    let n2 = newPass2.value;

    if (!oldP || !n1 || !n2) {
        changeError.innerText = "Bitte alle Felder ausfüllen.";
        return;
    }

    if (users[currentUser] !== oldP) {
        changeError.innerText = "Altes Passwort falsch.";
        return;
    }

    if (n1 !== n2) {
        changeError.innerText = "Neue Passwörter stimmen nicht überein.";
        return;
    }

    users[currentUser] = n1;
    let store = JSON.parse(localStorage.getItem("pwOverrides") || "{}");
    store[currentUser] = n1;
    localStorage.setItem("pwOverrides", JSON.stringify(store));

    alert("Passwort geändert.");
    showPage("page-login");
}

function startTimer() {
    remaining = 600;
    clearInterval(logoutTimer);
    logoutTimer = setInterval(() => {
        remaining--;
        let m = Math.floor(remaining / 60);
        let s = remaining % 60;
        timer.innerText = `Logout in: ${m}:${s.toString().padStart(2,"0")}`;
        if (remaining <= 0) {
            alert("Automatisch ausgeloggt.");
            location.reload();
        }
    }, 1000);
}

// Funktion zur Prüfung der Pflichteingaben auf Seite 5
function submitPage5() {
    const fields = [
        {id: "pj-contact", name: "Ansprechpartner bei PJ"},
        {id: "pj-number", name: "SHK – PJ-Kunden-Nr."},
        {id: "shk-name", name: "SHK Name/Firma"},
        {id: "shk-contact", name: "SHK Ansprechpartner"},
        {id: "shk-email", name: "SHK E-Mail"},
        {id: "shk-phone", name: "SHK Telefon-Nr."},
        {id: "site-address", name: "Adresse Baustelle"},
        {id: "execution-date", name: "Gewünschter Ausführungstermin"}
    ];

    let missing = [];

    fields.forEach(f => {
        const val = document.getElementById(f.id).value.trim();
        if (!val) missing.push(f.name);
    });

    const errorDiv = document.getElementById("page5-error");

    if (missing.length > 0) {
        errorDiv.innerText = "Bitte folgende Felder ausfüllen:\n" + missing.join(", ");
        return;
    }

    errorDiv.innerText = "";

    // Daten können hier gespeichert oder weitergeleitet werden
    // z.B. localStorage, JSON-Objekt oder später für PDF/Email

    alert("Daten gespeichert! Weiter zu Seite 6 oder KV-Berechnung.");
    // Beispiel: Weiterleitung auf Seite 6
    // showPage("page-6");
}
/* ===================================
   SEITE 14 – CSV LADEN + SPEICHERN
=================================== */

let page14Loaded = false;

function loadPage14() {

    if (page14Loaded) return; // nicht doppelt laden
    page14Loaded = true;

    fetch("ndf1.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            const container = document.getElementById("page14-content");

            let html = "";
            let gespeicherteWerte = JSON.parse(localStorage.getItem("page14Data") || "{}");

            lines.forEach((line, index) => {

                if (!line.trim()) return;

                const cols = line.split(";");
                const colA = cols[0]?.trim();
                const colB = cols[1]?.trim();
                const colC = cols[2]?.trim();
                const colD = cols[3]?.trim();

                if (colA === "Titel") {
                    html += `<div class="title">${colB}</div>`;
                    return;
                }
                if (colA === "Untertitel") {
                    html += `<div class="subtitle">${colB}</div>`;
                    return;
                }
                if (colA === "Zwischentitel") {
                    html += `<div class="midtitle">${colB}</div>`;
                    return;
                }

                const preisVorhanden = colD && !isNaN(parseFloat(colD.replace(",", ".")));

                if (preisVorhanden) {

                    const preis = parseFloat(colD.replace(",", "."));
                    const gespeicherteMenge = gespeicherteWerte[index] || 0;

                    html += `
                    <div class="row">
                        <div class="col-a">${colA}</div>
                        <div class="col-b">${colB}</div>
                        <div class="col-c">${colC}</div>
                        <input class="menge-input" 
                               type="number" min="0" step="any"
                               value="${gespeicherteMenge}"
                               oninput="calcRowPage14(this,${preis},${index})">
                        <div class="col-d">${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                        <div class="col-e">0,00 €</div>
                    </div>`;
                } else {

                    html += `
                    <div class="row no-price">
                        <div class="col-a">${colA}</div>
                        <div class="col-b" style="grid-column: 2 / 7;">${colB}</div>
                    </div>`;
                }
            });

            html += `<div id="gesamtSumme14" class="gesamt">Gesamtsumme: 0,00 €</div>`;

            container.innerHTML = html;

            berechneGesamt14();
        });
}

function calcRowPage14(input, preisWert, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const wert = menge * preisWert;

    ergebnis.innerText =
        wert.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page14Data") || "{}");

    gespeicherteWerte[index] = menge;

    localStorage.setItem("page14Data",
        JSON.stringify(gespeicherteWerte));

    berechneGesamt14();
}

function berechneGesamt14() {

    let sum = 0;

    document.querySelectorAll("#page-14 .col-e")
        .forEach(el => {

            const wert =
                parseFloat(
                    el.innerText
                        .replace("€","")
                        .replace(".","")
                        .replace(",",".")
                        .trim()
                ) || 0;

            sum += wert;
        });

    const gesamtDiv =
        document.getElementById("gesamtSumme14");

    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme: " +
            sum.toLocaleString("de-DE",
                {minimumFractionDigits:2}) + " €";
    }
}
// -----------------------------
// SEITE 14.3 – ROTH (ndf3.csv)
// -----------------------------
function loadPage143() {

  const container = document.getElementById("content-14-3");
  if (!container) return;

  // Falls schon geladen → nicht nochmal laden
  if (container.innerHTML.trim() !== "") return;

  fetch("ndf3.csv")
    .then(response => response.text())
    .then(data => {

      const lines = data.split("\n").slice(1);
      let html = "";

      lines.forEach((line, index) => {
        if (!line.trim()) return;

        const cols = line.split(";");
        const colA = cols[0]?.trim();
        const colB = cols[1]?.trim();
        const colC = cols[2]?.trim();
        const colD = cols[3]?.trim();

        // TITEL / UNTERTITEL / ZWISCHENTITEL
        if (colA === "Titel") {
          html += `<div class="title">${colB}</div>`;
          return;
        }
        if (colA === "Untertitel") {
          html += `<div class="subtitle">${colB}</div>`;
          return;
        }
        if (colA === "Zwischentitel") {
          html += `<div class="midtitle">${colB}</div>`;
          return;
        }

        const preisVorhanden = colD && !isNaN(parseFloat(colD.replace(",", ".")));

        if (preisVorhanden) {

          const preis = parseFloat(colD.replace(",", "."));
          const savedValue = localStorage.getItem("page143_" + index) || "0";

          html += `<div class="row">
                      <div class="col-a">${colA}</div>
                      <div class="col-b">${colB}</div>
                      <div class="col-c">${colC}</div>

                      <input class="menge-input" type="number" min="0" step="any"
                             value="${savedValue}"
                             oninput="calcRow143(this, ${preis}, ${index})">

                      <div class="col-d">
                        ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                      </div>

                      <div class="col-e">0,00 €</div>
                   </div>`;
        } else {

          html += `<div class="row no-price">
                      <div class="col-a">${colA}</div>
                      <div class="col-b" style="grid-column: 2 / 7;">${colB}</div>
                   </div>`;
        }
      });

      html += `<div id="gesamtSumme143" class="gesamt">
                Gesamtsumme: 0,00 €
               </div>`;

      html += `<div class="button-bar">
                <button onclick="showPage('page-14-1')">Zurück</button>
                <button onclick="showPage('page-18')">Weiter</button>
                <button onclick="showPage('page-40')">Direkt zum Angebot</button>
               </div>`;

      container.innerHTML = html;

      berechneGesamt143();
    });
}


// Berechnung einzelner Zeilen
function calcRow143(input, preisWert, index) {

  const row = input.parentElement;
  const ergebnis = row.querySelector(".col-e");

  const menge = parseFloat(input.value.replace(",", ".")) || 0;

  const sum = menge * preisWert;

  ergebnis.innerText =
    sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

  localStorage.setItem("page143_" + index, input.value);

  berechneGesamt143();
}


// Gesamtsumme
function berechneGesamt143() {

  let sum = 0;

  document.querySelectorAll("#page-14-3 .col-e").forEach(el => {

    const wert = parseFloat(
      el.innerText.replace("€","")
                 .replace(/\./g,"")
                 .replace(",",".")
                 .trim()
    ) || 0;

    sum += wert;
  });

  const gesamtDiv = document.getElementById("gesamtSumme143");

  if (gesamtDiv) {
    gesamtDiv.innerText =
      "Gesamtsumme: " +
      sum.toLocaleString("de-DE",{minimumFractionDigits:2}) +
      " €";
  }
}

document.body.addEventListener("mousemove", () => remaining = 600);
document.body.addEventListener("keydown", () => remaining = 600);


