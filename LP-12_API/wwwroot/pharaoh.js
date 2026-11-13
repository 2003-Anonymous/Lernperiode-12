
"use strict";

const SYMBOLS = [
    { file: "pharaoh.jpg", name: "Pharao", multiplier: 15 },
    { file: "anubis.jpg", name: "Anubis", multiplier: 10 },
    { file: "scarab.jpg", name: "Skarabäus", multiplier: 8 },
    { file: "cobra.jpg", name: "Kobra", multiplier: 6 },
    { file: "ankh.jpg", name: "Ankh", multiplier: 5 },
    { file: "pyramid.jpg", name: "Pyramide", multiplier: 3 },
    { file: "free_spins.png", name: "Free Spins", multiplier: 0 }
];

const BETS = [10, 25, 50, 100];
const IMAGE_FOLDER = "images/Pharao/";

const spinSound = new Audio("sounds/slotmachine.mp3");
spinSound.volume = 0.6;
spinSound.loop = true;
spinSound.preload = "auto";

const tracks = Array.from(
    { length: 5 },
    (_, i) => document.getElementById(`reel${i}`)
);

const balanceEl = document.getElementById("balance");
const betEl = document.getElementById("betValue");
const messageEl = document.getElementById("message");
const winEl = document.getElementById("lastWin");
const freeSpinsEl = document.getElementById("freeSpins");

const spinButton = document.getElementById("spinButton");
const autoButton = document.getElementById("autoButton");
const minusButton = document.getElementById("betMinus");
const plusButton = document.getElementById("betPlus");
const maxButton = document.getElementById("maxBet");
const machine = document.querySelector(".slot-machine");

let betIndex = 0;
let spinning = false;
let autoSpin = false;
let freeSpins = 0;
let balance = 0;

const processedImages = new Map();

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

function formatMoney(value) {
    return value.toLocaleString("de-CH") + " CHF";
}

function currentBet() {
    return BETS[betIndex];
}

function randomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function imagePath(file) {
    return IMAGE_FOLDER + file;
}

function isWhite(data, index) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];

    return r > 235 && g > 235 && b > 235;
}

function removeWhiteBackground(image) {
    const canvas = document.createElement("canvas");
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
        willReadFrequently: true
    });

    if (!context) {
        return image.src;
    }

    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(
        0, 0, width, height
    );

    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);

    let head = 0;
    let tail = 0;

    function addPixel(x, y) {
        if (x < 0 || y < 0 || x >= width || y >= height) {
            return;
        }

        const position = y * width + x;

        if (visited[position]) {
            return;
        }

        visited[position] = 1;

        if (isWhite(data, position * 4)) {
            queue[tail++] = position;
        }
    }

    for (let x = 0; x < width; x++) {
        addPixel(x, 0);
        addPixel(x, height - 1);
    }

    for (let y = 0; y < height; y++) {
        addPixel(0, y);
        addPixel(width - 1, y);
    }

    while (head < tail) {
        const position = queue[head++];
        const x = position % width;
        const y = Math.floor(position / width);

        data[position * 4 + 3] = 0;

        addPixel(x - 1, y);
        addPixel(x + 1, y);
        addPixel(x, y - 1);
        addPixel(x, y + 1);
    }

    context.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/png");
}

function prepareImages() {
    return Promise.all(
        SYMBOLS.map(symbol => {
            return new Promise(resolve => {
                const img = new Image();

                img.onload = () => {
                    try {
                        const source = symbol.file === "ankh.jpg"
                            ? removeWhiteBackground(img)
                            : img.src;

                        processedImages.set(symbol.file, source);
                    } catch (error) {
                        processedImages.set(symbol.file, img.src);
                    }

                    resolve();
                };

                img.onerror = () => {
                    processedImages.set(
                        symbol.file,
                        imagePath(symbol.file)
                    );

                    resolve();
                };

                img.src = imagePath(symbol.file);
            });
        })
    );
}

function createSymbol(symbol) {
    const cell = document.createElement("div");
    cell.className = "symbol";

    const img = document.createElement("img");

    img.src = processedImages.get(symbol.file)
        || imagePath(symbol.file);

    img.alt = symbol.name;
    img.draggable = false;

    cell.appendChild(img);

    return cell;
}

function showColumn(track, column) {
    track.classList.remove("rolling");
    track.style.transform = "";

    track.replaceChildren(
        ...column.map(createSymbol)
    );
}

function animateColumn(track) {
    const sequence = Array.from(
        { length: 12 },
        randomSymbol
    );

    track.replaceChildren(
        ...sequence.concat(sequence).map(createSymbol)
    );

    track.classList.remove("rolling");
    void track.offsetWidth;
    track.classList.add("rolling");
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function playSpinSound() {
    spinSound.pause();
    spinSound.currentTime = 0;

    spinSound.play().catch(() => {});
}

function stopSpinSound() {
    spinSound.pause();
    spinSound.currentTime = 0;
}

function updateFreeSpins() {
    freeSpinsEl.textContent = freeSpins;
}

function updateControls() {
    betEl.textContent = formatMoney(currentBet());

    minusButton.disabled = spinning || betIndex === 0;

    plusButton.disabled =
        spinning || betIndex === BETS.length - 1;

    maxButton.disabled = spinning;

    spinButton.disabled =
        spinning || (balance < currentBet() && freeSpins === 0);

    autoButton.textContent = autoSpin
        ? "AUTO PLAY: AN"
        : "AUTO PLAY: AUS";

    autoButton.setAttribute("aria-pressed", String(autoSpin));
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

function checkFreeSpins(columns) {
    let count = 0;

    for (let i = 0; i < columns.length; i++) {
        if (columns[i][1].file === "free_spins.png") {
            count++;
        }
    }

    if (count >= 3) {
        freeSpins += 5;
        updateFreeSpins();
        return true;
    }

    return false;
}

function calculateWin(columns, stake) {
    const first = columns[0][1];

    if (first.file === "free_spins.png") {
        return {
            payout: 0,
            matching: 0,
            name: ""
        };
    }

    let matching = 1;

    for (let i = 1; i < columns.length; i++) {
        if (columns[i][1].file !== first.file) {
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

    const factor =
        matching === 3 ? 1 :
        matching === 4 ? 2 : 5;

    return {
        payout: stake * first.multiplier * factor,
        matching,
        name: first.name
    };
}

async function spin() {
    if (spinning) {
        return;
    }

    const stake = currentBet();
    const isFreeSpin = freeSpins > 0;

    if (!isFreeSpin && balance < stake) {
        autoSpin = false;
        messageEl.textContent = "Nicht genügend Spielgeld!";
        updateControls();
        return;
    }

    spinning = true;

    playSpinSound();

    machine.classList.remove("winner");

    if (isFreeSpin) {
        freeSpins--;
        updateFreeSpins();
    } else {
        balance -= stake;
        saveBalance();
    }

    updateControls();

    messageEl.textContent = isFreeSpin
        ? "Kostenloser Spin läuft..."
        : "Die Walzen drehen sich...";

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

        const bonus = checkFreeSpins(columns);
        const result = calculateWin(columns, stake);

        if (result.payout > 0) {
            balance += result.payout;
            saveBalance();

            winEl.textContent = formatMoney(result.payout);
            machine.classList.add("winner");
        }

        if (bonus) {
            messageEl.textContent = result.payout > 0
                ? "★ 5 FREE SPINS und " +
                  formatMoney(result.payout) +
                  " gewonnen! ★"
                : "★ BONUS! 5 FREE SPINS! ★";

            machine.classList.add("winner");
        } else if (result.payout > 0) {
            messageEl.textContent =
                "★ " + result.matching + "× " + result.name +
                "! " + formatMoney(result.payout) +
                " gewonnen! ★";
        } else {
            messageEl.textContent = isFreeSpin
                ? "Free Spin beendet! Noch " + freeSpins + " übrig."
                : "Kein Gewinn! Versuche es erneut.";
        }
    } finally {
        stopSpinSound();

        spinning = false;

        if (balance < currentBet() && freeSpins === 0) {
            autoSpin = false;
        }

        updateControls();
    }

    if (autoSpin) {
        await wait(800);

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

function createPayoutTable() {
    const payoutRows = document.getElementById("payoutRows");

    SYMBOLS.forEach(symbol => {
        const row = document.createElement("div");
        const img = document.createElement("img");

        img.src = processedImages.get(symbol.file)
            || imagePath(symbol.file);

        img.alt = symbol.name;

        const label = document.createElement("span");

        if (symbol.file === "free_spins.png") {
            label.textContent =
                "Free Spins: 3 oder mehr = 5 Freispiele";
        } else {
            label.textContent =
                symbol.name + ": 3× = Einsatz × " +
                symbol.multiplier;
        }

        row.append(img, label);
        payoutRows.appendChild(row);
    });
}

async function initializeGame() {
    spinButton.disabled = true;
    autoButton.disabled = true;

    messageEl.textContent = "Symbole werden geladen...";

    await prepareImages();

    tracks.forEach(track => {
        showColumn(
            track,
            Array.from({ length: 3 }, randomSymbol)
        );
    });

    createPayoutTable();
    await reloadBalance();
    updateFreeSpins();
    updateControls();

    autoButton.disabled = false;

    messageEl.textContent =
        "Wähle deinen Einsatz und starte den Spin!";
}

initializeGame();
