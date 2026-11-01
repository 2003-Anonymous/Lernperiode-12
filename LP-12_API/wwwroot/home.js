

let balance = 1000;


function updateBalance() {
    document.getElementById("balance").textContent = balance;
}


function selectGame(gameName) {
    const message = document.getElementById("game-message");

    message.textContent =
        "Du hast " + gameName + " ausgewählt. Das Spiel wird später integriert.";
}


updateBalance();
