import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion.js';
import { MOTION } from '../constants/ui.js';

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

/** Animates from the previous value to `target`; jumps straight there under reduced motion. */
export function useCountUp(target, durationMs = MOTION.slowMs) {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (reducedMotion || from === target) {
      fromRef.current = target;
      setValue(target);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const current = from + (target - from) * easeOutCubic(progress);
      fromRef.current = current;
      setValue(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, reducedMotion]);

  return value;
}
