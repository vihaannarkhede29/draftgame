"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type User } from "firebase/auth";
import {
  onAuthChange,
  signInWithGoogle,
  signInAsGuest,
  signOut,
  getUserProfile,
  ensureUserProfile,
} from "@/lib/firebase/auth";
import type { UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    let p = await getUserProfile(u.uid);
    if (!p) p = await ensureUserProfile(u, u.isAnonymous);
    setProfile(p);
  }, []);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [loadProfile]);

  const signInGoogle = async () => {
    const u = await signInWithGoogle();
    await loadProfile(u);
  };

  const signInGuest = async () => {
    const u = await signInAsGuest();
    await loadProfile(u);
  };

  const handleSignOut = async () => {
    await signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInGoogle: signInGoogle,
        signInGuest: signInGuest,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
