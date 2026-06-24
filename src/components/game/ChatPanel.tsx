"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send } from "lucide-react";
import type { Message } from "@/types";

interface ChatPanelProps {
  messages: Message[];
  onSend: (text: string) => Promise<void>;
  currentUserId?: string;
  placeholder?: string;
}

export function ChatPanel({ messages, onSend, currentUserId, placeholder = "Type a message..." }: ChatPanelProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text.trim());
      setText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-3 min-h-[200px] max-h-[300px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm ${msg.type === "system" ? "text-center text-gray-500 italic" : ""}`}
          >
            {msg.type !== "system" && (
              <span className={`font-semibold ${msg.userId === currentUserId ? "text-nba-gold" : "text-blue-400"}`}>
                {msg.username}:{" "}
              </span>
            )}
            <span className="text-gray-300">{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-3 border-t border-white/5">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button size="sm" onClick={handleSend} loading={sending} disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
