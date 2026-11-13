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
    if (gameName === 'Pharaoh') {
        location.href = 'pharaoh.html';
        return;
    }
    if (gameName === 'Roulette') {
        location.href = 'roulette.html';
        return;
    }
    message.textContent = 'Dieses Spiel gibt es noch nicht.';
}

async function logout() {
    try {
        await fetch('/Account/logout', { method: 'POST' });
    } finally {
        location.replace('index.html');
    }
}

document.getElementById('logout').addEventListener('click', logout);

loadBalance();
