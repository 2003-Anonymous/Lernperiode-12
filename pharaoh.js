
"use strict";

const symbols = [
    "pharaoh.jpg",
    "anubis.jpg",
    "scarab.jpg",
    "cobra.jpg",
    "ankh.jpg",
    "pyramid.jpg"
];

const bets = [10, 20, 50, 100];

const tracks = [
    document.getElementById("reel0"),
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3"),
    document.getElementById("reel4")
];

const spinButton = document.getElementById("spinButton");
const autoButton = document.getElementById("autoButton");
const betMinus = document.getElementById("betMinus");
const betPlus = document.getElementById("betPlus");
const betValue = document.getElementById("betValue");
const message = document.getElementById("message");

let spinning = false;
let autoPlay = false;
let betIndex = 0;

function randomSymbol() {
    const index = Math.floor(Math.random() * symbols.length);
    return symbols[index];
}

function createSymbol(file) {
    const div = document.createElement("div");
    div.className = "symbol";

    const img = document.createElement("img");
    img.src = "images/Pharao/" + file;
    img.alt = file;
    img.draggable = false;

    div.appendChild(img);

    return div;
}

function showSymbols(track) {
    track.classList.remove("rolling");
    track.style.transform = "";
    track.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        track.appendChild(createSymbol(randomSymbol()));
    }
}

function animateReel(track) {
    track.innerHTML = "";

    const sequence = [];

    for (let i = 0; i < 12; i++) {
        sequence.push(randomSymbol());
    }

    for (let i = 0; i < 2; i++) {
        sequence.forEach(file => {
            track.appendChild(createSymbol(file));
        });
    }

    track.classList.remove("rolling");

    void track.offsetWidth;

    track.classList.add("rolling");
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateBet() {
    betValue.textContent = bets[betIndex] + " CHF";

    betMinus.disabled = spinning || betIndex === 0;
    betPlus.disabled =
        spinning || betIndex === bets.length - 1;
}

function updateControls() {
    spinButton.disabled = spinning;

    updateBet();

    autoButton.textContent = autoPlay
        ? "AUTO PLAY: AN"
        : "AUTO PLAY: AUS";

    autoButton.classList.toggle("active", autoPlay);
    autoButton.setAttribute("aria-pressed", String(autoPlay));
}

async function spin() {
    if (spinning) {
        return;
    }

    spinning = true;
    updateControls();

    message.textContent = "Die Walzen drehen sich...";

    tracks.forEach(track => {
        animateReel(track);
    });

    for (let i = 0; i < tracks.length; i++) {
        await wait(i === 0 ? 1000 : 400);
        showSymbols(tracks[i]);
    }

    message.textContent = "Spin beendet!";

    spinning = false;
    updateControls();

    if (autoPlay) {
        await wait(1000);

        if (autoPlay && !spinning) {
            spin();
        }
    }
}

betMinus.addEventListener("click", () => {
    if (spinning) {
        return;
    }

    if (betIndex > 0) {
        betIndex--;
        updateBet();
    }
});

betPlus.addEventListener("click", () => {
    if (spinning) {
        return;
    }

    if (betIndex < bets.length - 1) {
        betIndex++;
        updateBet();
    }
});

spinButton.addEventListener("click", spin);

autoButton.addEventListener("click", () => {
    autoPlay = !autoPlay;

    updateControls();

    if (autoPlay && !spinning) {
        spin();
    }
});

tracks.forEach(track => {
    showSymbols(track);
});

updateControls();
