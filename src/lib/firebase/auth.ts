import {
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getClientAuth, getClientDb } from "./config";
import type { UserProfile } from "@/types";
import { generateGuestUsername } from "@/lib/utils";
import { STARTING_ELO } from "@/lib/game/constants";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(getClientAuth(), googleProvider);
  await ensureUserProfile(result.user, false);
  return result.user;
}

export async function signInAsGuest(): Promise<User> {
  const result = await signInAnonymously(getClientAuth());
  await ensureUserProfile(result.user, true);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getClientAuth());
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getClientAuth(), callback);
}

async function ensureUserProfile(user: User, isGuest: boolean): Promise<UserProfile> {
  const ref = doc(getClientDb(), "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, { lastSeen: Date.now(), isConnected: true });
    return snap.data() as UserProfile;
  }

  const username = isGuest
    ? generateGuestUsername()
    : user.displayName || `Player${user.uid.slice(0, 6)}`;

  const profile: UserProfile = {
    uid: user.uid,
    username,
    email: user.email ?? undefined,
    photoURL: user.photoURL ?? undefined,
    isGuest,
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    elo: STARTING_ELO,
    friends: [],
    createdAt: Date.now(),
    lastSeen: Date.now(),
  };

  await setDoc(ref, profile);
  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getClientDb(), "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUsername(uid: string, username: string): Promise<void> {
  await updateDoc(doc(getClientDb(), "users", uid), { username });
}

export async function updateLastSeen(uid: string): Promise<void> {
  await updateDoc(doc(getClientDb(), "users", uid), { lastSeen: Date.now() });
}

export { ensureUserProfile };
