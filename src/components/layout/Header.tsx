"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { user, profile, signInGoogle, signInGuest, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-nba-red to-nba-gold font-black text-white text-sm">
            NBA
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white group-hover:text-nba-gold transition-colors">
              Auction Draft
            </h1>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-lg bg-white/5" />
          ) : user && profile ? (
            <div className="flex items-center gap-3">
              <Avatar src={profile.photoURL} name={profile.username} size="sm" />
              <span className="hidden sm:block text-sm font-semibold text-white">{profile.username}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={signInGuest}>Guest</Button>
              <Button variant="gold" size="sm" onClick={signInGoogle}>Sign In</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
