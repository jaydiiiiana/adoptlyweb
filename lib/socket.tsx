"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  /** Join a conversation room to receive message:new events */
  joinConversation: (conversationId: string) => void;
  /** Leave a conversation room */
  leaveConversation: (conversationId: string) => void;
  /** Join the global pet feed room */
  joinFeed: () => void;
  /** Leave the global pet feed room */
  leaveFeed: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  joinConversation: () => {},
  leaveConversation: () => {},
  joinFeed: () => {},
  leaveFeed: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef  = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let socket: Socket;

    const connect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return; // not logged in — no socket needed

      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

      socket = io(API, {
        auth: { token: session.access_token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketRef.current = socket;

      socket.on("connect",    () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));
      socket.on("connect_error", (err) => {
        console.warn("[socket] connect_error:", err.message);
        setConnected(false);
      });
    };

    connect();

    // Re-connect when auth state changes (sign-in / sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      if (session?.access_token) {
        connect();
      }
    });

    return () => {
      subscription.unsubscribe();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinConversation = useCallback((id: string) => {
    socketRef.current?.emit("join:conversation", id);
  }, []);

  const leaveConversation = useCallback((id: string) => {
    socketRef.current?.emit("leave:conversation", id);
  }, []);

  const joinFeed = useCallback(() => {
    socketRef.current?.emit("join:feed");
  }, []);

  const leaveFeed = useCallback(() => {
    socketRef.current?.emit("leave:feed");
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        joinConversation,
        leaveConversation,
        joinFeed,
        leaveFeed,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSocket() {
  return useContext(SocketContext);
}
