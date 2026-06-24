"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Users } from "lucide-react";
import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/config";

export default function FriendsPage() {
  const { profile, user } = useAuth();
  const [friendId, setFriendId] = useState("");
  const [message, setMessage] = useState("");

  const addFriend = async () => {
    if (!user || !friendId.trim()) return;
    try {
      await updateDoc(doc(getClientDb(), "users", user.uid), {
        friends: arrayUnion(friendId.trim()),
      });
      setMessage("Friend added!");
      setFriendId("");
    } catch {
      setMessage("Failed to add friend");
    }
  };

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-gray-400">
        Sign in to manage friends
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-400" />
        Friends
      </h1>

      <Card className="mb-6">
        <CardHeader><CardTitle>Add Friend</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter user ID"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
            />
            <Button onClick={addFriend}>Add</Button>
          </div>
          {message && <p className="text-sm text-emerald-400 mt-2">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Friends ({profile.friends.length})</CardTitle></CardHeader>
        <CardContent>
          {profile.friends.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No friends yet. Add some!</p>
          ) : (
            <div className="space-y-2">
              {profile.friends.map((fid) => (
                <div key={fid} className="rounded-lg bg-black/20 px-4 py-3 text-sm text-white font-mono">
                  {fid}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
