import { useState } from "react";

export default function ShogiBoard() {
  // Define initial board setup for Shogi
  const initialBoard = [
    ["l", "n", "s", "g", "k", "g", "s", "n", "l"],
    [" ", "r", " ", " ", " ", " ", " ", "b", " "],
    ["p", "p", "p", "p", "p", "p", "p", "p", "p"],
    [" ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " "],
    ["P", "P", "P", "P", "P", "P", "P", "P", "P"],
    [" ", "B", " ", " ", " ", " ", " ", "R", " "],
    ["L", "N", "S", "G", "K", "G", "S", "N", "L"],
  ];

  // Shogi piece movement definitions
  const pieceMovements = {
    p: {
      moves: [[1, 0]], // Pawn can only move forward one square
      promotions: "g",
    }, // Black pawn
    P: {
      moves: [[0, -1]], // Pawn can only move forward one square
      promotions: "G",
    }, // White pawn
    l: {
      moves: "forward", // Lance can move any number of squares forward
      promotions: "g",
    },
    L: {
      moves: "forward",
      promotions: "G",
    },
    n: {
      moves: [
        [1, 2], // Knight's "L" shaped movement, only forward
        [-1, 2],
      ],
      promotions: "g",
    },
    N: {
      moves: [
        [1, 2],
        [-1, 2],
      ],
      promotions: "G",
    },
    s: {
      moves: [
        [1], // Silver General's movement
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ],
      promotions: "g",
    },
    S: {
      moves: [
        [0, -1],
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ],
      promotions: "G",
    },
    g: {
      moves: [
        [1], // Gold General's movement
        [1, 1],
        [1],
        [1, -1],
        [0, -1],
        [-1, 0],
      ],
    }, // Gold general
    G: {
      moves: [
        [0, -1],
        [1, -1],
        [1],
        [1, 1],
        [1],
        [-1, 0],
      ],
    },
    b: { moves: "diagonal", promotions: "h" }, // Bishop moves diagonally
    B: { moves: "diagonal", promotions: "H" },
    r: { moves: "orthogonal", promotions: "d" }, // Rook moves orthogonally
    R: { moves: "orthogonal", promotions: "D" },
    k: {
      moves: [
        [1], // King can move one square in any direction
        [1, 1],
        [1],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1],
      ],
    },
    K: {
      moves: [
        [0, -1],
        [1, -1],
        [1],
        [1, 1],
        [1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
      ],
    },
    h: { moves: "diagonalKing" }, // Promoted Bishop (Horse)
    H: { moves: "diagonalKing" },
    d: { moves: "orthogonalKing" }, // Promoted Rook (Dragon)
    D: { moves: "orthogonalKing" },
  };

  const [board, setBoard] = useState(initialBoard);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [captureMoves, setCaptureMoves] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState('');
  const [turn, setTurn] = useState("black");
  const [capturedPieces, setCapturedPieces] = useState({
    black: [],
    white: [],
  });

  function isOpponentPiece(piece, selectedPiece) {
    return (
      piece?.toLowerCase() !== selectedPiece?.toLowerCase() &&
      isWhitePiece(piece) !== isWhitePiece(selectedPiece)
    );
  }

  function isWhitePiece(piece) {
    return piece === piece?.toUpperCase();
  }

  function getPossibleMoves(board, piece, fromX, fromY, isDrop = false) {
    const moves = [];
    const isWhite = isWhitePiece(piece);
    const direction = isWhite ? -1 : 1; // White moves up, Black moves down

    const movement = pieceMovements[piece]?.moves;

    if (movement === "forward") {
      moves?.push(...getLineMoves(board, piece, fromX, fromY, 0, direction)); // Forward movement for Lance
    } else if (movement === "diagonal") {
      moves?.push(
        ...getLineMoves(board, piece, fromX, fromY, 1, direction) // Diagonal movement for Bishop
      );
      moves?.push(
        ...getLineMoves(board, piece, fromX, fromY, -1, direction)
      );
    } else if (movement === "orthogonal") {
      moves?.push(
        ...getLineMoves(board, piece, fromX, fromY, 0, 1) // Orthogonal movement for Rook
      );
      moves?.push(...getLineMoves(board, piece, fromX, fromY, 0, -1));
      moves?.push(...getLineMoves(board, piece, fromX, fromY, 1, 0));
      moves?.push(...getLineMoves(board, piece, fromX, fromY, -1, 0));
    } else if (movement === "diagonalKing") {
      moves?.push(...getKingMoves(board, piece, fromX, fromY, true));
    } else if (movement === "orthogonalKing") {
      moves?.push(...getKingMoves(board, piece, fromX, fromY, false));
    } else {
      movement?.forEach(([dx, dy]) => {
        const x = fromX + dx;
        const y = fromY + dy;

        if (
          x >= 0 &&
          x < 9 && // Shogi board is 9x9
          y >= 0 &&
          y < 9 &&
          (board[y][x] === " " || isOpponentPiece(board[y][x], piece)) &&
          (!isDrop || isValidDrop(piece, x, y, isWhite))
        ) {
          moves?.push([x, y]);
        }
      });
    }

    return moves;
  }

  function isValidDrop(piece, x, y, isWhite) {
    if (piece.toLowerCase() === "p") {
      // Pawns cannot be dropped on the last row
      if (isWhite && y === 0) {
        return false;
      } else if (!isWhite && y === 8) {
        return false;
      }
      // Pawns cannot be dropped in a column with another unpromoted pawn of the same player
      for (let i = 0; i < 9; i++) {
        if (
          (isWhite && board[i][x] === "P") ||
          (!isWhite && board[i][x] === "p")
        ) {
          return false;
        }
      }
    } else if (piece?.toLowerCase() === "l" || piece?.toLowerCase() === "n") {
      // Lances and Knights cannot be dropped on the last row
      if (isWhite && y === 0) {
        return false;
      } else if (!isWhite && y === 8) {
        return false;
      }
      if (piece?.toLowerCase() === "n") {
        // Knights cannot be dropped on the second to last row
        if (isWhite && y === 1) {
          return false;
        } else if (!isWhite && y === 7) {
          return false;
        }
      }
    }

    return true;
  }

  function getLineMoves(board, piece, fromX, fromY, dx, dy) {
    const moves = [];
    let x = fromX + dx;
    let y = fromY + dy;

    while (x >= 0 && x < 9 && y >= 0 && y < 9) {
      if (board[y][x] === " ") {
        moves?.push([x, y]);
      } else if (isOpponentPiece(board[y][x], piece)) {
        moves?.push([x, y]);
        break;
      } else {
        break;
      }
      x += dx;
      y += dy;
    }
    return moves;
  }

  function getKingMoves(board, piece, fromX, fromY, isDiagonal) {
    const moves = [];
    const directions = isDiagonal
      ? [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]
      : [
          [1],
          [-1, 0],
          [1],
          [0, -1],
        ];

    directions?.forEach(([dx, dy]) => {
      const x = fromX + dx;
      const y = fromY + dy;
      if (
        x >= 0 &&
        x < 9 &&
        y >= 0 &&
        y < 9 &&
        (board[y][x] === " " || isOpponentPiece(board[y][x], piece))
      ) {
        moves?.push([x, y]);
      }
    });

    return moves;
  }

  function handleSquareClick(x, y) {
    const piece = board[y][x];
    if (selectedPiece) {
      // If a piece is selected, attempt to move it
      const [fromX, fromY] = selectedPiece?.position;
      if (highlightedSquares?.find(([hx, hy]) => hx === x && hy === y)) {
        // If the clicked square is a valid move, move the piece
        movePiece(fromX, fromY, x, y);
      } else {
        // If the clicked square is not a valid move, deselect the piece
        setSelectedPiece(null);
        setHighlightedSquares([]);
        setCaptureMoves([]);
      }
    } else if (piece && isPlayerPiece(piece)) {
      // If no piece is selected and the clicked square contains a piece of the current player, select it
      setSelectedPiece({ position: [x, y], piece });
      setHighlightedSquares(getPossibleMoves(board, piece, x, y));
    }
  }

  function isPlayerPiece(piece) {
    // Determine if the piece belongs to the current player
    return (
      (turn === "white" && isWhitePiece(piece)) ||
      (turn === "black" && !isWhitePiece(piece))
    );
  }

  function movePiece(fromX, fromY, toX, toY) {
    // Create a new board with the piece moved
    const newBoard = board?.map((row) => [...row]);
    let piece = newBoard[fromY][fromX];

    // Capture the opponent's piece if present
    if (newBoard[toY][toX] !== " ") {
      capturePiece(newBoard[toY][toX]);
    }

    // Move the piece to the new location
    newBoard[toY][toX] = piece;
    newBoard[fromY][fromX] = " ";

    // Promote the piece if in the promotion zone and eligible
    if (shouldPromote(piece, toY)) {
      piece = promotePiece(piece);
      newBoard[toY][toX] = piece;
    }

    // Update the board state
    setBoard(newBoard);
    setSelectedPiece(null);
    setHighlightedSquares([]);
    setTurn(turn === "white" ? "black" : "white");
  }

  function capturePiece(piece) {
    // Add the captured piece to the appropriate player's captured pieces
    const player = isWhitePiece(piece) ? "black" : "white";
    setCapturedPieces((prev) => ({
      ...prev,
      [player]: [...prev[player], piece?.toLowerCase()],
    }));
  }

  function shouldPromote(piece, toY) {
    // Determine if the piece should be promoted based on its type and location
    const isWhite = isWhitePiece(piece);
    const promotionZone = isWhite ? [1, 2] : [3-5];
    const mustPromote =
      (piece?.toLowerCase() === "p" && (isWhite ? toY === 0 : toY === 8)) ||
      (piece?.toLowerCase() === "l" && (isWhite ? toY === 0 : toY === 8)) ||
      (piece?.toLowerCase() === "n" && (isWhite ? toY <= 1 : toY >= 7));

    return mustPromote || promotionZone?.includes(toY);
  }

  function promotePiece(piece) {
    const promotion = pieceMovements[piece]?.promotions;
    return isWhitePiece(piece) ? promotion?.toUpperCase() : promotion;
  }

  function handleDrop(piece, x, y) {
    const player = turn;
    const isWhite = player === "white";
    if (isValidDrop(piece, x, y, isWhite)) {
      const newBoard = board?.map((row) => [...row]);
      newBoard[y][x] = isWhite ? piece?.toUpperCase() : piece?.toLowerCase();
      setBoard(newBoard);
      setCapturedPieces((prev) => ({
        ...prev,
        [player]: prev[player]?.filter((p) => p !== piece?.toLowerCase()),
      }));
      setTurn(player === "white" ? "black" : "white");
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {" "}
        {/* Captured pieces display */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "450px",
            marginBottom: "10px",
          }}
        >
          <div>
            <h3>Black Captured Pieces</h3>
            <ul>
              {capturedPieces?.black.map((piece) => (
                <li key={piece}>{piece}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>White Captured Pieces</h3>
            <ul>
              {capturedPieces?.white.map((piece) => (
                <li key={piece}>{piece}</li>
              ))}
            </ul>
          </div>
        </div>
        {" "}
        {/* Shogi board display */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 50px)",
            border: "1px solid black",
          }}
        >
          {board?.map((row, y) =>
            row?.map((square, x) => (
              <div
                key={x}
                onClick={() => handleSquareClick(x, y)}
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor:
                    highlightedSquares?.some(
                      ([hx, hy]) => hx === x && hy === y
                    ) || captureMoves?.find((cx, cy) => cx === x && cy === y)
                      ? "yellow"
                      : (x + y) % 2 === 0
                      ? "white"
                      : "gray",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid lightgray",
                }}
              >
                {square}
              </div>
            ))
          )}
        </div>
        {/* Captured pieces droppable area */}
        <div>
          <h3>{turn?.toUpperCase()} Players Turn</h3>
          {capturedPieces[turn]?.map((piece) => (
            <button
              key={piece}
              onClick={handleDrop(() => {
                setSelectedPiece({ piece: piece });
                setHighlightedSquares([]);
                setCaptureMoves(
                  getPossibleMoves(board, piece, null, null, true)
                );
              }, [])}
            >
              {piece}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
