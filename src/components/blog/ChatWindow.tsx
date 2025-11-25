"use client";
import { useSocket } from "@/hooks/useSocket";
import { useState, useEffect, useRef } from "react";


export default function ChatWindow({ user, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!user) return;

    fetch(`/api/messages?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setMessages(data));

    socket.emit("joinRoom", { userId: currentUserId, targetId: user.id });

    socket.on("receiveMessage", msg => {
      if (msg.from === user.id || msg.to === user.id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [user]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const msg = {
      text: newMsg,
      from: currentUserId,
      to: user.id,
      createdAt: new Date().toISOString(),
    };
    socket.emit("sendMessage", msg);
    setMessages(prev => [...prev, { ...msg, fromMe: true }]);
    setNewMsg("");
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">Chọn người để nhắn</div>;
  }

  return (
    <div className="flex-1 flex flex-col border-l">
      <div className="p-4 border-b font-bold">{user.name}</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-xs ${msg.from === currentUserId ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"}`}
            ref={scrollRef}
          >
            {msg.text}
            <div className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          className="flex-1 border rounded px-2 py-1"
          placeholder="Nhập tin nhắn..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded">Gửi</button>
      </div>
    </div>
  );
}
