import { useState } from 'react';
export default function ChessBoard() {
// Define initial board setup
const initialBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " ", " ", " "],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"]
];

// Piece movement definitions
const pieceMovements = {
  p: { moves: [[0, 1]], captureMoves: [[-1, 1], [1, 1]] }, // Black pawn
  P: { moves: [[0, -1]], captureMoves: [[-1, -1], [1, -1]] }, // White pawn
  r: { moves: "rook" }, R: { moves: "rook" },
  n: { moves: [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]] },
  N: { moves: [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]] },
  b: { moves: "bishop" }, B: { moves: "bishop" },
  q: { moves: "rookAndBishop" }, Q: { moves: "rookAndBishop" },
  k: { moves: [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]] },
  K: { moves: [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]] }
};

// Utility functions
function isOpponentPiece(piece, selectedPiece) {
  return (piece.toLowerCase() !== selectedPiece.toLowerCase()) && 
         (isWhitePiece(piece) !== isWhitePiece(selectedPiece));
}

function isWhitePiece(piece) {
  return piece === piece.toUpperCase();
}

// Function to get possible moves for a piece
function getPossibleMoves(board, piece, fromX, fromY) {
  const moves = [];
  const isWhite = isWhitePiece(piece);
  const direction = isWhite ? -1 : 1; // White moves up (negative direction), Black moves down (positive direction)

  if (piece.toLowerCase() === "p") {
    // Pawn forward movement
    if (board[fromY + direction]?.[fromX] === " ") {
      moves?.push([fromX, fromY + direction]);
      // Allow double forward move if pawn is in starting position
      if ((isWhite && fromY === 6) || (!isWhite && fromY === 1)) {
        if (board[fromY + 2 * direction][fromX] === " ") {
          moves?.push([fromX, fromY + 2 * direction]);
        }
      }
    }

    // Pawn captures diagonally
    const captureMoves = pieceMovements[piece]?.captureMoves;
    captureMoves?.forEach(([dx, dy]) => {
      const newX = fromX + dx;
      const newY = fromY + dy * direction;
      if (
        newX >= 0 && newX < 8 && newY >= 0 && newY < 8 &&
        board[newY][newX] !== " " &&
        (isOpponentPiece(board[newY][newX], piece) || board[newY][newX].toLowerCase() === "p")
      ) {
        moves?.push([newX, newY]);
      }
    });

    // Removed the condition that allows the pawn to move forward one space if there is an opponent's piece diagonally in front of it
  } else {
    // Handle other pieces' moves
    const movement = pieceMovements[piece]?.moves;
    if (movement === "rook") {
      moves?.push(...getLineMoves(board, piece, fromX, fromY, true));
    } else if (movement === "bishop") {
      moves?.push(...getLineMoves(board, piece, fromX, fromY, false));
    } else if (movement === "rookAndBishop") {
      moves?.push(...getLineMoves(board, piece, fromX, fromY, true));
      moves?.push(...getLineMoves(board, piece, fromX, fromY, false));
    } else {
      movement?.forEach(([dx, dy]) => {
        const x = fromX + dx;
        const y = fromY + dy;
        if (x >= 0 && x < 8 && y >= 0 && y < 8 && (board[y][x] === " " || isOpponentPiece(board[y][x], piece))) {
          moves?.push([x, y]);
        }
      });
    }
  }
  return moves;
}
function getLineMoves(board, piece, fromX, fromY, isDiagonal) {
  const moves = [];
  const directions = isDiagonal 
    ? [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    : [[1, 0], [-1, 0], [0, 1], [0, -1]];

  directions.forEach(([dx, dy]) => {
    let x = fromX + dx;
    let y = fromY + dy;
    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      if (board[y][x] === " ") {
        moves?.push([x, y]);
      } else if (isOpponentPiece(board[y][x], piece)) {
        moves?.push([x, y]);
        break;
      } else break;
      x += dx;
      y += dy;
    }
  });
  return moves;
}

function leavesKingInCheck(board, from, to, piece) {
  const newBoard = board.map(row => [...row]);
  const [fromX, fromY] = from;
  const [toX, toY] = to;

  newBoard[toY][toX] = piece;
  newBoard[fromY][fromX] = " ";

  const kingPosition = findKingPosition(newBoard, isWhitePiece(piece) ? "K" : "k");
  return isSquareUnderAttack(newBoard, kingPosition, isWhitePiece(piece) ? "black" : "white");
}

function findKingPosition(board, king) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y][x] === king) {
        return [x, y];
      }
    }
  }
}

function isSquareUnderAttack(board, [x, y], opponentColor) {
  for (let j = 0; j < 8; j++) {
    for (let i = 0; i < 8; i++) {
      const piece = board[j][i];
      if (piece && ((opponentColor === "white" && isWhitePiece(piece)) || 
                    (opponentColor === "black" && !isWhitePiece(piece)))) {
        if (getPossibleMoves(board, piece, i, j).some(([moveX, moveY]) => moveX === x && moveY === y)) {
          return true;
        }
      }
    }
  }
  return false;
}


// Main component

  const [board, setBoard] = useState(initialBoard);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [captureMoves, setCaptureMoves] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState("white");

  function handleSquareClick(x, y) {
    const piece = board[y][x];
    
    if (selectedPiece) {
      const [fromX, fromY] = selectedPiece?.position;
      if (highlightedSquares?.find(([hx, hy]) => hx === x && hy === y)) {
        const newBoard = board?.map(row => [...row]);
        if (selectedPiece?.piece.toLowerCase() === "p" && captureMoves?.find((cx, cy) => cx === x && cy === y)) {
          newBoard[y][x] = selectedPiece?.piece;
          newBoard[fromY][fromX] = " ";
        } else {
          newBoard[y][x] = selectedPiece?.piece;
          newBoard[fromY][fromX] = " ";
        }

        if (!leavesKingInCheck(newBoard, [fromX, fromY], [x, y], selectedPiece?.piece)) {
          setBoard(newBoard);
          setSelectedPiece(null);
          setHighlightedSquares([]);
          setTurn(turn === "white" ? "black" : "white");
        } else {
          alert("This move would leave your king in check.");
        }
      } else {
        setSelectedPiece(null);
        setHighlightedSquares([]);
      }
    } else {
      if ((turn === "white" && piece === piece?.toUpperCase()) || (turn === "black" && piece === piece?.toLowerCase())) {
        setSelectedPiece({ position: [x, y], piece });
        const possibleMoves = getPossibleMoves(board, piece, x, y);
        setHighlightedSquares(possibleMoves);
        if (piece.toLowerCase() === "p") {
          setCaptureMoves(possibleMoves.find(([px, py]) => isOpponentPiece(board[py][px], piece)));
        } else {
          setCaptureMoves([]);
        }
      }
    }
  }

  return (
    <div>
      {board.map((row, y) => (
        <div key={y} style={{ display: 'flex' }}>
          {row.map((square, x) => (
            <div
              key={x}
              onClick={() => handleSquareClick(x, y)}
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: highlightedSquares?.some(([hx, hy]) => hx === x && hy === y) ? 'yellow' : (x + y) % 2 === 0 ? 'white' : 'gray',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {square}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
