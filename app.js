const ws = new WebSocket("ws://localhost:8080");

let currentPlayer = 'A';
let playerASelection = [];
let playerBSelection = [];
let playerACharacters = [];
let playerBCharacters = [];
const boardSize = 5;

function selectCharacter(character) {
    const selectedCharacters = currentPlayer === 'A' ? playerASelection : playerBSelection;
    if (selectedCharacters.length < 5) {
        selectedCharacters.push(character);
        updateSelectionDisplay();
    }
}

function submitSelection(player) {
    if (player === 'A') {
        playerACharacters = [...playerASelection];
        document.getElementById('playerASelection').style.display = 'none';
        document.getElementById('playerBSelection').style.display = 'block';
        document.getElementById('startSelectionA').style.display = 'none';
        document.getElementById('startSelectionB').style.display = 'block';
    } else if (player === 'B') {
        playerBCharacters = [...playerBSelection];
        document.getElementById('playerBSelection').style.display = 'none';
        startGame();
    }
}

function startSelectionForPlayer(player) {
    if (player === 'A') {
        document.getElementById('playerASelection').style.display = 'block';
        document.getElementById('playerBSelection').style.display = 'none';
        document.getElementById('startSelectionA').style.display = 'none';
    } else if (player === 'B') {
        document.getElementById('playerBSelection').style.display = 'block';
        document.getElementById('startSelectionB').style.display = 'none';
    }
}

function updateSelectionDisplay() {
    document.getElementById('selectedCharactersA').textContent = 'Selected: ' + playerASelection.join(', ');
    document.getElementById('selectedCharactersB').textContent = 'Selected: ' + playerBSelection.join(', ');
}

function startGame() {
    document.getElementById('gameBoard').innerHTML = '';
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        document.getElementById('gameBoard').appendChild(cell);
    }
    placeCharacters();
    document.getElementById('gameEndMessage').style.display = 'none';
    document.getElementById('status').textContent = `Player ${currentPlayer}'s Turn`;
}

function placeCharacters() {
    const cells = document.querySelectorAll('.cell');
    playerACharacters.forEach((character, index) => {
        const cellIndex = index; // Place on the first row
        cells[cellIndex].textContent = `A-${character}`;
        cells[cellIndex].dataset.character = `A-${character}`;
    });
    playerBCharacters.forEach((character, index) => {
        const cellIndex = boardSize * boardSize - 1 - index; // Place on the last row
        cells[cellIndex].textContent = `B-${character}`;
        cells[cellIndex].dataset.character = `B-${character}`;
    });
}

function handleCellClick(index) {
    const cell = document.querySelector(`.cell[data-index='${index}']`);
    const character = cell.dataset.character;
    if (character) {
        const move = prompt(`Player ${currentPlayer}, enter your move for ${character}`);
        if (validateMove(character, move)) {
            executeMove(character, move, index);
        } else {
            alert('Invalid move! Please try again.');
        }
    }
}

function validateMove(character, move) {
    // Basic validation for moves; you may need to expand this based on game rules
    return move && ['L', 'R', 'F', 'B', 'FL', 'FR', 'BL', 'BR'].includes(move);
}

function executeMove(character, move, index) {
    const cells = document.querySelectorAll('.cell');
    let newIndex = index;
    switch (move) {
        case 'L':
            newIndex = index - 1;
            break;
        case 'R':
            newIndex = index + 1;
            break;
        case 'F':
            newIndex = index - boardSize;
            break;
        case 'B':
            newIndex = index + boardSize;
            break;
        case 'FL':
            newIndex = index - boardSize - 1;
            break;
        case 'FR':
            newIndex = index - boardSize + 1;
            break;
        case 'BL':
            newIndex = index + boardSize - 1;
            break;
        case 'BR':
            newIndex = index + boardSize + 1;
            break;
    }

    if (newIndex >= 0 && newIndex < boardSize * boardSize) {
        const targetCell = cells[newIndex];
        const targetCharacter = targetCell.dataset.character;

        if (!targetCharacter || !targetCharacter.startsWith(currentPlayer)) {
            targetCell.textContent = character;
            targetCell.dataset.character = character;
            cell.textContent = '';
            cell.dataset.character = '';
            checkForWin();
            switchPlayer();
        } else {
            alert('Invalid move! Target cell occupied by friendly character.');
        }
    } else {
        alert('Invalid move! Out of bounds.');
    }
}

function checkForWin() {
    const cells = document.querySelectorAll('.cell');
    const playerAHasCharacters = Array.from(cells).some(cell => cell.dataset.character.startsWith('A-'));
    const playerBHasCharacters = Array.from(cells).some(cell => cell.dataset.character.startsWith('B-'));

    if (!playerAHasCharacters) {
        endGame('B');
    } else if (!playerBHasCharacters) {
        endGame('A');
    }
}

function endGame(winner) {
    document.getElementById('winnerMessage').textContent = `Player ${winner} wins!`;
    document.getElementById('gameEndMessage').style.display = 'block';
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
    document.getElementById('currentPlayer').textContent = `Player ${currentPlayer}'s Turn`;
}

function startAgain() {
    playerASelection = [];
    playerBSelection = [];
    playerACharacters = [];
    playerBCharacters = [];
    currentPlayer = 'A';
    document.getElementById('gameEndMessage').style.display = 'none';
    document.getElementById('startSelectionA').style.display = 'block';
    document.getElementById('startSelectionB').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');

    // Generate 5x5 grid
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        gameBoard.appendChild(cell);
    }
});
