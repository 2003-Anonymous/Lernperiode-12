
"use strict";

const startButton = document.getElementById("startButton");
const betSelect = document.getElementById("bet");
const bombsSelect = document.getElementById("bombs");
const gameHint = document.getElementById("gameHint");
const multiplier = document.getElementById("multiplier");
const gameBoard = document.querySelector(".game-board");
const tiles = document.querySelectorAll(".tile");

let board = [];
let bombPositions = [];
let gameActive = false;
let currentBet = 0;
let bombCount = 0;

function generateBoard() {
    board = Array(tiles.length).fill("diamond");
    bombPositions = [];

    while (bombPositions.length < bombCount) {
        const randomPosition = Math.floor(Math.random() * tiles.length);

        if (!bombPositions.includes(randomPosition)) {
            bombPositions.push(randomPosition);
            board[randomPosition] = "bomb";
        }
    }
}

function resetBoard() {
    tiles.forEach(tile => {
        tile.textContent = "";
        tile.classList.remove("diamond", "bomb", "revealed");
    });

    multiplier.textContent = "1.00×";
}

function startGame() {
    currentBet = Number(betSelect.value);
    bombCount = Number(bombsSelect.value);

    resetBoard();
    generateBoard();

    gameActive = true;

    gameBoard.classList.add("active");
    startButton.textContent = "NEUE RUNDE STARTEN";

    gameHint.textContent =
        "Spiel gestartet! " + bombCount + " Bomben wurden versteckt.";

    console.log("Einsatz:", currentBet + " CHF");
    console.log("Bombenanzahl:", bombCount);
    console.log("Bombenpositionen:", bombPositions);
    console.log("Spielfeld:", board);
}

startButton.addEventListener("click", startGame);
