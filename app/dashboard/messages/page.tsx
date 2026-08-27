"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Conversation, ChatMessage } from "@/types";
import { api } from "@/lib/api";
import { useSocket } from "@/lib/socket";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

export default function MessagesChatRoom() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [myId, setMyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  // On mobile: show the thread panel when a conversation is selected
  const [showThread, setShowThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeIdRef    = useRef<string>("");  // stable ref for socket handler

  const { socket, joinConversation, leaveConversation } = useSocket();

  // Keep ref in sync with state
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  // ── Realtime: incoming message ───────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg: ChatMessage) => {
      // Append to thread if the message belongs to the active conversation
      if (msg.conversation_id === activeIdRef.current) {
        setMessages((prev) => {
          // Deduplicate — optimistic send already added our own messages
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      // Update conversation sidebar preview + increment unread for others
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== msg.conversation_id) return c;
          const isActive  = msg.conversation_id === activeIdRef.current;
          const isMine    = msg.sender_id === activeIdRef.current; // never — socket is remote
          return {
            ...c,
            last_message:  msg,
            unread_count:  isActive ? 0 : (c.unread_count ?? 0) + 1,
          };
        }),
      );
    };

    socket.on("message:new", onMessage);
    return () => { socket.off("message:new", onMessage); };
  }, [socket]);

  // ── Realtime: conversation list updated (new conv from other user) ────────
  useEffect(() => {
    if (!socket) return;

    const onConvUpdated = (payload: { conversation: Conversation }) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === payload.conversation.id);
        if (exists) {
          return prev.map((c) =>
            c.id === payload.conversation.id ? { ...c, ...payload.conversation } : c,
          );
        }
        // New conversation we weren't aware of — prepend it
        return [payload.conversation, ...prev];
      });
    };

    socket.on("conversation:updated", onConvUpdated);
    return () => { socket.off("conversation:updated", onConvUpdated); };
  }, [socket]);

  // ── Join / leave conversation room when activeId changes ─────────────────
  useEffect(() => {
    if (!activeId) return;
    joinConversation(activeId);
    return () => { leaveConversation(activeId); };
  }, [activeId, joinConversation, leaveConversation]);

  // Fetch current user details
  useEffect(() => {
    api.get("/profiles/me")
      .then((user) => setMyId(user.id))
      .catch(console.error);
  }, []);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.get("/conversations");
      setConversations(data);
      if (data.length > 0 && !activeId) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlConvId = urlParams.get("conversationId");
        const targetId = urlConvId || data[0].id;
        setActiveId(targetId);
        // Auto-open thread on mobile if deep-linked
        if (urlConvId) setShowThread(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages thread for the active conversation
  useEffect(() => {
    if (!activeId) return;

    api.get(`/messages/${activeId}`)
      .then(setMessages)
      .catch(console.error);

    api.post(`/messages/${activeId}/read`)
      .then(() => {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeId ? { ...c, unread_count: 0 } : c))
        );
      })
      .catch(console.error);
  }, [activeId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConv = conversations.find((c) => c.id === activeId);

  const handleSelectConv = (id: string) => {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread_count: 0 } : item))
    );
    setShowThread(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !activeId) return;

    try {
      const newMsg = await api.post("/messages", {
        conversation_id: activeId,
        content: textInput,
      });

      setMessages((prev) => [...prev, newMsg]);
      setTextInput("");

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, last_message: newMsg, unread_count: 0 } : c
        )
      );
    } catch (err) {
      alert("Failed to send message: " + (err as any).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm font-semibold" style={{ color: "#3A2E2B" }}>Loading messages…</p>
      </div>
    );
  }

  return (
    /* Pull out of parent p-4/p-8 so chat fills edge-to-edge */
    <div
      className="-m-4 sm:-m-6 md:-m-8 overflow-hidden"
      style={{ height: "calc(100dvh - 56px - 57px)", /* topbar + bottom tab */ }}
    >
      {/* On md+: side-by-side. On mobile: show list or thread depending on showThread */}
      <div className="flex h-full" style={{ borderColor: "#D6C7B2" }}>

        {/* ── Left panel: conversation list ────────────────────────────── */}
        <div
          className={`
            flex flex-col border-r
            w-full md:w-72 md:shrink-0
            ${showThread ? "hidden md:flex" : "flex"}
          `}
          style={{ borderColor: "#D6C7B2", backgroundColor: "#FFFFFF" }}
        >
          <div className="px-4 py-4 border-b shrink-0" style={{ borderColor: "#D6C7B2" }}>
            <h2 className="font-bold text-base" style={{ color: "#3A2E2B" }}>Messages</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6B5651" }}>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <div className="p-6 text-center flex flex-col items-center gap-3 mt-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#F5EFE6" }}>
                  <MessageCircle size={28} style={{ color: "#C0A898" }} />
                </div>
                <p className="text-sm font-bold" style={{ color: "#3A2E2B" }}>No conversations yet</p>
                <p className="text-xs" style={{ color: "#6B5651" }}>Browse pets and tap "Chat with Owner".</p>
              </div>
            )}
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              const otherName = c.other_user?.full_name ?? "User";
              const petLabel = c.pet ? `Re: ${c.pet.name}` : "";
              const isUnread = (c.unread_count ?? 0) > 0;
              const isOwnerSide = myId && c.owner_id === myId;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConv(c.id)}
                  className="px-4 py-3.5 border-b cursor-pointer flex items-center gap-3 transition-colors active:bg-orange-50"
                  style={{
                    borderColor: "#F0E8DC",
                    backgroundColor: isActive ? "#FEF3F0" : "transparent",
                    borderLeft: isActive ? "3px solid #E8705A" : "3px solid transparent",
                  }}
                >
                  <UserAvatar
                    name={otherName}
                    avatarUrl={c.other_user?.avatar_url}
                    size={40}
                    bgColor={isOwnerSide ? "#946D6D" : "#E8705A"}
                  />

                  <div className="overflow-hidden flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={`text-sm truncate ${isUnread ? "font-bold" : "font-medium"}`} style={{ color: "#3A2E2B" }}>
                        {otherName}
                      </p>
                      {isOwnerSide && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap" style={{ backgroundColor: "#946D6D22", color: "#6E4F4F" }}>
                          MY PET
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold truncate" style={{ color: "#E8705A" }}>{petLabel}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "#9B8B84" }}>
                      {c.last_message?.content ?? "No messages yet"}
                    </p>
                  </div>

                  {isUnread && (
                    <span className="w-5 h-5 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: "#E8705A" }}>
                      {c.unread_count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right panel: chat thread ──────────────────────────────────── */}
        <div
          className={`
            flex-1 flex flex-col min-w-0
            ${showThread ? "flex" : "hidden md:flex"}
          `}
          style={{ backgroundColor: "#FDFAF6" }}
        >
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3.5 bg-white border-b flex items-center gap-3 shrink-0" style={{ borderColor: "#D6C7B2" }}>
                {/* Back button — mobile only */}
                <button
                  onClick={() => setShowThread(false)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-stone-100 shrink-0"
                  style={{ color: "#3A2E2B" }}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <UserAvatar
                    name={activeConv.other_user?.full_name}
                    avatarUrl={activeConv.other_user?.avatar_url}
                    size={36}
                    bgColor={activeConv.owner_id === myId ? "#946D6D" : "#E8705A"}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-tight truncate" style={{ color: "#3A2E2B" }}>
                      {activeConv.other_user?.full_name}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "#9B8B84" }}>
                      {activeConv.owner_id === myId ? "Interested adopter" : "Pet owner"}
                      {activeConv.other_user?.city ? ` · ${activeConv.other_user.city}` : ""}
                    </p>
                  </div>
                </div>

                {activeConv.owner_id !== myId ? (
                  <button
                    onClick={() => alert("Submit scam reports using the Explore detail menu.")}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0"
                    style={{ borderColor: "#C96464", color: "#C96464" }}
                  >
                    Report
                  </button>
                ) : (
                  <a
                    href="/dashboard/my-pets"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0"
                    style={{ borderColor: "#946D6D", color: "#946D6D" }}
                  >
                    Manage
                  </a>
                )}
              </div>

              {/* Pet context strip */}
              {activeConv.pet && (
                <div className="px-4 py-2 border-b shrink-0 flex items-center justify-between gap-2" style={{ borderColor: "#EDE5D8", backgroundColor: "#F5EFE6" }}>
                  <p className="text-xs font-semibold truncate" style={{ color: "#6B5651" }}>
                    Discussing: <span className="font-bold" style={{ color: "#3A2E2B" }}>{activeConv.pet.name}</span>
                    {activeConv.pet.breed ? ` · ${activeConv.pet.breed}` : ""}
                  </p>
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        activeConv.pet.status === "available" ? "#A3B18A33" :
                        activeConv.pet.status === "pending"   ? "#E0A96D33" : "#946D6D33",
                      color:
                        activeConv.pet.status === "available" ? "#3A6020" :
                        activeConv.pet.status === "pending"   ? "#9B6A2A" : "#6E4F4F",
                    }}
                  >
                    {activeConv.pet.status}
                  </span>
                </div>
              )}

              {/* Message bubbles */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-3">
                {messages.filter((m) => m.conversation_id === activeId).length === 0 && (
                  <div className="flex-1 flex items-center justify-center mt-8">
                    <p className="text-sm" style={{ color: "#9B8B84" }}>No messages yet. Say hello!</p>
                  </div>
                )}
                {messages
                  .filter((m) => m.conversation_id === activeId)
                  .map((m) => {
                    const isOwn = m.sender_id === myId;
                    return (
                      <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className="max-w-[80%] sm:max-w-[65%] px-4 py-3 flex flex-col gap-1 shadow-sm"
                          style={{
                            backgroundColor: isOwn ? "#E8705A" : "#FFFFFF",
                            color: isOwn ? "#FFFFFF" : "#3A2E2B",
                            borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          }}
                        >
                          <p className="text-sm leading-relaxed break-words">{m.content}</p>
                          <span className="text-[10px] self-end opacity-60">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <form
                onSubmit={handleSend}
                className="px-4 py-3 sm:py-4 bg-white border-t shrink-0 flex items-center gap-2 sm:gap-3"
                style={{ borderColor: "#D6C7B2" }}
              >
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none min-w-0"
                  style={{ borderColor: "#D6C7B2", backgroundColor: "#FDFAF6" }}
                />
                <button
                  type="submit"
                  className="w-11 h-11 rounded-2xl font-bold text-sm text-white shrink-0 flex items-center justify-center transition-opacity hover:opacity-90 active:scale-95 sm:w-auto sm:px-6 sm:h-auto sm:py-3"
                  style={{ backgroundColor: "#E8705A" }}
                  aria-label="Send"
                >
                  <Send size={16} className="sm:hidden" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#F5EFE6" }}>
                <MessageCircle size={28} style={{ color: "#C0A898" }} />
              </div>
              <p className="text-sm font-bold mt-2" style={{ color: "#3A2E2B" }}>Select a conversation</p>
              <p className="text-xs text-center" style={{ color: "#9B8B84" }}>Choose one from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
