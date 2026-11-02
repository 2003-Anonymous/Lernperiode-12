"use strict";
let balance = 0;
let accountReady = false;

function updateBalance() {
    document.getElementById("balance").textContent = balance.toLocaleString("de-CH");
}

async function loadBalance() {
    try {
        const response = await fetch('/Account/me');
        if (response.status === 401) {
            location.replace('index.html');
            return;
        }
        if (!response.ok) throw new Error('Konto konnte nicht geladen werden');
        const me = await response.json();
        if (typeof me.balance !== 'number' || !Number.isFinite(me.balance)) {
            throw new Error('Ungültiges Guthaben');
        }
        balance = me.balance;
        updateBalance();
        accountReady = true;
    } catch {
        document.getElementById('game-message').textContent =
            'Das Guthaben konnte nicht geladen werden. Bitte lade die Seite erneut.';
    }
}

function selectGame(gameName) {
    const message = document.getElementById('game-message');
    if (!accountReady) {
        message.textContent = 'Bitte warte, bis dein Konto geladen wurde.';
        return;
    }
    if (gameName === 'Wild West Slots') {
        location.href = 'wildwest.html';
        return;
    }
    message.textContent = 'Roulette wird später integriert.';
}

loadBalance();
