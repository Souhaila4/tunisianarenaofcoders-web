"use client";

import React, { useState, useEffect } from "react";
import { Channel, MessageList, MessageInput, Window, useChatContext } from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import { ensureRoomJoin } from "@/app/lib/api";

type RoomChatChannelProps = {
  roomId: string;
};

export function RoomChatChannel({ roomId }: RoomChatChannelProps) {
  const { client } = useChatContext("RoomChatChannel");
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client?.userID || !roomId) return;
    const safeId = roomId.replace(/[^a-z0-9-_]/gi, "") || "default-room";
    const c = client.channel("messaging", safeId, {});
    setError(null);
    ensureRoomJoin(safeId)
      .then(() => c.watch())
      .then(() => setChannel(c))
      .catch((err) => {
        setError(err?.message ?? "Impossible de charger le canal.");
      });
    return () => {
      c.stopWatching().catch(() => {});
    };
  }, [client, roomId]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-red-400 text-sm p-4 text-center">
        {error}
      </div>
    );
  }
  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-white/60 text-sm">
        Chargement du canal...
      </div>
    );
  }

  return (
    <Channel channel={channel}>
      <Window>
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-2 min-h-[200px]">
            <MessageList />
          </div>
          <div className="p-2 border-t border-white/10">
            <MessageInput />
          </div>
        </div>
      </Window>
    </Channel>
  );
}
