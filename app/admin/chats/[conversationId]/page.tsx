"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "@/data/mock";
import type { ChatMessage } from "@/types";

export default function ModerationChatInspector() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const activeConv = MOCK_CONVERSATIONS[0]; // mock conversation context inspector

  const handleBlockUser = (userId: string) => {
    alert("User blocked from moderator console.");
    router.push("/admin/reports");
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      {/* Top Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <Link href="/admin/reports" className="text-xs font-bold text-stone-500 hover:underline">
            &lt; Back to Incidents
          </Link>
          <h3 className="text-2xl font-bold mt-1" style={{ color: "#3A2E2B" }}>Moderation Chat Inspector</h3>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleBlockUser(activeConv.owner_id)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C96464" }}
          >
            Block Owner
          </button>
          <button
            onClick={() => handleBlockUser(activeConv.adopter_id)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C96464" }}
          >
            Block Adopter
          </button>
        </div>
      </div>

      {/* Main chat window Inspector */}
      <div className="flex-1 rounded-2xl border bg-white overflow-hidden flex flex-col" style={{ borderColor: "#D6C7B2" }}>
        {/* Info bar context */}
        <div className="p-4 border-b flex justify-between text-xs font-semibold shrink-0" style={{ borderColor: "#D6C7B2", backgroundColor: "#FDF4D2" }}>
          <span style={{ color: "#3A2E2B" }}>Owner ID: {activeConv.owner_id} ({activeConv.other_user?.full_name})</span>
          <span style={{ color: "#3A2E2B" }}>Adopter ID: {activeConv.adopter_id} (Alex Johnson)</span>
          <span style={{ color: "#3A2E2B" }}>Pet ID: {activeConv.pet_id}</span>
        </div>

        {/* Message logs */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-stone-50">
          {messages.map((m) => {
            const isOwner = m.sender_id === activeConv.owner_id;
            const senderName = isOwner ? activeConv.other_user?.full_name : "Alex Johnson";

            return (
              <div key={m.id} className="flex flex-col gap-1.5 border-b pb-4 last:border-b-0" style={{ borderColor: "#EDE5D8" }}>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700">{senderName} (ID: {m.sender_id})</span>
                  <span className="text-stone-400">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-stone-900 bg-white p-3 rounded-xl border border-stone-200 shadow-sm leading-relaxed">
                  {m.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
