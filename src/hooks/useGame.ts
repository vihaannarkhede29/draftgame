"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { subscribeToGame, updateConnectionStatus } from "@/lib/firebase/firestore";
import { transferHost } from "@/lib/firebase/game-actions";
import type { Game } from "@/types";
import { RECONNECT_WINDOW_MS, HOST_TRANSFER_MS } from "@/lib/game/constants";

export function useGame(gameId: string | null, userId: string | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const unsubGame = subscribeToGame(gameId, (g) => {
      setGame(g);
      setLoading(false);
    });

    return unsubGame;
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !userId) return;

    updateConnectionStatus(gameId, userId, true);

    const handleBeforeUnload = () => {
      updateConnectionStatus(gameId, userId, false);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateConnectionStatus(gameId, userId, false);
    };
  }, [gameId, userId]);

  useEffect(() => {
    if (!gameId || !game) return;
    const host = game.players[game.hostId];
    if (host?.isConnected || !host?.disconnectedAt) return;

    const elapsed = Date.now() - host.disconnectedAt;
    if (elapsed < 30000) return;

    transferHost(gameId).catch(() => {});
  }, [game?.players, game?.hostId, gameId, game]);

  const canReconnect = useCallback(
    (playerId: string) => {
      if (!game) return false;
      const player = game.players[playerId];
      if (!player || player.isConnected) return false;
      if (!player.disconnectedAt) return false;
      return Date.now() - player.disconnectedAt < RECONNECT_WINDOW_MS;
    },
    [game]
  );

  const shouldTransferHost = useCallback(
    (hostId: string) => {
      if (!game) return false;
      const host = game.players[hostId];
      if (!host || host.isConnected) return false;
      if (!host.disconnectedAt) return false;
      return Date.now() - host.disconnectedAt > HOST_TRANSFER_MS;
    },
    [game]
  );

  return { game, loading, canReconnect, shouldTransferHost };
}
