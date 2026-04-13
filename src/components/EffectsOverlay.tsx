import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TROLL_MESSAGES } from '../constants';
import { cn } from '../lib/utils';

interface Effect {
  id: string;
  text?: string;
  x: number;
  y: number;
  type: 'text' | 'anime';
  animeType?: string;
}

export function EffectsOverlay({ lastMove, isCheck }: { lastMove: any, isCheck: boolean }) {
  const [effects, setEffects] = useState<Effect[]>([]);

  useEffect(() => {
    if (lastMove?.captured) {
      const id = Math.random().toString(36);
      const animeId = Math.random().toString(36);
      
      // Add text effect
      let text = '';
      if (lastMove.captured === 'q') text = TROLL_MESSAGES.queen_death;
      else if (Math.random() > 0.7) text = "Ouch!";

      const x = Math.random() * 60 + 20;
      const y = Math.random() * 60 + 20;

      if (text) {
        setEffects(prev => [...prev, { id, text, x, y, type: 'text' }]);
        setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 2000);
      }

      // Add anime effect (visual splash)
      setEffects(prev => [...prev, { 
        id: animeId, 
        x, 
        y, 
        type: 'anime', 
        animeType: lastMove.captured === 'q' ? 'explosion' : 'splash' 
      }]);
      setTimeout(() => setEffects(prev => prev.filter(e => e.id !== animeId)), 1000);
    }

    if (isCheck) {
      const id = Math.random().toString(36);
      setEffects(prev => [...prev, {
        id,
        text: TROLL_MESSAGES.check,
        x: 50,
        y: 40,
        type: 'text'
      }]);
      setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 1500);
    }
  }, [lastMove, isCheck]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {effects.map(effect => (
          <React.Fragment key={effect.id}>
            {effect.type === 'text' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1.5, y: -40 }}
                exit={{ opacity: 0, scale: 2 }}
                className="absolute font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,1)] text-2xl italic"
                style={{ left: `${effect.x}%`, top: `${effect.y}%`, transform: 'translateX(-50%)' }}
              >
                {effect.text}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 3, 4], rotate: [0, 45, 90] }}
                className={cn(
                  "absolute w-16 h-16 rounded-full blur-xl",
                  effect.animeType === 'explosion' ? "bg-orange-500" : "bg-blue-400"
                )}
                style={{ left: `${effect.x}%`, top: `${effect.y}%`, transform: 'translate(-50%, -50%)' }}
              />
            )}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
}
