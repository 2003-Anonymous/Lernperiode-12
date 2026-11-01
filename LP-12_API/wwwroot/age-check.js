// Die Altersbestätigung gilt für den aktuellen Browser-Tab.
const storageKey = "casino.age-confirmation";
const ageGate = document.getElementById("age-gate");
const ageQuestion = document.getElementById("age-question");
const ageDenied = document.getElementById("age-denied");
const casinoContent = document.getElementById("casino-content");
const yesButton = document.getElementById("age-yes");
const noButton = document.getElementById("age-no");

// Manche Browser erlauben keinen Zugriff auf den Sitzungsspeicher.
// Die Auswahl funktioniert dann weiterhin für die geöffnete Seite.
function saveDecision(decision) {
  try {
    sessionStorage.setItem(storageKey, decision);
  } catch {
    // Ohne Speicher kann die Entscheidung beim Neuladen nicht erhalten bleiben.
  }
}

function allowAccess() {
  ageGate.hidden = true;
  casinoContent.hidden = false;
  casinoContent.inert = false;
  document.getElementById("username").focus();
}

function denyAccess() {
  casinoContent.hidden = true;
  casinoContent.inert = true;
  ageGate.hidden = false;
  ageQuestion.hidden = true;
  ageDenied.hidden = false;
  ageGate.setAttribute("aria-labelledby", "age-denied-title");
  document.getElementById("age-denied-title").focus();
}

yesButton.addEventListener("click", () => {
  saveDecision("accepted");
  allowAccess();
});

noButton.addEventListener("click", () => {
  saveDecision("denied");
  denyAccess();
});

// Erst nach dem Verbinden der Buttons kann eine Auswahl getroffen werden.
yesButton.disabled = false;
noButton.disabled = false;

let savedDecision = null;
try {
  savedDecision = sessionStorage.getItem(storageKey);
} catch {
  // Ist der Speicher gesperrt, erscheint die Altersfrage erneut.
}

if (savedDecision === "accepted") {
  allowAccess();
} else if (savedDecision === "denied") {
  denyAccess();
} else {
  document.getElementById("age-title").focus();
}
