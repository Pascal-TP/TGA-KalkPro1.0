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
// Seite 40: Kostenvoranschlag
    if (id === "page-40") {
        loadPage40();
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
    showPage("page-3");
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

// Alle Zwischensummen aller Preis-Seiten speichern
let angebotSummen = JSON.parse(localStorage.getItem("angebotSummen") || "{}");

function saveSeitenSumme(seitenId, summe) {
    angebotSummen[seitenId] = summe;
    localStorage.setItem("angebotSummen", JSON.stringify(angebotSummen));
}

function getGesamtAngebotssumme() {
    let total = 0;
    for (let key in angebotSummen) {
        total += parseFloat(angebotSummen[key]) || 0;
    }
    return total;
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

    document.querySelectorAll("#page-14 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    // Zwischensumme für Seite 14 speichern
    saveSeitenSumme("page-14", sum);

    // Gesamtsumme über alle Seiten
    const gesamtDiv = document.getElementById("gesamtSumme14");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " + getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
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
          const savedValue = localStorage.getItem("page143Data" + index) || "0";

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

  localStorage.setItem("page143Data" + index, input.value);

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

    // Zwischensumme für Seite 14.3 speichern
    saveSeitenSumme("page-14-3", sum);

    // Gesamtsumme über alle Seiten
    const gesamtDiv = document.getElementById("gesamtSumme143");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " + getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}


async function loadPage40() {

    const container = document.getElementById("summary-content");
    const hinweiseContainer = document.getElementById("hinweise-content");

    container.innerHTML = "";
    hinweiseContainer.innerHTML = "";

    let gesamt = 0;

    const seitenConfig = [
        { key: "page14Data", csv: "ndf1.csv" },
        { key: "page142Data", csv: "ndf2.csv" },
        { key: "page143Data", csv: "ndf3.csv" }
    ];

    for (const seite of seitenConfig) {

        const data = JSON.parse(localStorage.getItem(seite.key) || "{}");

        const response = await fetch(seite.csv);
        const csvText = await response.text();
        const lines = csvText.split("\n").slice(1);

        lines.forEach((line, index) => {

            if (!line.trim()) return;

            const cols = line.split(";");
            const colA = cols[0]?.trim();
            const colB = cols[1]?.trim();
            const colC = cols[2]?.trim();
            const colD = cols[3]?.trim();

            const menge = parseFloat(data[index] || 0);
            const preis = parseFloat(colD?.replace(",", ".") || 0);

            if (
                colA !== "Titel" &&
                colA !== "Untertitel" &&
                colA !== "Zwischentitel" &&
                menge > 0
            ) {

                const zeile = document.createElement("div");
                zeile.className = "row summary-row";
                zeile.innerHTML = `
                    <div class="col-a">${colA}</div>
                    <div class="col-b">${colB}</div>
                    <div class="col-c">${colC}</div>
                    <div class="col-d">${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                    <div class="col-e">${(menge * preis).toLocaleString("de-DE",{minimumFractionDigits:2})} €</div>
                `;

                container.appendChild(zeile);
                gesamt += menge * preis;
            }
        });
    }

    document.getElementById("angebotspreis").innerText =
        "Angebotspreis: " +
        gesamt.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    // Hinweise laden
    const hinweisRes = await fetch("ndf4.csv");
    const hinweisText = await hinweisRes.text();
    const lines = hinweisText.split("\n").slice(1);

    let html = "";

    lines.forEach(line => {
        if (!line.trim()) return;

        const cols = line.split(";");
        const colA = cols[0]?.trim();
        const colB = cols[1]?.trim();

        if (colA === "Titel") html += `<div class="title">${colB}</div>`;
        else if (colA === "Untertitel") html += `<div class="subtitle">${colB}</div>`;
        else if (colA === "Zwischentitel") html += `<div class="midtitle">${colB}</div>`;
        else html += `<div class="hinweis-row">${colB}</div>`;
    });

    hinweiseContainer.innerHTML = html;
}
function direktZumAngebot() {
    const fields = [
        "pj-contact", "pj-number", "shk-name", "shk-contact",
        "shk-email", "shk-phone", "site-address", "execution-date"
    ];

    const alleAusgefüllt = fields.every(id => {
        const val = document.getElementById(id)?.value?.trim();
        return val && val.length > 0;
    });

    if (alleAusgefüllt) {
        showPage("page-40"); // Seite Kostenvoranschlag
    } else {
        showPage("page-41"); // Seite Hinweis, dass Eingaben fehlen
    }
}


function printPage40() {
    const printContents = document.getElementById("page-40").cloneNode(true);
    // Buttons entfernen
    printContents.querySelectorAll("button").forEach(b => b.remove());

    const w = window.open("", "PRINT", "height=600,width=800");
    w.document.write("<html><head><title>Kostenvoranschlag</title>");
    w.document.write('<link rel="stylesheet" href="style.css">');
    w.document.write("</head><body>");
    w.document.write(printContents.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    w.print();
    w.close();
}

function sendMailPage40() {
    const subject = `Schon Kostenvoranschlag NDF - ${new Date().toLocaleDateString("de-DE")}`;
    const body = encodeURIComponent(document.getElementById("page-40").innerText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function clearInputs() {
    // Alle Eingaben löschen
    localStorage.removeItem("page14Data");
    localStorage.removeItem("page142Data");
    localStorage.removeItem("page143Data");
    localStorage.removeItem("angebotSummen");
    // Zurück zu Seite 3
    showPage("page-3");
}

document.body.addEventListener("mousemove", () => remaining = 600);
document.body.addEventListener("keydown", () => remaining = 600);


