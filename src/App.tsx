import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from './hooks/useGame';
import { ChessBoard } from './components/ChessBoard';
import { EffectsOverlay } from './components/EffectsOverlay';
import { SoundManager } from './components/SoundManager';
import { Swords, Trophy, User, Settings2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TROLL_MESSAGES } from './constants';
import { cn } from './lib/utils';

export default function App() {
  const {
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
  } = useGame();

  const [showSpice, setShowSpice] = useState(true);

  const handleGameOver = () => {
    if (gameState.winner === color) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });
    }
  };

  React.useEffect(() => {
    if (gameState.isCheckmate || gameState.isDraw) {
      handleGameOver();
    }
  }, [gameState.isCheckmate, gameState.isDraw]);

  if (!mySlot) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 font-sans">
        <header className="mb-12 text-center">
          <h1 className="text-6xl font-black tracking-tighter italic text-white flex items-center justify-center gap-3">
            <Swords className="w-12 h-12 text-red-500" />
            TROLL CHESS
          </h1>
          <p className="text-zinc-500 font-medium tracking-widest uppercase text-sm mt-4">
            CHOOSE YOUR TROLL IDENTITY
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-2xl w-full">
          {slots.length > 0 ? (
            slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => selectSlot(slot.id)}
                disabled={slot.occupied}
                className={cn(
                  "aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all group",
                  slot.occupied 
                    ? "bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed" 
                    : "bg-zinc-900 border-zinc-700 hover:border-white hover:bg-zinc-800 active:scale-95"
                )}
              >
                <User className={cn("w-8 h-8", slot.occupied ? "text-zinc-700" : "text-zinc-400 group-hover:text-white")} />
                <span className="text-[10px] font-black tracking-tighter">{slot.name}</span>
                {slot.occupied && <span className="text-[8px] text-red-500 font-bold uppercase">Taken</span>}
              </button>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-zinc-700" />
              <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Connecting to server...</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded hover:bg-zinc-700 transition-colors"
              >
                STUCK? CLICK TO REFRESH
              </button>
            </div>
          )}
        </div>
        
        <footer className="mt-12 text-zinc-800 text-[10px] font-bold uppercase tracking-[0.3em]">
          Only 10 slots available at a time
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 font-sans">
      <SoundManager lastMove={lastMove} isCheck={gameState.isCheck} isCheckmate={gameState.isCheckmate} />
      
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-tighter italic text-white flex items-center gap-3">
          <Swords className="w-10 h-10 text-red-500" />
          TROLL CHESS
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-zinc-500 font-medium tracking-wide uppercase text-[10px]">Logged in as</span>
          <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded italic">{mySlot.name}</span>
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Board Section */}
        <div className="relative w-full max-w-[600px] mx-auto">
          <div className="mb-4 flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
              <span className="font-bold">{opponentName || 'Waiting for Opponent...'}</span>
            </div>
          </div>

          <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <ChessBoard 
              chess={chess} 
              onMove={makeMove} 
              playerColor={color} 
            />
            {showSpice && <EffectsOverlay lastMove={lastMove} isCheck={gameState.isCheck} />}
            
            {!gameId && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
                <h3 className="text-2xl font-black italic mb-2">CHALLENGE SOMEONE</h3>
                <p className="text-zinc-400 text-sm max-w-xs">Pick a player from the list on the right to start a duel.</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">{mySlot.name} (You)</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 h-full max-h-[600px]">
          {/* Online Players List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center justify-between">
              Online Trolls
              <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{slots.filter(s => s.occupied).length}/10</span>
            </h2>
            
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2">
              {slots.filter(s => s.occupied && s.id !== mySlot.id).map(slot => (
                <div key={slot.id} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-bold">{slot.name}</span>
                  </div>
                  <button
                    onClick={() => challengePlayer(slot.id)}
                    disabled={!!gameId}
                    className="text-[10px] font-black bg-white text-black px-3 py-1.5 rounded hover:bg-zinc-200 disabled:opacity-30 transition-all"
                  >
                    DUEL
                  </button>
                </div>
              ))}
              {slots.filter(s => s.occupied && s.id !== mySlot.id).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-zinc-600 text-xs italic">No other trolls online...</p>
                  <p className="text-zinc-700 text-[10px] mt-2">Share the link to play!</p>
                </div>
              )}
            </div>
          </div>

          {/* Incoming Challenge */}
          <AnimatePresence>
            {incomingChallenge && !gameId && (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="bg-red-600 border border-red-500 rounded-xl p-5 shadow-2xl"
              >
                <h3 className="text-white font-black italic text-lg mb-1">CHALLENGE!</h3>
                <p className="text-red-100 text-xs mb-4"><b>{incomingChallenge.fromName}</b> wants to smoke you.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptChallenge(incomingChallenge.fromSlotId)}
                    className="flex-1 bg-white text-red-600 font-black py-2 rounded text-xs hover:bg-zinc-100"
                  >
                    ACCEPT
                  </button>
                  <button 
                    onClick={() => window.location.reload()} // Simple decline
                    className="px-3 bg-red-800 text-white font-black py-2 rounded text-xs hover:bg-red-900"
                  >
                    NO
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Info / History */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex-1 overflow-hidden flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Battle Log</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowSpice(!showSpice)}
                  className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1"
                >
                  <Settings2 className="w-3 h-3" />
                  {showSpice ? 'SPICE ON' : 'SPICE OFF'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {chess.history().map((move, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-zinc-800/50">
                  <span className="w-6 text-zinc-600 font-mono text-[10px]">{Math.floor(i/2) + 1}.</span>
                  <span className={cn("font-bold", i % 2 === 0 ? "text-white" : "text-zinc-400")}>{move}</span>
                </div>
              ))}
              {chess.history().length === 0 && (
                <div className="text-zinc-700 text-xs italic text-center mt-10">Waiting for the first move...</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      <AnimatePresence>
        {(gameState.isCheckmate || gameState.isDraw) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl"
            >
              <div className="mb-6">
                <img 
                  src={gameState.winner === color 
                    ? "https://picsum.photos/seed/winner/400/300" 
                    : "https://picsum.photos/seed/loser/400/300"
                  } 
                  alt="Result"
                  className="w-full h-48 object-cover rounded-xl mb-4 border-2 border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-4xl font-black italic mb-2">
                  {gameState.isDraw ? "IT'S A DRAW" : gameState.winner === color ? "VICTORY!" : "DEFEAT"}
                </h2>
                <p className="text-zinc-400 font-medium italic">
                  {gameState.isDraw 
                    ? TROLL_MESSAGES.draw 
                    : gameState.winner === color ? TROLL_MESSAGES.win : TROLL_MESSAGES.loss
                  }
                </p>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white text-black font-black rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                BACK TO LOBBY
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-12 text-zinc-700 text-[10px] font-bold uppercase tracking-[0.2em]">
        Built for the elite trolls • 2026
      </footer>
    </div>
  );
}
