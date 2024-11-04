import { useState, useEffect } from 'react';

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

// Define piece movements
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

function getLineMoves(board, piece, fromX, fromY, isRookOnly) {
  const directions = isRookOnly
    ? [[0, 1], [1, 0], [0, -1], [-1, 0]]
    : [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  if (!isRookOnly) {
    directions.push([0, 1], [1, 0], [0, -1], [-1, 0]);
  }

  let moves = [];
  directions.forEach(([dx, dy]) => {
    for (let i = 1; i < 8; i++) {
      const x = fromX + dx * i;
      const y = fromY + dy * i;
      if (x < 0 || x >= 8 || y < 0 || y >= 8) break;
      if (board[y][x] === " ") {
        moves.push([x, y]);
      } else {
        if (isOpponentPiece(board[y][x], piece)) {
          moves.push([x, y]);
        }
        break;
      }
    }
  });

  return moves;
}

function getPossibleMoves(board, piece, fromX, fromY) {
  const pieceMovement = pieceMovements[piece];
  if (!pieceMovement) return [];

  const movement = pieceMovement.moves;
  const captureMoves = pieceMovement.captureMoves || [];
  let moves = [];

  // For rooks, bishops, and queens, get line moves
  if (movement === "rook" || movement === "bishop" || movement === "rookAndBishop") {
    moves = getLineMoves(board, piece, fromX, fromY, movement === "rook");
  } else {
    // For all other pieces (knights, kings, etc.), apply basic moves
    moves = movement.map(([dx, dy]) => [fromX + dx, fromY + dy]);

    // For pawns, we need to handle capture moves differently
    if (piece === "p" || piece === "P") {
      // Add forward moves (only if the square is empty)
      moves = moves.filter(([x, y]) => x >= 0 && x < 8 && y >= 0 && y < 8 && board[y][x] === " ");

      // Add capture moves (only if an opponent's piece is diagonally in front)
      captureMoves.forEach(([dx, dy]) => {
        const x = fromX + dx;
        const y = fromY + dy;
        if (
          x >= 0 &&
          x < 8 &&
          y >= 0 &&
          y < 8 &&
          board[y][x] !== " " &&
          isOpponentPiece(board[y][x], piece)
        ) {
          moves.push([x, y]);
        }
      });
    } else {
      // For non-pawn pieces, allow regular movement (within board boundaries and capturing opponents)
      moves = moves.filter(([x, y]) =>
        x >= 0 &&
        x < 8 &&
        y >= 0 &&
        y < 8 &&
        (board[y][x] === " " || isOpponentPiece(board[y][x], piece))
      );
    }
  }

  return moves;
}


// Main component
export default function ChessBoard() {
  const [board, setBoard] = useState(initialBoard);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState("white");

  useEffect(() => {
    renderBoard();
  }, [board, highlightedSquares]);

  function handleSquareClick(x, y) {
    const piece = board[y][x];
    
    if (selectedPiece) {
      const [fromX, fromY] = selectedPiece.position;
      
      if (highlightedSquares.some(([hx, hy]) => hx === x && hy === y)) {
        const newBoard = board.map(row => [...row]);
        newBoard[y][x] = selectedPiece.piece;
        newBoard[fromY][fromX] = " ";
        
        setBoard(newBoard);
        setSelectedPiece(null);
        setHighlightedSquares([]);
        setTurn(turn === "white" ? "black" : "white");
      } else {
        setSelectedPiece(null);
        setHighlightedSquares([]);
      }
    } else if ((turn === "white" && isWhitePiece(piece)) || (turn === "black" && !isWhitePiece(piece))) {
      setSelectedPiece({ piece, position: [x, y] });
      setHighlightedSquares(getPossibleMoves(board, piece, x, y));
    }
  }

  function renderBoard() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 50px)", gap: "1px" }}>
        {board.map((row, y) =>
          row.map((piece, x) => (
            <div
              key={`${x}-${y}`}
              onClick={() => handleSquareClick(x, y)}
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: (x + y) % 2 === 0 ? "white" : "gray",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                border: highlightedSquares.some(([hx, hy]) => hx === x && hy === y)
                  ? "2px solid yellow"
                  : "1px solid black"
              }}
            >
              {piece && (
                <span style={{ fontSize: "24px", pointerEvents: "none" }}>
                  {piece}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  return <div>{renderBoard()}</div>;
}
