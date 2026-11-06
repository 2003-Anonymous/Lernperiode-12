
"use strict";


const SYMBOLS = [
  { file: "Bomb.jpg", name: "Dynamit", multiplier: 3 },
  { file: "Cartoon reward.jpg", name: "Goldsack", multiplier: 5 },
  { file: "Cowboy.jpg", name: "Cowboy", multiplier: 8 },
  { file: "Gold_horsehoe.jpg", name: "Hufeisen", multiplier: 4 },
  { file: "Revolver.jpg", name: "Revolver", multiplier: 6 },
  { file: "Sheriff.jpg", name: "Sheriffstern", multiplier: 10 }
];

const STORAGE_KEY = "casinoRoyalBalance";
const BETS = [10, 25, 50, 100];


const tracks = Array.from(
  { length: 5 },
  (_, i) => document.getElementById(`reel${i}`)
);

const balanceEl = document.getElementById("balance");
const betEl = document.getElementById("betValue");
const messageEl = document.getElementById("message");
const winEl = document.getElementById("lastWin");
const spinButton = document.getElementById("spinButton");
const autoButton = document.getElementById("autoButton");
const minusButton = document.getElementById("betMinus");
const plusButton = document.getElementById("betPlus");
const maxButton = document.getElementById("maxBet");
const frame = document.querySelector(".machine-frame");

let betIndex = 0;
let spinning = false;
let autoSpin = false;
let balance = loadBalance();


function loadBalance() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    return 1000;
  }

  const value = Number(raw);

  return Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 1000;
}


function saveBalance() {
  localStorage.setItem(STORAGE_KEY, String(balance));
  balanceEl.textContent = balance.toLocaleString("de-CH");
}


function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}


function symbolNode(symbol) {
  const cell = document.createElement("div");
  cell.className = "symbol";

  const img = document.createElement("img");
  img.src = `images/${encodeURIComponent(symbol.file)}`;
  img.alt = symbol.name;
  img.draggable = false;

  cell.appendChild(img);

  return cell;
}


function showColumn(track, column) {
  track.classList.remove("rolling");
  track.style.transform = "";

  track.replaceChildren(...column.map(symbolNode));
}


function animateColumn(track) {
  const sequence = Array.from(
    { length: 12 },
    randomSymbol
  );

  
  track.replaceChildren(
    ...sequence.concat(sequence).map(symbolNode)
  );

  track.classList.remove("rolling");

  
  void track.offsetWidth;

  track.classList.add("rolling");
}


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function currentBet() {
  return BETS[betIndex];
}


function updateControls() {
  betEl.textContent = `${currentBet()} CHF`;

  minusButton.disabled = spinning || betIndex === 0;
  plusButton.disabled =
    spinning || betIndex === BETS.length - 1;

  maxButton.disabled = spinning;
  spinButton.disabled = spinning;

  autoButton.textContent = autoSpin
    ? "AUTO SPIN: AN"
    : "AUTO SPIN: AUS";

  autoButton.setAttribute(
    "aria-pressed",
    String(autoSpin)
  );
}


function setBet(index) {
  if (spinning) {
    return;
  }

  betIndex = Math.max(
    0,
    Math.min(BETS.length - 1, index)
  );

  updateControls();
}


function calculateWin(columns, stake) {

  
  const first = columns[0][1];

  let matching = 1;


  for (let col = 1; col < 5; col++) {
    if (columns[col][1].file !== first.file) {
      break;
    }

    matching++;
  }

  
  if (matching < 3) {
    return {
      payout: 0,
      matching: 0,
      name: ""
    };
  }

  
  const lengthFactor =
    matching === 3 ? 1 :
    matching === 4 ? 2 : 5;

  return {
    payout: stake * first.multiplier * lengthFactor,
    matching,
    name: first.name
  };
}


async function spin() {

  
  if (spinning) {
    return;
  }

  const stake = currentBet();

  
  if (balance < stake) {
    autoSpin = false;

    messageEl.textContent =
      "Nicht genügend Spielgeld für diesen Einsatz.";

    updateControls();
    return;
  }

  spinning = true;

  frame.classList.remove("winner");

  
  balance -= stake;
  saveBalance();

  updateControls();

  messageEl.textContent = "Die Walzen drehen sich ...";
  winEl.textContent = "0 CHF";

  
  const columns = Array.from(
    { length: 5 },
    () => Array.from({ length: 3 }, randomSymbol)
  );

 
  tracks.forEach(animateColumn);

  try {

    
    for (let i = 0; i < tracks.length; i++) {

      await wait(i === 0 ? 1100 : 450);

      showColumn(tracks[i], columns[i]);
    }

    
    const win = calculateWin(columns, stake);

    if (win.payout > 0) {

      
      balance += win.payout;
      saveBalance();

      winEl.textContent =
        `${win.payout.toLocaleString("de-CH")} CHF`;

      messageEl.textContent =
        `★ ${win.matching}× ${win.name}! ` +
        `${win.payout} CHF gewonnen! ★`;

      
      frame.classList.add("winner");

    } else {

      messageEl.textContent =
        "Kein Gewinn – nächster Goldrausch?";
    }

  } finally {

    spinning = false;
    updateControls();
  }

  
  if (autoSpin) {
    await wait(750);

    if (autoSpin && !spinning) {
      spin();
    }
  }
}


minusButton.addEventListener("click", () => {
  setBet(betIndex - 1);
});


plusButton.addEventListener("click", () => {
  setBet(betIndex + 1);
});


maxButton.addEventListener("click", () => {
  setBet(BETS.length - 1);
});


spinButton.addEventListener("click", spin);


autoButton.addEventListener("click", () => {

  autoSpin = !autoSpin;

  updateControls();

  if (autoSpin && !spinning) {
    spin();
  }
});


const payoutRows = document.getElementById("payoutRows");

SYMBOLS.forEach(symbol => {

  const row = document.createElement("div");

  const img = document.createElement("img");
  img.src = `images/${encodeURIComponent(symbol.file)}`;
  img.alt = symbol.name;

  const text = document.createElement("span");
  text.textContent =
    `${symbol.name}: 3× = Einsatz × ${symbol.multiplier}`;

  row.append(img, text);

  payoutRows.appendChild(row);
});


tracks.forEach(track => {
  showColumn(
    track,
    Array.from({ length: 3 }, randomSymbol)
  );
});


saveBalance();


updateControls();
