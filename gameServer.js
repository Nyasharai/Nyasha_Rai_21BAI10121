const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let gameState = {
    board: [
        ['P1', 'H1', 'H2', 'P1', 'P1'], // Player 1's characters
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
        ['P2', 'H2', 'H1', 'P2', 'P2'], // Player 2's characters
    ],
    currentPlayer: 'Player1',
    players: {
        Player1: ['P1', 'H1', 'H2', 'P1', 'P1'],
        Player2: ['P2', 'H2', 'H1', 'P2', 'P2']
    },
    gameOver: false
};

function resetGameState() {
    gameState = {
        board: [
            ['P1', 'H1', 'H2', 'P1', 'P1'],
            [' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' '],
            ['P2', 'H2', 'H1', 'P2', 'P2'],
        ],
        currentPlayer: 'Player1',
        players: {
            Player1: ['P1', 'H1', 'H2', 'P1', 'P1'],
            Player2: ['P2', 'H2', 'H1', 'P2', 'P2']
        },
        gameOver: false
    };
}

// Function for movement
function movePawn(startX, startY, endX, endY, player) {
    if (isValidMove(startX, startY, endX, endY, player)) {
        updateBoard(startX, startY, endX, endY, player);
        return true;
    }
    return false;
}

function moveHero1(startX, startY, endX, endY, player) {
    if (isValidMove(startX, startY, endX, endY, player) && Math.abs(endX - startX) <= 2) {
        updateBoard(startX, startY, endX, endY, player);
        return true;
    }
    return false;
}

function moveHero2(startX, startY, endX, endY, player) {
    if (isValidMove(startX, startY, endX, endY, player) && Math.abs(endX - startX) <= 2 && Math.abs(endY - startY) <= 2) {
        updateBoard(startX, startY, endX, endY, player);
        return true;
    }
    return false;
}

function moveHero3(startX, startY, endX, endY, player) {
    const deltaX = Math.abs(endX - startX);
    const deltaY = Math.abs(endY - startY);

    if (isValidMove(startX, startY, endX, endY, player) && 
        ((deltaX === 2 && deltaY === 1) || (deltaX === 1 && deltaY === 2))) {
        updateBoard(startX, startY, endX, endY, player);
        return true;
    }
    return false;
}

// Validate moves
function isValidMove(startX, startY, endX, endY, player) {
    if (endX < 0 || endX >= 5 || endY < 0 || endY >= 5) return false;
    if (!gameState.board[startX][startY].startsWith(player[0])) return false;
    if (gameState.board[endX][endY].startsWith(player[0])) return false;
    return true;
}

// Update game state
function updateBoard(startX, startY, endX, endY, player) {
    if (gameState.board[endX][endY] !== ' ') {
        console.log(`${player} captured ${gameState.board[endX][endY]}`);
        removeCharacter(endX, endY);
    }

    gameState.board[endX][endY] = gameState.board[startX][startY];
    gameState.board[startX][startY] = ' ';

    if (checkGameOver()) {
        gameState.gameOver = true;
        console.log(`${player} wins!`);
    }

    gameState.currentPlayer = gameState.currentPlayer === 'Player1' ? 'Player2' : 'Player1';
}

function removeCharacter(x, y) {
    const piece = gameState.board[x][y];
    const player = piece.startsWith('P1') ? 'Player1' : 'Player2';
    gameState.players[player] = gameState.players[player].filter(p => p !== piece);
}

function checkGameOver() {
    return gameState.players.Player1.length === 0 || gameState.players.Player2.length === 0;
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        let move;
        try {
            move = JSON.parse(message);
        } catch (e) {
            ws.send(JSON.stringify({ error: 'Invalid JSON format' }));
            return;
        }

        let success = false;
        if (!gameState.gameOver && gameState.currentPlayer === move.player) {
            const piece = gameState.board[move.startX][move.startY];
            if (piece === 'P1' || piece === 'P2') {
                success = movePawn(move.startX, move.startY, move.endX, move.endY, move.player);
            } else if (piece === 'H1') {
                success = moveHero1(move.startX, move.startY, move.endX, move.endY, move.player);
            } else if (piece === 'H2') {
                success = moveHero2(move.startX, move.startY, move.endX, move.endY, move.player);
            } else if (piece === 'H3') {
                success = moveHero3(move.startX, move.startY, move.endX, move.endY, move.player);
            }
        }

        if (success) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(gameState));
                }
            });
        } else {
            ws.send(JSON.stringify({ error: 'Invalid move' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server running on ws://localhost:8080');
