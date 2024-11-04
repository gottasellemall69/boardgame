// game.js

// Define initial board setup for Shogi
const initialBoardSetup = [
    ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L'],
    [' ', 'R', ' ', ' ', ' ', ' ', ' ', 'B', ' '],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [' ', 'b', ' ', ' ', ' ', ' ', ' ', 'r', ' '],
    ['l', 'n', 's', 'g', 'k', 'g', 's', 'n', 'l'],
];

let board = JSON.parse(JSON.stringify(initialBoardSetup));
let currentPlayer = 'player';

// Set up HTML elements for the board
const boardElement = document.getElementById('board');

// Render the board
function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((row, y) => {
        row.forEach((piece, x) => {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.x = x;
            square.dataset.y = y;
            square.textContent = piece;
            square.addEventListener('click', () => selectPiece(x, y));
            boardElement.appendChild(square);
        });
    });
}

// Select piece logic
let selectedPiece = null;
function selectPiece(x, y) {
    if (selectedPiece) {
        movePiece(selectedPiece.x, selectedPiece.y, x, y);
        selectedPiece = null;
    } else if (board[y][x] !== ' ') {
        selectedPiece = { x, y };
    }
}

// Check for promotion and apply if necessary
function checkPromotion(piece, x, y) {
    const inOpponentZone = (currentPlayer === 'player' && y < 3) || (currentPlayer === 'opponent' && y > 5);
    if (pieceMovements[piece].promotable && inOpponentZone) {
        return confirm("Promote this piece?") ? promote(piece) : piece;
    }
    return piece;
}

// Promote a piece by returning its promoted form
function promote(piece) {
    const promotionMap = { 'P': 'P+', 'L': 'L+', 'N': 'N+', 'S': 'S+' }; // Define promotions
    return promotionMap[piece] || piece;
}


function selectSquare(x, y) {
    const selectedPiece = board[y][x];
    if ((currentPlayer === 'player' && selectedPiece === selectedPiece.toUpperCase()) ||
        (currentPlayer === 'opponent' && selectedPiece === selectedPiece.toLowerCase())) {
        document.addEventListener('click', event => handleMove(x, y), { once: true });
    }
}

function handleMove(fromX, fromY) {
    document.addEventListener('click', event => {
        const [toX, toY] = getBoardCoordinates(event);
        movePiece(fromX, fromY, toX, toY);
    }, { once: true });
}

// Update movePiece to handle promotion
function movePiece(fromX, fromY, toX, toY) {
    let piece = board[fromY][fromX];
    if (isValidMove(piece, fromX, fromY, toX, toY)) {
        // Store original board state
        const originalState = board[toY][toX];

        // Execute move temporarily
        board[toY][toX] = piece;
        board[fromY][fromX] = ' ';

        // Verify the move does not place king in check
        if (!isKingInCheck(currentPlayer)) {
            // Finalize move and handle promotion/capture
            piece = checkPromotion(piece, toX, toY);
            if (originalState !== ' ') capturePiece(originalState);

            // Switch turns and render board
            switchTurn();
            renderBoard();
        } else {
            // Revert if move results in check
            board[toY][toX] = originalState;
            board[fromY][fromX] = piece;
            alert("Invalid move: King would be in check.");
        }
    }
}

// Check if the current player's king is in check
function isKingInCheck(player) {
    const king = player === 'player' ? 'K' : 'k';
    let kingPos = null;

    // Find king position
    board.forEach((row, y) => row.forEach((cell, x) => {
        if (cell === king) kingPos = { x, y };
    }));

    return kingPos && isSquareUnderAttack(kingPos.x, kingPos.y, player);
}

function isSquareUnderAttack(x, y, player) {
    // Simulate if the position (x, y) is under attack by the opponent's pieces
    const opponent = player === 'player' ? 'opponent' : 'player';

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = board[row][col];
            if (isOpponentPiece(piece, opponent) && isValidMove(piece, col, row, x, y)) {
                return true;
            }
        }
    }
    return false;
}

function isOpponentPiece(piece, opponent) {
    return opponent === 'player' ? piece.toLowerCase() === piece : piece.toUpperCase() === piece;
}

// Select a captured piece for drop
function selectDropPiece(piece) {
    if (currentPlayer === 'player' && capturedPieces.player.includes(piece)) {
        document.addEventListener('click', (event) => {
            const [x, y] = getBoardCoordinates(event); // Assume getBoardCoordinates fetches board x, y
            if (board[y][x] === ' ' && isValidDrop(piece, x, y)) {
                dropPiece(piece, x, y);
            }
        }, { once: true });
    }
}

// Handle piece drop
function dropPiece(piece, x, y) {
    board[y][x] = piece;
    capturedPieces[currentPlayer] = capturedPieces[currentPlayer].filter(p => p !== piece);
    switchTurn();
    renderBoard();
}

function isValidDrop(piece, x, y) {
    // Basic rules for dropping (no two pawns in same column, etc.)
    return true;
}

function checkForCheckmate() {
    if (!hasLegalMoves(currentPlayer)) {
        alert(`${currentPlayer === 'player' ? 'Opponent' : 'Player'} wins by checkmate!`);
        resetGame();
    }
}

const pieceMovements = {
    P: { moves: [[0, -1]], promotable: true }, // Pawn (up 1 step, promotable)
    L: { moves: [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7]], promotable: true }, // Lance (forward steps)
    N: { moves: [[1, -2], [-1, -2]], promotable: true }, // Knight (jump)
    S: { moves: [[0, -1], [1, -1], [-1, -1], [1, 1], [-1, 1]], promotable: true }, // Silver
    G: { moves: [[0, -1], [1, 0], [-1, 0], [0, 1], [1, -1], [-1, -1]], promotable: false }, // Gold
    K: { moves: [[0, -1], [1, 0], [-1, 0], [0, 1], [1, -1], [-1, -1], [1, 1], [-1, 1]], promotable: false }, // King
    R: { moves: "rook", promotable: true }, // Rook (straight line movement)
    B: { moves: "bishop", promotable: true } // Bishop (diagonal line movement)
};

// Check if move is valid based on piece type
function isValidMove(piece, fromX, fromY, toX, toY) {
    if (!pieceMovements[piece]) return false; // Ensure piece has movement defined
    const movement = pieceMovements[piece].moves;

    // Handle rook and bishop special movement patterns
    if (movement === "rook" || movement === "bishop") {
        return isValidLineMove(piece, fromX, fromY, toX, toY, movement === "rook");
    }

    return movement.some(([dx, dy]) => fromX + dx === toX && fromY + dy === toY);
}

// Validate line moves (e.g., for Rook and Bishop)
function isValidLineMove(piece, fromX, fromY, toX, toY, isRook) {
    const dx = toX - fromX;
    const dy = toY - fromY;

    // Rooks move along rows/columns; bishops along diagonals
    if (isRook ? (dx === 0 || dy === 0) : Math.abs(dx) === Math.abs(dy)) {
        const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
        const stepY = dy === 0 ? 0 : dy / Math.abs(dy);
        for (let i = 1; i < Math.abs(dx || dy); i++) {
            if (board[fromY + i * stepY][fromX + i * stepX] !== ' ') return false; // Blocked path
        }
        return true;
    }
    return false;
}

let capturedPieces = { player: [], opponent: [] };

// Capture a piece and store it
function capturePiece(piece) {
    const owner = currentPlayer === 'player' ? 'opponent' : 'player';
    capturedPieces[owner].push(piece.toLowerCase());
    renderCapturedPieces();
}

// Render captured pieces in the captured pieces area
function renderCapturedPieces() {
    const playerDiv = document.getElementById('player-captured');
    const opponentDiv = document.getElementById('opponent-captured');

    playerDiv.innerHTML = 'Player\'s Captured Pieces: ';
    opponentDiv.innerHTML = 'Opponent\'s Captured Pieces: ';

    capturedPieces.player.forEach(piece => {
        const pieceEl = document.createElement('span');
        pieceEl.textContent = piece;
        pieceEl.onclick = () => selectDropPiece(piece);
        playerDiv.appendChild(pieceEl);
    });

    capturedPieces.opponent.forEach(piece => {
        const pieceEl = document.createElement('span');
        pieceEl.textContent = piece;
        opponentDiv.appendChild(pieceEl);
    });
}



// Check if player has any legal moves
function hasLegalMoves(player) {
    const pieces = findPlayerPieces(player);
    for (const { piece, x, y } of pieces) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const toX = x + dx, toY = y + dy;
                if (isValidMove(piece, x, y, toX, toY) && !isKingInCheckAfterMove(player, x, y, toX, toY)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Simulate if the king would be in check after moving
function isKingInCheckAfterMove(player, fromX, fromY, toX, toY) {
    const tempPiece = board[toY][toX];
    board[toY][toX] = board[fromY][fromX];
    board[fromY][fromX] = ' ';
    const inCheck = isKingInCheck(player);
    board[fromY][fromX] = board[toY][toX];
    board[toY][toX] = tempPiece;
    return inCheck;
}

// Find all pieces belonging to the current player
function findPlayerPieces(player) {
    const pieces = [];
    board.forEach((row, y) => row.forEach((cell, x) => {
        if ((player === 'player' && cell === cell.toUpperCase()) || (player === 'opponent' && cell === cell.toLowerCase())) {
            pieces.push({ piece: cell, x, y });
        }
    }));
    return pieces;
}



// Switch turns
function switchTurn() {
    currentPlayer = currentPlayer === 'player' ? 'opponent' : 'player';
}

// Reset game
document.getElementById('reset-game').addEventListener('click', () => {
    board = JSON.parse(JSON.stringify(initialBoardSetup));
    currentPlayer = 'player';
    renderBoard();
});

// Initial render
renderBoard();
