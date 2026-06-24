"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlayerCardSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

export default function ProfilePage() {
  const { profile, loading, signInGoogle, signInGuest } = useAuth();

  if (loading) return <div className="p-8"><PlayerCardSkeleton /></div>;

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Sign in to view your profile</h1>
        <div className="flex justify-center gap-3">
          <Button variant="gold" onClick={signInGoogle}>Google Sign In</Button>
          <Button variant="secondary" onClick={signInGuest}>Guest</Button>
        </div>
      </div>
    );
  }

  const winRate = profile.gamesPlayed > 0
    ? Math.round((profile.wins / profile.gamesPlayed) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card glow>
        <CardContent className="pt-8">
          <div className="flex flex-col items-center text-center">
            <Avatar src={profile.photoURL} name={profile.username} size="lg" />
            <h1 className="mt-4 text-3xl font-black text-white">{profile.username}</h1>
            {profile.isGuest && <Badge className="mt-2">Guest Account</Badge>}
            <p className="mt-1 text-nba-gold text-2xl font-bold">{profile.elo} ELO</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <StatBox label="Wins" value={profile.wins} />
            <StatBox label="Losses" value={profile.losses} />
            <StatBox label="Win Rate" value={`${winRate}%`} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <StatBox label="Games Played" value={profile.gamesPlayed} />
            <StatBox label="Friends" value={profile.friends.length} />
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/history"><Button variant="secondary">Match History</Button></Link>
            <Link href="/friends"><Button variant="secondary">Friends</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-black/30 p-4 text-center">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
