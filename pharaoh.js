
"use strict";

const symbols = [
    "pharaoh.jpg",
    "anubis.jpg",
    "scarab.jpg",
    "cobra.jpg",
    "ankh.jpg",
    "pyramid.jpg"
];

const tracks = [
    document.getElementById("reel0"),
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3"),
    document.getElementById("reel4")
];

const spinButton = document.getElementById("spinButton");
const message = document.getElementById("message");

let spinning = false;

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

async function spin() {
    if (spinning) {
        return;
    }

    spinning = true;
    spinButton.disabled = true;

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
    spinButton.disabled = false;
}

spinButton.addEventListener("click", spin);

tracks.forEach(track => {
    showSymbols(track);
});
