"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeToMatchmaking, createGame, leaveMatchmaking } from "@/lib/firebase/firestore";
import type { GameMode } from "@/types";

export function useMatchmakingWatcher(
  userId: string | undefined,
  username: string | undefined,
  mode: GameMode,
  active: boolean
) {
  const router = useRouter();

  useEffect(() => {
    if (!active || !userId || !username) return;

    const unsub = subscribeToMatchmaking(mode, async (entries) => {
      if (entries.length < 2) return;

      const isFirst = entries[0]?.userId === userId;
      if (!isFirst) return;

      try {
        const opponent = entries[1];
        const { roomCode } = await createGame(userId, username, undefined, mode, 2);
        await leaveMatchmaking(userId);
        await leaveMatchmaking(opponent.userId);
        router.push(`/lobby/${roomCode}`);
      } catch {
        // Another client may have created the match
      }
    });

    return unsub;
  }, [active, userId, username, mode, router]);
}
