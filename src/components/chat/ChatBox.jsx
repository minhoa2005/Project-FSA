"use client";

import { useEffect, useState, useRef } from "react";

import { Button } from "../ui/button";
import { useSocket } from "@/hooks/useSocket";

export default function ChatBox({ user, onClose }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const myId = 123; // TODO: đọc từ cookie hoặc context
  const roomId = myId < user.id ? `${myId}_${user.id}` : `${user.id}_${myId}`;

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_room", roomId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receive_message");
  }, [socket]);

  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      senderId: myId,
      receiverId: user.id,
      roomId,
      text,
      timestamp: new Date()
    };

    // 1. emit socket
    socket.emit("send_message", msg);

    // 2. update UI
    setMessages((prev) => [...prev, msg]);

    // 3. clear box
    setText("");
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white w-80 rounded-xl shadow-xl">
      <div className="p-3 border-b flex justify-between">
        <span>{user.name}</span>
        <button onClick={onClose}>x</button>
      </div>

      <div className="h-64 p-3 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 flex ${msg.senderId === myId ? "justify-end" : "justify-start"}`}
          >
            <div className={`px-3 py-2 rounded-lg ${msg.senderId === myId ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-1"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button onClick={sendMessage}>Gửi</Button>
      </div>
    </div>
  );
}
