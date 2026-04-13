import React, { useState, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ChessBoardProps {
  chess: Chess;
  onMove: (move: { from: string; to: string; promotion?: string }) => void;
  playerColor: 'w' | 'b' | null;
}

const PIECES: Record<string, string> = {
  wP: '♙', wN: '♘', wB: '♗', wR: '♖', wQ: '♕', wK: '♔',
  bP: '♟', bN: '♞', bB: '♝', bR: '♜', bQ: '♛', bK: '♚',
};

export function ChessBoard({ chess, onMove, playerColor }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const board = useMemo(() => {
    const b = chess.board();
    return playerColor === 'b' ? [...b].reverse().map(row => [...row].reverse()) : b;
  }, [chess, playerColor]);

  const validMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return chess.moves({ square: selectedSquare, verbose: true });
  }, [chess, selectedSquare]);

  const handleSquareClick = (square: Square) => {
    if (!playerColor || chess.turn() !== playerColor) return;

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const move = validMoves.find(m => m.to === square);
    if (move) {
      onMove({ from: selectedSquare!, to: square, promotion: 'q' });
      setSelectedSquare(null);
    } else {
      const piece = chess.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  };

  return (
    <div className="grid grid-cols-8 grid-rows-8 w-full aspect-square border-4 border-zinc-800 rounded-lg overflow-hidden shadow-2xl bg-zinc-900">
      {board.map((row, i) => 
        row.map((cell, j) => {
          const rank = playerColor === 'b' ? i + 1 : 8 - i;
          const file = playerColor === 'b' ? 7 - j : j;
          const square = `${String.fromCharCode(97 + file)}${rank}` as Square;
          const isDark = (i + j) % 2 === 1;
          const isSelected = selectedSquare === square;
          const isValidMove = validMoves.some(m => m.to === square);
          const piece = cell;

          return (
            <div
              key={square}
              onClick={() => handleSquareClick(square)}
              className={cn(
                "relative flex items-center justify-center cursor-pointer transition-colors duration-200",
                isDark ? "bg-zinc-700" : "bg-zinc-500",
                isSelected && "bg-yellow-500/50",
                isValidMove && "after:content-[''] after:w-3 after:h-3 after:bg-black/20 after:rounded-full"
              )}
            >
              {piece && (
                <motion.div
                  layoutId={piece.type + piece.color + square}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "text-4xl sm:text-5xl select-none z-10",
                    piece.color === 'w' ? "text-white drop-shadow-md" : "text-black drop-shadow-sm"
                  )}
                >
                  {PIECES[piece.color + piece.type.toUpperCase()]}
                </motion.div>
              )}
              
              {/* Square labels */}
              {j === 0 && (
                <span className="absolute top-0.5 left-0.5 text-[10px] font-bold opacity-30 select-none">
                  {rank}
                </span>
              )}
              {i === 7 && (
                <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold opacity-30 select-none">
                  {String.fromCharCode(97 + file)}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
