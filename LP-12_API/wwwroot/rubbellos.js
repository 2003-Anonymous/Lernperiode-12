"use strict";

const TICKETS = [
    {
        id: "golden",
        name: "Golden Ticket",
        type: "match3",
        price: 10,
        columns: 3,
        fields: 9,
        description: "3 gleiche Symbole gewinnen.",
        prizes: [
            { symbol: "⭐", amount: 500, chance: 0.002 },
            { symbol: "💎", amount: 200, chance: 0.005 },
            { symbol: "🔔", amount: 100, chance: 0.01 },
            { symbol: "🍒", amount: 50, chance: 0.04 },
            { symbol: "🍋", amount: 20, chance: 0.08 }
        ]
    },
    {
        id: "treasure",
        name: "Schatzkarte",
        type: "sum",
        price: 15,
        columns: 4,
        fields: 16,
        description: "16 Felder. Alle gefundenen Beträge werden zusammengezählt.",
        values: [
            { label: "", amount: 0, weight: 92 },
            { label: "5 CHF", amount: 5, weight: 5 },
            { label: "10 CHF", amount: 10, weight: 2.5 },
            { label: "50 CHF", amount: 50, weight: 0.35 }
        ]
    },
    {
        id: "risk",
        name: "Risiko-Los",
        type: "risk",
        price: 20,
        columns: 4,
        fields: 12,
        description: "Plusfelder erhöhen den Gewinn, Minusfelder ziehen davon ab. Der Gewinn fällt nie unter 0.",
        values: [
            { label: "", amount: 0, weight: 36 },
            { label: "+5", amount: 5, weight: 22 },
            { label: "+10", amount: 10, weight: 10 },
            { label: "+30", amount: 30, weight: 2 },
            { label: "−10", amount: -10, weight: 22 },
            { label: "−25", amount: -25, weight: 8 }
        ]
    }
];


function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

function pickWeighted(values) {
    const total = values.reduce((sum, v) => sum + v.weight, 0);
    let r = Math.random() * total;
    for (const value of values) {
        r -= value.weight;
        if (r < 0) {
            return value;
        }
    }
    return values[values.length - 1];
}

function createMatch3(ticket) {
    const symbols = ticket.prizes.map(p => p.symbol);
    let r = Math.random();
    let prize = null;
    for (const p of ticket.prizes) {
        if (r < p.chance) {
            prize = p;
            break;
        }
        r -= p.chance;
    }

    const cells = [];
    const counts = new Map(symbols.map(s => [s, 0]));

    if (prize) {
        for (let i = 0; i < 3; i++) {
            cells.push(prize.symbol);
        }
        counts.set(prize.symbol, 3);
    }

    while (cells.length < ticket.fields) {
        const options = symbols.filter(s => s !== prize?.symbol && counts.get(s) < 2);
        const symbol = options[randomInt(options.length)];
        cells.push(symbol);
        counts.set(symbol, counts.get(symbol) + 1);
    }

    return {
        cells: shuffle(cells).map(symbol => ({ label: symbol, amount: 0 })),
        finalWin: prize ? prize.amount : 0,
        winText: prize ? `3× ${prize.symbol}` : ""
    };
}

function createFromValues(ticket) {
    const cells = [];
    for (let i = 0; i < ticket.fields; i++) {
        const value = pickWeighted(ticket.values);
        cells.push({ label: value.label, amount: value.amount });
    }
    return { cells, finalWin: null, winText: "" };
}

function createTicket(ticket) {
    return ticket.type === "match3" ? createMatch3(ticket) : createFromValues(ticket);
}

function applyReveal(ticket, currentWin, cell) {
    if (ticket.type === "sum") {
        return currentWin + cell.amount;
    }
    if (ticket.type === "risk") {
        return Math.max(0, currentWin + cell.amount);
    }
    return currentWin;
}

if (typeof module !== "undefined") {
    module.exports = { TICKETS, createTicket, applyReveal };
}


if (typeof document !== "undefined") {
    const $ = id => document.getElementById(id);

    const view = {
        shop: $("shop"),
        game: $("game"),
        list: $("ticket-list"),
        shopMessage: $("shop-message"),
        balance: $("balance"),
        title: $("ticket-title"),
        rules: $("ticket-rules"),
        grid: $("grid"),
        progress: $("progress"),
        currentWin: $("current-win"),
        result: $("result"),
        revealAll: $("reveal-all"),
        buyAgain: $("buy-again"),
        backToShop: $("back-to-shop")
    };

    let balance = null;
    let busy = false;
    let game = null; // { ticket, cells, revealed, win, finished }

    function chf(amount) {
        return `${amount.toLocaleString("de-CH")} CHF`;
    }

    function showBalance() {
        view.balance.textContent = balance === null ? "…" : balance.toLocaleString("de-CH");
        renderShop();
    }


    function renderShop() {
        view.list.replaceChildren(...TICKETS.map(ticket => {
            const card = document.createElement("article");
            card.className = "ticket-card";

            const title = document.createElement("h3");
            title.textContent = ticket.name;

            const text = document.createElement("p");
            text.textContent = ticket.description;

            const info = document.createElement("p");
            info.className = "ticket-info";
            info.textContent = `${ticket.fields} Felder · Preis ${chf(ticket.price)}`;

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "Kaufen";
            button.disabled = busy || balance === null || balance < ticket.price;
            button.addEventListener("click", () => buy(ticket));

            card.append(title, text, info, button);
            return card;
        }));
    }

    async function buy(ticket) {
        if (busy) {
            return;
        }
        busy = true;
        view.shopMessage.textContent = "";
        view.result.textContent = "";
        renderShop();
        updateGameButtons();

        const newBalance = await changeBalance(-ticket.price);
        busy = false;

        if (newBalance === null) {
            const text = "Kauf nicht möglich. Hast du genug Guthaben?";
            view.shopMessage.textContent = text;
            view.result.textContent = text;
            showBalance();
            updateGameButtons();
            return;
        }

        balance = newBalance;
        showBalance();
        startGame(ticket);
    }


    function startGame(ticket) {
        const created = createTicket(ticket);
        game = {
            ticket,
            cells: created.cells,
            finalWin: created.finalWin,
            winText: created.winText,
            revealed: new Array(created.cells.length).fill(false),
            win: 0,
            finished: false
        };

        view.title.textContent = ticket.name;
        view.rules.replaceChildren(...rulesFor(ticket));
        view.grid.style.gridTemplateColumns = `repeat(${ticket.columns}, minmax(0, 1fr))`;
        view.grid.replaceChildren(...game.cells.map((_, index) => {
            const field = document.createElement("button");
            field.type = "button";
            field.className = "field covered";
            field.textContent = "?";
            field.setAttribute("aria-label", `Feld ${index + 1} aufdecken`);
            field.addEventListener("click", () => reveal(index));
            return field;
        }));

        view.shop.hidden = true;
        view.game.hidden = false;
        view.result.textContent = "";
        updateProgress();
        updateGameButtons();
    }

    function rulesFor(ticket) {
        const lines = ticket.type === "match3"
            ? ticket.prizes.map(p => `3× ${p.symbol} = ${chf(p.amount)}`)
            : ticket.values.filter(v => v.amount !== 0).map(v => `${v.label}`);

        const intro = document.createElement("p");
        intro.textContent = ticket.description;

        const list = document.createElement("ul");
        list.append(...lines.map(line => {
            const item = document.createElement("li");
            item.textContent = line;
            return item;
        }));

        return [intro, list];
    }

    function reveal(index) {
        if (!game || game.finished || game.revealed[index]) {
            return;
        }

        const cell = game.cells[index];
        game.revealed[index] = true;
        game.win = applyReveal(game.ticket, game.win, cell);

        const field = view.grid.children[index];
        field.classList.remove("covered");
        field.classList.toggle("minus", cell.amount < 0);
        field.textContent = cell.label || "–";
        field.disabled = true;

        updateProgress();

        if (game.revealed.every(Boolean)) {
            finish();
        }
    }

    function revealAll() {
        if (!game) {
            return;
        }
        game.revealed.forEach((open, index) => {
            if (!open) {
                reveal(index);
            }
        });
    }

    function updateProgress() {
        const open = game.revealed.filter(Boolean).length;
        view.progress.textContent = `Aufgedeckt: ${open} / ${game.cells.length}`;
        view.currentWin.textContent = game.ticket.type === "match3"
            ? ""
            : `Aktueller Gewinn: ${chf(game.win)}`;
    }

    async function finish() {
        game.finished = true;
        const win = game.ticket.type === "match3" ? game.finalWin : game.win;

        if (win > 0) {
            busy = true;
            updateGameButtons();
            const newBalance = await changeBalance(win);
            busy = false;

            if (newBalance === null) {
                view.result.textContent =
                    "Der Gewinn konnte nicht gutgeschrieben werden. Bitte lade die Seite neu.";
            } else {
                balance = newBalance;
                const how = game.winText ? `${game.winText} – ` : "";
                view.result.textContent = `${how}${chf(win)} gewonnen!`;
            }
        } else {
            view.result.textContent = "Leider kein Gewinn.";
        }

        showBalance();
        updateGameButtons();
    }

    function updateGameButtons() {
        const finished = !game || game.finished;
        view.revealAll.disabled = finished;
        view.buyAgain.disabled = !finished || busy || !game
            || balance === null || balance < game.ticket.price;
        view.backToShop.disabled = !finished || busy;
    }

    function backToShop() {
        game = null;
        view.game.hidden = true;
        view.shop.hidden = false;
        renderShop();
    }

    view.revealAll.addEventListener("click", revealAll);
    view.buyAgain.addEventListener("click", () => buy(game.ticket));
    view.backToShop.addEventListener("click", backToShop);

    async function init() {
        renderShop();
        balance = await loadServerBalance();
        if (balance === null) {
            view.shopMessage.textContent =
                "Das Guthaben konnte nicht geladen werden. Bitte lade die Seite neu.";
        }
        showBalance();
    }

    init();
}
