"use client";

import React, { useState } from "react";
import VideoCall from "../stream/VideoCall";
import { RoomChatChannel } from "./RoomChatChannel";

type Tab = "chat" | "video";

type RoomStreamPanelProps = {
  roomId: string;
  roomName: string;
  /** Mise en page : "tabs" (onglets Chat | Vidéo) ou "split" (côte à côte). */
  layout?: "tabs" | "split";
};

export default function RoomStreamPanel({
  roomId,
  roomName,
  layout = "tabs",
}: RoomStreamPanelProps) {
  const [tab, setTab] = useState<Tab>("chat");
  const safeRoomId = roomId.replace(/[^a-z0-9-_]/gi, "") || "default-room";

  if (layout === "split") {
    return (
      <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-6 p-4 md:p-6">
        <div className="flex-[2] min-w-0 min-h-[280px] md:min-h-0 flex flex-col rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-500/20 transition-colors">
          <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-cyan-500/5 to-transparent">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Visio & partage d&apos;écran</p>
              <p className="text-xs text-white/50">Rejoignez l&apos;appel avec votre équipe</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <VideoCall callId={safeRoomId} />
          </div>
        </div>
        <div className="flex-1 min-w-[280px] md:max-w-[380px] min-h-[260px] md:min-h-0 flex flex-col rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-500/20 transition-colors">
          <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-violet-500/5 to-transparent">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0-4.418-4.03-8-9-8s-9 3.582-9 8 4.03 8 9 8 9-3.582 9-8z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Chat</p>
              <p className="text-xs text-white/50">Échangez en temps réel</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#0d1117]/50">
            <RoomChatChannel roomId={safeRoomId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab("chat")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "chat"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => setTab("video")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "video"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Visio & partage d&apos;écran
        </button>
      </div>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {tab === "chat" ? (
          <RoomChatChannel roomId={safeRoomId} />
        ) : (
          <div className="flex-1 min-h-0 overflow-auto">
            <VideoCall callId={safeRoomId} />
          </div>
        )}
      </div>
    </div>
  );
}
