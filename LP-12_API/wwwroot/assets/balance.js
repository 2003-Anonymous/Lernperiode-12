"use strict";

// Ändert das Guthaben des angemeldeten Spielers.
// Betrag negativ = Einsatz, positiv = Gewinn.
// Gibt das neue Guthaben zurück oder null, wenn es nicht geklappt hat.
async function changeBalance(amount) {
    const response = await fetch('/Account/me/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });

    if (response.status === 401) {
        location.replace('index.html');
        return null;
    }
    if (!response.ok) {
        return null; // z.B. zu wenig Guthaben
    }

    const account = await response.json();
    return account.balance;
}

// Lädt das Guthaben des angemeldeten Spielers.
// Gibt das Guthaben zurück oder null, wenn es nicht geklappt hat.
async function loadServerBalance() {
    const response = await fetch('/Account/me');

    if (response.status === 401) {
        location.replace('index.html');
        return null;
    }
    if (!response.ok) {
        return null;
    }

    const account = await response.json();
    return account.balance;
}
