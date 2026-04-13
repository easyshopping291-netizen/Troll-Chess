import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Chess, Move } from 'chess.js';

export function useGame() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [color, setColor] = useState<'w' | 'b' | null>(null);
  const [chess, setChess] = useState(new Chess());
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [slots, setSlots] = useState<{ id: number; name: string; occupied: boolean }[]>([]);
  const [mySlot, setMySlot] = useState<{ id: number; name: string } | null>(null);
  const [incomingChallenge, setIncomingChallenge] = useState<{ fromSlotId: number; fromName: string } | null>(null);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [gameState, setGameState] = useState<{
    isCheck: boolean;
    isCheckmate: boolean;
    isDraw: boolean;
    winner: 'w' | 'b' | 'draw' | null;
  }>({
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    winner: null,
  });

  useEffect(() => {
    const socketUrl = window.location.origin;
    console.log('Connecting to socket at:', socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    newSocket.on('slots_update', (updatedSlots) => {
      console.log('Received slots update:', updatedSlots);
      setSlots(updatedSlots);
    });

    newSocket.on('slot_confirmed', (slot) => {
      setMySlot(slot);
    });

    newSocket.on('challenge_received', (challenge) => {
      setIncomingChallenge(challenge);
    });

    newSocket.on('match_found', ({ gameId, color, opponentName }) => {
      setGameId(gameId);
      setColor(color);
      setOpponentName(opponentName);
      setIncomingChallenge(null);
      setChess(new Chess());
    });

    newSocket.on('move_made', ({ fen, move, isCheck, isCheckmate, isDraw }) => {
      const newChess = new Chess(fen);
      setChess(newChess);
      setLastMove(move);
      setGameState({
        isCheck,
        isCheckmate,
        isDraw,
        winner: isCheckmate ? (newChess.turn() === 'w' ? 'b' : 'w') : isDraw ? 'draw' : null,
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const selectSlot = useCallback((slotId: number) => {
    socket?.emit('select_slot', slotId);
  }, [socket]);

  const challengePlayer = useCallback((targetSlotId: number) => {
    socket?.emit('challenge_player', targetSlotId);
  }, [socket]);

  const acceptChallenge = useCallback((challengerSlotId: number) => {
    socket?.emit('accept_challenge', challengerSlotId);
  }, [socket]);

  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    if (socket && gameId) {
      socket.emit('move', { gameId, move });
    }
  }, [socket, gameId]);

  return {
    chess,
    gameId,
    color,
    lastMove,
    gameState,
    slots,
    mySlot,
    incomingChallenge,
    opponentName,
    selectSlot,
    challengePlayer,
    acceptChallenge,
    makeMove,
  };
}
