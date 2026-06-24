"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export function ConfettiCelebration({ trigger }: { trigger: boolean }) {
  const fired = useRef(false);

  useEffect(() => {
    if (trigger && !fired.current) {
      fired.current = true;
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#C8102E", "#FDB927", "#FFFFFF"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#C8102E", "#FDB927", "#FFFFFF"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [trigger]);

  return null;
}
