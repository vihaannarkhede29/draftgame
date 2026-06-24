"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatMoney, formatMoneyFull } from "@/lib/utils";
import type { GamePlayer, NBAPlayer } from "@/types";

interface AuctionPanelProps {
  player: GamePlayer;
  nbaPlayer: NBAPlayer;
  hasBid: boolean;
  phase: string;
  onSubmitBid: (amount: number) => Promise<void>;
  disabled?: boolean;
}

export function AuctionPanel({
  player,
  nbaPlayer,
  hasBid,
  phase,
  onSubmitBid,
  disabled,
}: AuctionPanelProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const positionFilled = player.filledPositions[nbaPlayer.position];
  const canBid = !positionFilled && phase === "bidding" && !hasBid && !disabled;

  const handleSubmit = async () => {
    const amount = parseInt(bidAmount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(amount) || amount <= 0) {
      setError("Enter a valid bid amount");
      return;
    }
    if (amount > player.budget) {
      setError(`Cannot exceed ${formatMoney(player.budget)}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmitBid(amount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit bid");
    } finally {
      setLoading(false);
    }
  };

  const quickBids = [
    Math.min(player.budget, nbaPlayer.salaryEstimate),
    Math.min(player.budget, Math.round(nbaPlayer.salaryEstimate * 0.75)),
    Math.min(player.budget, Math.round(nbaPlayer.salaryEstimate * 0.5)),
    1_000_000,
  ].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i);

  if (positionFilled) {
    return (
      <div className="rounded-xl border border-white/10 bg-surface-light p-4 text-center">
        <p className="text-gray-400">You already have a {nbaPlayer.position}</p>
      </div>
    );
  }

  if (phase === "revealing") {
    return (
      <div className="rounded-xl border border-nba-gold/30 bg-nba-gold/5 p-4 text-center animate-pulse">
        <p className="text-nba-gold font-bold">Revealing bids...</p>
      </div>
    );
  }

  if (hasBid) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
        <p className="text-emerald-400 font-bold">Bid submitted!</p>
        <p className="text-sm text-gray-400 mt-1">Waiting for other players...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-surface-light p-4 space-y-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Your Budget</span>
        <span className="font-bold text-nba-gold">{formatMoney(player.budget)}</span>
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-1 block">Your Secret Bid</label>
        <Input
          type="text"
          placeholder="Enter amount..."
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          disabled={!canBid}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickBids.map((amount) => (
          <button
            key={amount}
            onClick={() => setBidAmount(String(amount))}
            disabled={!canBid}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
          >
            {formatMoney(amount)}
          </button>
        ))}
      </div>

      <Button
        variant="gold"
        className="w-full"
        onClick={handleSubmit}
        loading={loading}
        disabled={!canBid}
      >
        Submit Bid
      </Button>

      {bidAmount && (
        <p className="text-xs text-center text-gray-500">
          Bidding {formatMoneyFull(parseInt(bidAmount.replace(/[^0-9]/g, ""), 10) || 0)}
        </p>
      )}
    </div>
  );
}
