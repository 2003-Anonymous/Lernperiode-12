
"use strict";

const SYMBOLS = [
    { file: "Bomb.jpg", name: "Dynamit", multiplier: 3 },
    { file: "Cartoon reward.jpg", name: "Goldsack", multiplier: 5 },
    { file: "Cowboy.jpg", name: "Cowboy", multiplier: 8 },
    { file: "Gold_horsehoe.jpg", name: "Hufeisen", multiplier: 4 },
    { file: "Revolver.jpg", name: "Revolver", multiplier: 6 },
    { file: "Sheriff.jpg", name: "Sheriffstern", multiplier: 10 }
];


const spinSound = new Audio("sounds/slotmachine.mp3");
spinSound.volume = 0.6;
spinSound.loop = true;

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
const payoutRows = document.getElementById("payoutRows");

const processedImages = new Map();

let betIndex = 0;
let spinning = false;
let autoSpin = false;
let ready = false;
let balance = 0;

// Guthaben aus der API: Jede Änderung von balance wird als Differenz
// an POST /Account/me/balance geschickt (siehe assets/balance.js).
let syncedBalance = null;

function syncBalance() {
    if (syncedBalance === null) {
        return;
    }
    const delta = Math.round((balance - syncedBalance) * 100) / 100;
    if (delta === 0) {
        return;
    }
    syncedBalance = balance;
    changeBalance(delta).then(serverBalance => {
        if (serverBalance === null) {
            return reloadBalance();
        }
        return undefined;
    });
}

async function reloadBalance() {
    const serverBalance = await loadServerBalance();
    if (serverBalance === null) {
        return;
    }
    balance = serverBalance;
    syncedBalance = serverBalance;
    balanceEl.textContent = balance.toLocaleString("de-CH");
    updateControls();
}

function saveBalance() {
    syncBalance();

    balanceEl.textContent = balance.toLocaleString("de-CH");
}

function randomSymbol() {
    return SYMBOLS[
        Math.floor(Math.random() * SYMBOLS.length)
    ];
}

function removeWhiteBackground(image) {
    const canvas = document.createElement("canvas");

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);

    let head = 0;
    let tail = 0;

    function checkPixel(x, y) {
        if (
            x < 0 ||
            y < 0 ||
            x >= width ||
            y >= height
        ) {
            return;
        }

        const pos = y * width + x;

        if (visited[pos]) {
            return;
        }

        visited[pos] = 1;

        const i = pos * 4;

        if (
            data[i] > 235 &&
            data[i + 1] > 235 &&
            data[i + 2] > 235
        ) {
            queue[tail++] = pos;
        }
    }

    for (let x = 0; x < width; x++) {
        checkPixel(x, 0);
        checkPixel(x, height - 1);
    }

    for (let y = 0; y < height; y++) {
        checkPixel(0, y);
        checkPixel(width - 1, y);
    }

    while (head < tail) {
        const pos = queue[head++];

        const x = pos % width;
        const y = Math.floor(pos / width);

        data[pos * 4 + 3] = 0;

        checkPixel(x - 1, y);
        checkPixel(x + 1, y);
        checkPixel(x, y - 1);
        checkPixel(x, y + 1);
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/png");
}

async function prepareImages() {
    await Promise.all(
        SYMBOLS.map(symbol => new Promise(resolve => {
            const img = new Image();

            img.onload = () => {
                try {
                    processedImages.set(
                        symbol.file,
                        removeWhiteBackground(img)
                    );
                } catch {
                    processedImages.set(symbol.file, img.src);
                }

                resolve();
            };

            img.onerror = () => {
                processedImages.set(
                    symbol.file,
                    `images/${encodeURIComponent(symbol.file)}`
                );

                resolve();
            };

            img.src = `images/${encodeURIComponent(symbol.file)}`;
        }))
    );
}

function symbolNode(symbol) {
    const cell = document.createElement("div");
    cell.className = "symbol";

    const img = document.createElement("img");

    img.src = processedImages.get(symbol.file)
        || `images/${encodeURIComponent(symbol.file)}`;

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

    minusButton.disabled =
        spinning || !ready || betIndex === 0;

    plusButton.disabled =
        spinning || !ready || betIndex === BETS.length - 1;

    maxButton.disabled = spinning || !ready;

    spinButton.disabled = spinning || !ready || autoSpin;

    autoButton.disabled = !ready;

    autoButton.textContent = autoSpin
        ? "AUTO SPIN: AN"
        : "AUTO SPIN: AUS";

    autoButton.setAttribute(
        "aria-pressed",
        String(autoSpin)
    );
}

function setBet(index) {
    if (spinning || autoSpin) {
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
    if (spinning || !ready) {
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

    spinSound.pause();
    spinSound.currentTime = 0;
    spinSound.play().catch(() => {});

    frame.classList.remove("winner");

    balance -= stake;
    saveBalance();

    updateControls();

    messageEl.textContent = "Die Walzen drehen sich ...";
    winEl.textContent = "0 CHF";

    const columns = Array.from(
        { length: 5 },
        () => Array.from(
            { length: 3 },
            randomSymbol
        )
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
                `${win.payout.toLocaleString("de-CH")} CHF gewonnen! ★`;

            frame.classList.add("winner");
        } else {
            messageEl.textContent =
                "Kein Gewinn – nächster Goldrausch?";
        }
    } finally {
        spinSound.pause();
        spinSound.currentTime = 0;

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

async function initializeGame() {
    updateControls();
    saveBalance();

    await prepareImages();

    SYMBOLS.forEach(symbol => {
        const row = document.createElement("div");
        const img = document.createElement("img");

        img.src = processedImages.get(symbol.file)
            || `images/${encodeURIComponent(symbol.file)}`;

        img.alt = symbol.name;

        const label = document.createElement("span");

        label.textContent =
            `${symbol.name}: 3× = Einsatz × ${symbol.multiplier}`;

        row.append(img, label);
        payoutRows.appendChild(row);
    });

    tracks.forEach(track => {
        showColumn(
            track,
            Array.from({ length: 3 }, randomSymbol)
        );
    });

    await reloadBalance();

    ready = true;
    updateControls();
}

initializeGame();
