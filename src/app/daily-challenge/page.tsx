"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Zap, Target, DollarSign } from "lucide-react";

const todayChallenge = {
  title: "Budget Ballers",
  description: "Win a draft while spending less than $85M total",
  constraint: "Keep at least $15M remaining in your budget at draft end",
  bonusPoints: 50,
  expiresIn: "18h 32m",
};

export default function DailyChallengePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
        <Zap className="h-8 w-8 text-nba-gold" />
        Daily Challenge
      </h1>
      <p className="text-gray-400 mb-8">Complete today&apos;s challenge for bonus ELO</p>

      <Card glow className="border-nba-gold/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{todayChallenge.title}</CardTitle>
            <Badge variant="gold">+{todayChallenge.bonusPoints} ELO</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">{todayChallenge.description}</p>

          <div className="rounded-lg bg-black/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-nba-red" />
              <span className="text-gray-400">Constraint:</span>
              <span className="text-white">{todayChallenge.constraint}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-nba-gold" />
              <span className="text-gray-400">Expires in:</span>
              <span className="text-nba-gold">{todayChallenge.expiresIn}</span>
            </div>
          </div>

          <Button variant="gold" className="w-full">Play Daily Challenge</Button>
        </CardContent>
      </Card>
    </div>
  );
}
