"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createGame, joinGameByCode } from "@/lib/firebase/firestore";
import { lobbyUrl } from "@/lib/paths";
import { Plus, LogIn } from "lucide-react";

export default function HomePage() {
  const { user, profile, signInGoogle, signInGuest, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const requireAuth = async (): Promise<boolean> => {
    if (user) return true;
    try {
      await signInGuest();
      return true;
    } catch {
      setError("Please sign in to continue");
      return false;
    }
  };

  const handleCreate = async () => {
    setActionLoading(true);
    setError("");
    try {
      if (!(await requireAuth()) || !profile) return;
      const { roomCode: code } = await createGame(
        user!.uid,
        profile.username,
        profile.photoURL,
        "casual"
      );
      router.push(lobbyUrl(code));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create game");
    } finally {
      setActionLoading(false);
      setShowCreate(false);
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    setError("");
    try {
      if (!(await requireAuth()) || !profile) return;
      await joinGameByCode(roomCode, user!.uid, profile.username, profile.photoURL);
      router.push(lobbyUrl(roomCode.toUpperCase()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join game");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
          <span className="text-white">NBA </span>
          <span className="bg-gradient-to-r from-nba-red to-nba-gold bg-clip-text text-transparent">
            Auction Draft
          </span>
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Create a room, share the code or link, and draft your team.
        </p>
      </motion.section>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <ActionCard
          icon={<Plus className="h-8 w-8 text-nba-gold" />}
          title="Create Room"
          description="Get a code and link to share with friends"
          onClick={() => setShowCreate(true)}
        />
        <ActionCard
          icon={<LogIn className="h-8 w-8 text-blue-400" />}
          title="Join Room"
          description="Enter a 6-character room code"
          onClick={() => setShowJoin(true)}
        />
      </div>

      {!user && !authLoading && (
        <Card className="mt-6 p-6 text-center">
          <p className="text-gray-400 mb-4">Sign in to create or join a room</p>
          <div className="flex justify-center gap-3">
            <Button variant="gold" onClick={signInGoogle}>Sign in with Google</Button>
            <Button variant="secondary" onClick={signInGuest}>Play as Guest</Button>
          </div>
        </Card>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Room">
        <p className="text-sm text-gray-400 mb-4">
          You&apos;ll get a room code and shareable link for your friends.
        </p>
        <Button variant="gold" className="w-full" onClick={handleCreate} loading={actionLoading}>
          Create Room
        </Button>
      </Modal>

      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join Room">
        <div className="space-y-4">
          <Input
            placeholder="Enter room code (e.g. ABC123)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="text-center text-2xl font-mono tracking-widest"
          />
          <Button variant="gold" className="w-full" onClick={handleJoin} loading={actionLoading} disabled={roomCode.length !== 6}>
            Join Room
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ActionCard({
  icon, title, description, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-xl border border-white/10 bg-surface p-6 text-left transition-all hover:border-white/20 hover:bg-surface-light"
    >
      {icon}
      <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </motion.button>
  );
}
