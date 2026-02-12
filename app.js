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
    if (id === "page-40") {
        loadPage40();
    }
    if (id === "page-14-2") {
        loadPage142();
    }
    if (id === "page-8") {
        loadPage8();
    }
    if (id === "page-18") {
        loadPage18();
    }
    if (id === "page-20") {
        loadPage20();
    }
    if (id === "page-21") {
        loadPage21();
    }
    if (id === "page-22") {
        loadPage22();
    }
    if (id === "page-9") {
        loadPage9();
    }
    if (id === "page-10") {
        loadPage10();
    }
    if (id === "page-23") {
        loadPage23();
    }
    if (id === "page-24") {
        loadPage24();
    }
    if (id === "page-25") {
        loadPage25();
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

    savePage5Data();
    
    showPage("page-4");
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

 let gespeicherteWerte =
    JSON.parse(localStorage.getItem("page143Data") || "{}");

gespeicherteWerte[index] = menge;

localStorage.setItem("page143Data",
    JSON.stringify(gespeicherteWerte));


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

function savePage5Data() {
    const ids = [
        "pj-contact", "pj-number", "shk-name", "shk-contact",
        "shk-email", "shk-phone", "site-address", "execution-date"
    ];

    const obj = {};
    ids.forEach(id => obj[id] = (document.getElementById(id)?.value || "").trim());

    localStorage.setItem("page5Data", JSON.stringify(obj));
}

async function loadPage40() {

    const angebotTyp = localStorage.getItem("angebotTyp") || "kv";
    const titleEl = document.getElementById("page40-title");
    if (titleEl) {
        titleEl.innerText = (angebotTyp === "anfrage") ? "Anfrage" : "Kostenvoranschlag";
    }

// Anfrage-Daten anzeigen (nur wenn angebotTyp === "anfrage")
const anfrageBox = document.getElementById("anfrage-daten");
const anfrageContent = document.getElementById("anfrage-daten-content");

if (angebotTyp === "anfrage") {
    const p5 = JSON.parse(localStorage.getItem("page5Data") || "{}");

    const labels = {
        "pj-contact": "Ansprechpartner bei PJ",
        "pj-number": "SHK – PJ-Kunden-Nr.",
        "shk-name": "SHK Name/Firma",
        "shk-contact": "SHK Ansprechpartner",
        "shk-email": "SHK E-Mail",
        "shk-phone": "SHK Telefon-Nr.",
        "site-address": "Adresse Baustelle",
        "execution-date": "Gewünschter Ausführungstermin"
    };

    let html = "";
    Object.keys(labels).forEach(id => {
        const val = (p5[id] || "").trim();
        if (val) {
            html += `<div style="margin:6px 0;"><strong>${labels[id]}:</strong> ${val}</div>`;
        }
    });

    if (anfrageBox && anfrageContent) {
        anfrageContent.innerHTML = html || "<div>Keine Anfrage-Daten vorhanden.</div>";
        anfrageBox.style.display = "block";
    }
} else {
    if (anfrageBox) anfrageBox.style.display = "none";
}

    const container = document.getElementById("summary-content");
    const hinweiseContainer = document.getElementById("hinweise-content");
    if (!container || !hinweiseContainer) return;

    container.innerHTML = "";
    hinweiseContainer.innerHTML = "";

    let gesamt = 0;

    const seitenConfig = [
        { key: "page14Data",  csv: "ndf1.csv" },
        { key: "page142Data", csv: "ndf5.csv" },
        { key: "page8Data", csv: "ndf6.csv" },
        { key: "page18Data", csv: "ndf7.csv" },
        { key: "page20Data", csv: "ndf8.csv" },
        { key: "page21Data", csv: "ndf9.csv" },
        { key: "page22Data", csv: "ndf10.csv" },
        { key: "page9Data", csv: "ndf11.csv" },
        { key: "page10Data", csv: "ndf2.csv" },
        { key: "page23Data", csv: "ndf12.csv" },
        { key: "page24Data", csv: "ndf13.csv" },
        { key: "page25Data", csv: "ndf14.csv" },
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

    const angebotspreisEl = document.getElementById("angebotspreis");
    if (angebotspreisEl) {
        angebotspreisEl.innerText =
            "Angebotspreis: " + gesamt.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }

    // Hinweise laden (ndf4.csv)
    try {
        const hinweisRes = await fetch("ndf4.csv");
        const hinweisText = await hinweisRes.text();
        const hinweisLines = hinweisText.split("\n").slice(1);

        let html = "";
        hinweisLines.forEach(line => {
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

    } catch (e) {
        console.error("Fehler beim Laden der Hinweise (ndf4.csv):", e);
    }
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
        savePage5Data();
        localStorage.setItem("angebotTyp", "anfrage");
        showPage("page-40");
    } else {
        localStorage.setItem("angebotTyp", "kv");
        showPage("page-41");
    }
}

function printPage40() {

    const original = document.getElementById("page-40").cloneNode(true);

    // Buttons entfernen
    original.querySelectorAll("button").forEach(b => b.remove());

    // Logo hinzufügen (falls es global oben liegt)
    const logo = document.querySelector(".logo");
    const logoHTML = logo ? logo.outerHTML : "";

    const w = window.open("", "PRINT", "height=800,width=1000");

    w.document.write(`
        <html>
        <head>
            <title>Kostenvoranschlag</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
            ${logoHTML}
            ${original.innerHTML}
        </body>
        </html>
    `);

    w.document.close();
    w.focus();
    w.print();
    w.close();
}

function sendMailPage40() {

    const angebotTyp = localStorage.getItem("angebotTyp") || "kv";

    let subject = "";
    let mailAdresse = "";

    if (angebotTyp === "anfrage") {
        subject = "Anfrage Peter Jensen";
        mailAdresse = "info@ndf-gmbh.de";
    } else {
        subject = `Kostenvoranschlag Peter Jensen - NDF - ${new Date().toLocaleDateString("de-DE")}`;
        mailAdresse = "";
    }

    const body = encodeURIComponent(document.getElementById("page-40").innerText);

    window.location.href =
        `mailto:${mailAdresse}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

function clearInputs() {

    // localStorage komplett löschen
    localStorage.clear();

    // Eingabefelder im DOM leeren
    document.querySelectorAll("input").forEach(inp => inp.value = "");

    // Dynamische Inhalte leeren (damit nichts „stehen bleibt“)
    const idsToClear = [
        "page14-content",
        "content-14-3",
        "content-14-2",
        "content-8",
        "content-18",
        "content-20",
        "content-21",
        "content-22",
	"content-9",
        "content-10",
        "content-23",
	"content-24",
        "content-25",
        "summary-content",
        "hinweise-content"
    ];
    idsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

    // Summen-Anzeige zurücksetzen
    const angebotspreis = document.getElementById("angebotspreis");
    if (angebotspreis) angebotspreis.innerText = "Angebotspreis: 0,00 €";

    const sum14 = document.getElementById("gesamtSumme14");
    if (sum14) sum14.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum143 = document.getElementById("gesamtSumme143");
    if (sum143) sum143.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum142 = document.getElementById("gesamtSumme142");
    if (sum142) sum142.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum8 = document.getElementById("gesamtSumme8");
    if (sum8) sum8.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum18 = document.getElementById("gesamtSumme18");
    if (sum18) sum18.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum20 = document.getElementById("gesamtSumme20");
    if (sum20) sum20.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum21 = document.getElementById("gesamtSumme21");
    if (sum21) sum21.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum22 = document.getElementById("gesamtSumme22");
    if (sum22) sum22.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum9 = document.getElementById("gesamtSumme9");
    if (sum9) sum9.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum10 = document.getElementById("gesamtSumme10");
    if (sum10) sum10.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum23 = document.getElementById("gesamtSumme23");
    if (sum23) sum23.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum24 = document.getElementById("gesamtSumme24");
    if (sum24) sum24.innerText = "Gesamtsumme Angebot: 0,00 €";

    const sum25 = document.getElementById("gesamtSumme25");
    if (sum25) sum25.innerText = "Gesamtsumme Angebot: 0,00 €";

    // Flags zurücksetzen, damit Seiten neu aus CSV geladen werden
    page14Loaded = false;
    // Seite 14.3 hat kein Flag, daher reicht Container leeren

    // Angebots-Summen Objekt zurücksetzen (falls du es im RAM nutzt)
    angebotSummen = {};

    // zurück
    showPage("page-3");
}
// -----------------------------
// SEITE 14.2 – UPONOR (ndf5.csv)
// -----------------------------
function loadPage142() {

    const container = document.getElementById("content-14-2");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf5.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page142Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow142(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme142" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt142();
        });
}
function calcRow142(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page142Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page142Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt142();
}
function berechneGesamt142() {

    let sum = 0;

    document.querySelectorAll("#page-14-2 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-14-2", sum);

    const gesamtDiv = document.getElementById("gesamtSumme142");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}
// -----------------------------
// SEITE 8 – Fräsen (ndf6.csv)
// -----------------------------
function loadPage8() {

    const container = document.getElementById("content-8");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf6.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page8Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow8(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme8" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt8();
        });
}
function calcRow8(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page8Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page8Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt8();
}
function berechneGesamt8() {

    let sum = 0;

    document.querySelectorAll("#page-8 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-8", sum);

    const gesamtDiv = document.getElementById("gesamtSumme8");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}
// -----------------------------
// SEITE 18 – Unterdämmung (ndf7.csv)
// -----------------------------
function loadPage18() {

    const container = document.getElementById("content-18");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf7.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page18Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow18(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme18" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt18();
        });
}
function calcRow18(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page18Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page18Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt18();
}
function berechneGesamt18() {

    let sum = 0;

    document.querySelectorAll("#page-18 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-18", sum);

    const gesamtDiv = document.getElementById("gesamtSumme18");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}

// -----------------------------
// SEITE 20 – Verteiler & Regeltechnik (ndf8.csv)
// -----------------------------
function loadPage20() {

    const container = document.getElementById("content-20");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf8.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page20Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow20(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme20" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt20();
        });
}
function calcRow20(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page20Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page20Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt20();
}
function berechneGesamt20() {

    let sum = 0;

    document.querySelectorAll("#page-20 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-20", sum);

    const gesamtDiv = document.getElementById("gesamtSumme20");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}

// -----------------------------
// SEITE 21 – Dienstleistungen (ndf9.csv)
// -----------------------------
function loadPage21() {

    const container = document.getElementById("content-21");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf9.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page21Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow21(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme21" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt21();
        });
}
function calcRow21(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page21Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page21Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt21();
}
function berechneGesamt21() {

    let sum = 0;

    document.querySelectorAll("#page-21 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-21", sum);

    const gesamtDiv = document.getElementById("gesamtSumme21");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}

// -----------------------------
// SEITE 22 – Zuschläge (ndf10.csv)
// -----------------------------
function loadPage22() {

    const container = document.getElementById("content-22");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf10.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page22Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow22(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme22" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt22();
        });
}
function calcRow22(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page22Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page22Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt22();
}
function berechneGesamt22() {

    let sum = 0;

    document.querySelectorAll("#page-22 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-22", sum);

    const gesamtDiv = document.getElementById("gesamtSumme22");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}
// -----------------------------
// SEITE 9 – Estrich (ndf11.csv)
// -----------------------------
function loadPage9() {

    const container = document.getElementById("content-9");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf11.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page9Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow9(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme9" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt9();
        });
}
function calcRow9(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page9Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page9Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt9();
}
function berechneGesamt9() {

    let sum = 0;

    document.querySelectorAll("#page-9 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-9", sum);

    const gesamtDiv = document.getElementById("gesamtSumme9");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}

// -----------------------------
// SEITE 10 – Klett3mm (ndf2.csv)
// -----------------------------
function loadPage10() {

    const container = document.getElementById("content-10");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf2.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page10Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow10(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme10" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt10();
        });
}
function calcRow10(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page10Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page10Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt10();
}
function berechneGesamt10() {

    let sum = 0;

    document.querySelectorAll("#page-10 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-10", sum);

    const gesamtDiv = document.getElementById("gesamtSumme10");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}

// -----------------------------
// SEITE 23 – Aufbau 50mm (ndf12.csv)
// -----------------------------
function loadPage23() {

    const container = document.getElementById("content-23");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf12.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page23Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow23(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme23" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt23();
        });
}
function calcRow23(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page23Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page23Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt23();
}
function berechneGesamt23() {

    let sum = 0;

    document.querySelectorAll("#page-23 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-23", sum);

    const gesamtDiv = document.getElementById("gesamtSumme23");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}

// -----------------------------
// SEITE 24 – Aufbau 20/30mm + 3mm Deckschicht (ndf13.csv)
// -----------------------------
function loadPage24() {

    const container = document.getElementById("content-24");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf13.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page24Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow24(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme24" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt24();
        });
}
function calcRow24(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page24Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page24Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt24();
}
function berechneGesamt24() {

    let sum = 0;

    document.querySelectorAll("#page-24 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-24", sum);

    const gesamtDiv = document.getElementById("gesamtSumme24");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}

// -----------------------------
// SEITE 25 – Aufbau 25mm (XPS) (ndf14.csv)
// -----------------------------
function loadPage25() {

    const container = document.getElementById("content-25");
    if (!container) return;

    if (container.innerHTML.trim() !== "") return;

    fetch("ndf14.csv")
        .then(response => response.text())
        .then(data => {

            const lines = data.split("\n").slice(1);
            let html = "";

            const gespeicherteWerte =
                JSON.parse(localStorage.getItem("page25Data") || "{}");

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

                const preis = parseFloat(colD?.replace(",", "."));
                if (!isNaN(preis)) {

                    const menge = gespeicherteWerte[index] || 0;

                    html += `
                        <div class="row">
                            <div class="col-a">${colA}</div>
                            <div class="col-b">${colB}</div>
                            <div class="col-c">${colC}</div>

                            <input class="menge-input"
                                   type="number" min="0" step="any"
                                   value="${menge}"
                                   oninput="calcRow25(this, ${preis}, ${index})">

                            <div class="col-d">
                                ${preis.toLocaleString("de-DE",{minimumFractionDigits:2})} €
                            </div>

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

            html += `<div id="gesamtSumme25" class="gesamt">
                        Gesamtsumme: 0,00 €
                     </div>`;

            container.innerHTML = html;
            berechneGesamt25();
        });
}
function calcRow25(input, preis, index) {

    const row = input.parentElement;
    const ergebnis = row.querySelector(".col-e");
    const menge = parseFloat(input.value.replace(",", ".")) || 0;

    const sum = menge * preis;
    ergebnis.innerText =
        sum.toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";

    let gespeicherteWerte =
        JSON.parse(localStorage.getItem("page25Data") || "{}");

    gespeicherteWerte[index] = menge;
    localStorage.setItem("page25Data", JSON.stringify(gespeicherteWerte));

    berechneGesamt25();
}
function berechneGesamt25() {

    let sum = 0;

    document.querySelectorAll("#page-25 .col-e").forEach(el => {
        const wert = parseFloat(
            el.innerText.replace("€","")
                       .replace(/\./g,"")
                       .replace(",",".")
                       .trim()
        ) || 0;
        sum += wert;
    });

    saveSeitenSumme("page-25", sum);

    const gesamtDiv = document.getElementById("gesamtSumme25");
    if (gesamtDiv) {
        gesamtDiv.innerText =
            "Gesamtsumme Angebot: " +
            getGesamtAngebotssumme().toLocaleString("de-DE",{minimumFractionDigits:2}) + " €";
    }
}

document.body.addEventListener("mousemove", () => remaining = 600);
document.body.addEventListener("keydown", () => remaining = 600);


