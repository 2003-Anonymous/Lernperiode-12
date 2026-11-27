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
            { symbol: "⭐", amount: 500, chance: 0.003 },
            { symbol: "💎", amount: 150, chance: 0.01 },
            { symbol: "🔔", amount: 60, chance: 0.03 },
            { symbol: "🍒", amount: 30, chance: 0.08 },
            { symbol: "🍋", amount: 12, chance: 0.25 }
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
            { label: "", amount: 0, weight: 88 },
            { label: "5 CHF", amount: 5, weight: 10 },
            { label: "10 CHF", amount: 10, weight: 4 },
            { label: "50 CHF", amount: 50, weight: 0.25 }
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
            { label: "+5", amount: 5, weight: 24 },
            { label: "+10", amount: 10, weight: 14 },
            { label: "+30", amount: 30, weight: 3 },
            { label: "−10", amount: -10, weight: 23 },
            { label: "−25", amount: -25, weight: 4 }
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

    const SCRATCH_THRESHOLD = 0.9;
    const MODE_KEY = "casinoRoyalScratchMode";

    const view = {
        shop: $("shop"),
        game: $("game"),
        list: $("ticket-list"),
        shopMessage: $("shop-message"),
        balance: $("balance"),
        title: $("ticket-title"),
        smallName: $("ticket-name-small"),
        rules: $("ticket-rules"),
        grid: $("grid"),
        progress: $("progress"),
        currentWin: $("current-win"),
        result: $("result"),
        revealAll: $("reveal-all"),
        buyAgain: $("buy-again"),
        backToShop: $("back-to-shop"),
        scratchMode: $("scratch-mode"),
        modeHint: $("mode-hint")
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

    // ---------- Shop ----------

    function element(tag, className, text) {
        const el = document.createElement(tag);
        if (className) {
            el.className = className;
        }
        if (text !== undefined) {
            el.textContent = text;
        }
        return el;
    }

    function topPrize(ticket) {
        if (ticket.type === "match3") {
            return Math.max(...ticket.prizes.map(p => p.amount));
        }
        const best = Math.max(...ticket.values.map(v => v.amount));
        return best * ticket.fields;
    }

    function renderShop() {
        view.list.replaceChildren(...TICKETS.map(ticket => {
            const card = element("article", "ticket-card");
            card.dataset.ticket = ticket.id;

            const face = element("div", "ticket-face");
            face.append(
                element("span", "ticket-face-name", ticket.name),
                element("span", "ticket-face-price", chf(ticket.price))
            );

            const body = element("div", "ticket-body");
            const info = element("ul", "ticket-facts");
            info.append(
                element("li", "", `${ticket.fields} Felder`),
                element("li", "", `bis ${chf(topPrize(ticket))}`)
            );

            const button = element("button", "btn btn-primary", `Kaufen · ${chf(ticket.price)}`);
            button.type = "button";
            button.disabled = busy || balance === null || balance < ticket.price;
            button.addEventListener("click", () => buy(ticket));

            body.append(
                element("h3", "", ticket.name),
                element("p", "", ticket.description),
                info,
                button
            );

            card.append(face, body);
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
        view.result.classList.remove("win");
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

        view.game.dataset.ticket = ticket.id;
        view.title.textContent = ticket.name;
        view.smallName.textContent = `${ticket.name} · ${chf(ticket.price)}`;
        view.rules.replaceChildren(...rulesFor(ticket));
        view.grid.style.gridTemplateColumns = `repeat(${ticket.columns}, minmax(0, 1fr))`;

        view.grid.replaceChildren(...game.cells.map((cell, index) => {
            const field = element("div", "field");
            const value = element("span", "field-value", cell.label || "–");
            if (cell.amount < 0) {
                field.classList.add("minus");
            }
            if (!cell.label) {
                field.classList.add("empty");
            }
            field.append(value);
            return field;
        }));

        view.shop.hidden = true;
        view.game.hidden = false;
        game.cells.forEach((_, index) => addCover(index));

        view.result.textContent = "";
        view.result.classList.remove("win");
        updateProgress();
        updateGameButtons();
        window.scrollTo({ top: 0 });
    }

    function rulesFor(ticket) {
        const intro = element("p", "", ticket.description);
        const list = element("ul", "");

        if (ticket.type === "match3") {
            list.append(...ticket.prizes.map(p => {
                const item = element("li");
                item.append(element("span", "", `3× ${p.symbol}`), element("strong", "", chf(p.amount)));
                return item;
            }));
        } else {
            list.append(...ticket.values.filter(v => v.amount !== 0).map(v => {
                const item = element("li");
                item.append(
                    element("span", "", v.amount < 0 ? "Minusfeld" : "Gewinnfeld"),
                    element("strong", v.amount < 0 ? "minus-text" : "", v.label)
                );
                return item;
            }));
        }

        return [intro, list];
    }


    function scratchModeOn() {
        return view.scratchMode.checked;
    }

    function addCover(index) {
        const field = view.grid.children[index];
        field.querySelector(".cover")?.remove();

        if (scratchModeOn()) {
            field.append(createScratchCover(index, field));
        } else {
            const cover = element("button", "cover cover-click", "?");
            cover.type = "button";
            cover.setAttribute("aria-label", `Feld ${index + 1} aufdecken`);
            cover.addEventListener("click", () => reveal(index));
            field.append(cover);
        }
    }

    function createScratchCover(index, field) {
        const canvas = element("canvas", "cover cover-scratch");
        canvas.setAttribute("aria-label", `Feld ${index + 1} freirubbeln`);
        canvas.setAttribute("role", "img");

        const ratio = window.devicePixelRatio || 1;
        const width = field.clientWidth || 120;
        const height = field.clientHeight || 90;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);

        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#d9dcdf");
        gradient.addColorStop(0.5, "#a9afb4");
        gradient.addColorStop(1, "#cfd3d6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#6f767b";
        ctx.font = `600 ${Math.round(12 * ratio)}px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("RUBBELN", canvas.width / 2, canvas.height / 2);

        const brush = Math.max(14, width * 0.2) * ratio;
        let drawing = false;
        let last = null;
        let moves = 0;

        function point(event) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (event.clientX - rect.left) * (canvas.width / rect.width),
                y: (event.clientY - rect.top) * (canvas.height / rect.height)
            };
        }

        function scratch(to) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = brush;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo((last ?? to).x, (last ?? to).y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            last = to;
        }

        function scratchedShare() {
            // Rand von 8 % ignorieren, damit niemand die Ecken suchen muss
            const marginX = Math.floor(canvas.width * 0.08);
            const marginY = Math.floor(canvas.height * 0.08);
            const w = canvas.width - 2 * marginX;
            const h = canvas.height - 2 * marginY;
            const data = ctx.getImageData(marginX, marginY, w, h).data;
            let clear = 0;
            let total = 0;
            for (let i = 3; i < data.length; i += 4 * 8) {
                total++;
                if (data[i] < 40) {
                    clear++;
                }
            }
            return total === 0 ? 1 : clear / total;
        }

        function check() {
            if (!game || game.revealed[index]) {
                return;
            }
            if (scratchedShare() >= SCRATCH_THRESHOLD) {
                reveal(index);
            }
        }

        canvas.addEventListener("pointerdown", event => {
            if (!game || game.finished) {
                return;
            }
            drawing = true;
            last = null;
            canvas.setPointerCapture(event.pointerId);
            scratch(point(event));
        });

        canvas.addEventListener("pointermove", event => {
            if (!drawing) {
                return;
            }
            scratch(point(event));
            moves++;
            if (moves % 6 === 0) {
                check();
            }
        });

        function stop() {
            if (!drawing) {
                return;
            }
            drawing = false;
            last = null;
            check();
        }

        canvas.addEventListener("pointerup", stop);
        canvas.addEventListener("pointercancel", stop);

        return canvas;
    }

    function updateModeHint() {
        // Im Rubbelmodus muss wirklich gerubbelt werden
        view.revealAll.hidden = scratchModeOn();
        view.modeHint.textContent = scratchModeOn()
            ? `Rubble mit gedrückter Maustaste (oder dem Finger). Ab ${Math.round(SCRATCH_THRESHOLD * 100)} % öffnet sich das Feld.`
            : "Klicke auf ein Feld, um es aufzudecken.";
    }

    view.scratchMode.addEventListener("change", () => {
        try {
            localStorage.setItem(MODE_KEY, scratchModeOn() ? "1" : "0");
        } catch {
            // Speichern ist nur eine Bequemlichkeit
        }
        updateModeHint();
        if (game && !game.finished) {
            game.revealed.forEach((open, index) => {
                if (!open) {
                    addCover(index);
                }
            });
        }
    });

    // ---------- Aufdecken und Auswerten ----------

    function reveal(index) {
        if (!game || game.finished || game.revealed[index]) {
            return;
        }

        const cell = game.cells[index];
        game.revealed[index] = true;
        game.win = applyReveal(game.ticket, game.win, cell);

        const field = view.grid.children[index];
        field.querySelector(".cover")?.remove();
        field.classList.add("open");

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
                view.result.classList.add("win");
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
        try {
            view.scratchMode.checked = localStorage.getItem(MODE_KEY) === "1";
        } catch {
            view.scratchMode.checked = false;
        }
        updateModeHint();
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
