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

document.body.addEventListener("mousemove", () => remaining = 600);
document.body.addEventListener("keydown", () => remaining = 600);
