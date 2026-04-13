import React, { useEffect, useRef } from 'react';
import { SOUNDS } from '../constants';

export function SoundManager({ lastMove, isCheck, isCheckmate }: { lastMove: any, isCheck: boolean, isCheckmate: boolean }) {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      audioRefs.current[key] = new Audio(url);
    });
  }, []);

  const playSound = (key: string) => {
    const audio = audioRefs.current[key];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // Ignore autoplay blocks
    }
  };

  useEffect(() => {
    if (isCheckmate) {
      playSound('king');
      return;
    }
    if (isCheck) {
      playSound('check');
      return;
    }
    if (lastMove) {
      if (lastMove.captured) {
        const pieceMap: Record<string, string> = {
          p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king'
        };
        playSound(pieceMap[lastMove.captured] || 'move');
      } else {
        playSound('move');
      }
    }
  }, [lastMove, isCheck, isCheckmate]);

  return null;
}
