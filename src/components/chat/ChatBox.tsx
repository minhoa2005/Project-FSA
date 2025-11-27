"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { useSocket } from "@/hooks/useSocket";
import { getMessagesByFollowing, insertMessage } from "@/service/users/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatter";
import { Card } from "../ui/card";
import { File, Upload, X } from "lucide-react";
import { Input } from "../ui/input";
import Image from "next/image";

export default function ChatBox({ user, onClose, avatar, name }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [roomId, setRoomId] = useState("");
  const scrollRef = useRef(null);

  // Scroll xuống cuối chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Load lịch sử
  useEffect(() => {
    if (!user) return;
    async function loadHistory() {
      const result = await getMessagesByFollowing(user.id);
      setMessages(result.messages);
      setRoomId(result.roomId);
    }
    loadHistory();
  }, [user]);

  // Socket realtime
  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("join_room", roomId);

    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off("receive_message");
  }, [socket, roomId]);

  // Send text
  const sendMessage = async () => {
    if (!text.trim() || !roomId) return;
    const msg = await insertMessage(user.id, text, "text");

    socket.emit("send_message", msg);
    setMessages(prev => [...prev, msg]);
    setText("");
  };

  // Send image with optimistic UI
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tạo tin nhắn tạm để hiển thị ngay
    const tempMsg = {
      id: "temp-" + Date.now(),
      senderId: user.id,
      text: URL.createObjectURL(file),
      type: "image",
      status: "uploading",
    };
    setMessages(prev => [...prev, tempMsg]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "LowGUpLoad");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dwqmg5d1f/image/upload",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      const imageUrl = data.secure_url;

      // Gửi server chat
      const msg = await insertMessage(user.id, imageUrl, "image");
      socket.emit("send_message", msg);
      console.log(msg)
      // Update tin nhắn tạm
      setMessages(prev => prev.map(m => (m.id === tempMsg.id ? msg : m)));
    } catch (err) {
      console.error("Upload image error:", err);
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, status: "error" } : m));
    }
  };

  useEffect(() => {
    const sendBtn = document.getElementById("sendBtn");
    const enterKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        sendBtn.click();
      }
    }
    document.addEventListener("keydown", enterKey);
    return () => {
      document.removeEventListener("keydown", enterKey);
    };
  }, []);

  return (
    <Card className="fixed bottom-4 right-4 rounded-xl shadow-xl">
      <div className="p-3 border-b flex justify-between">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9">
            {avatar ? <AvatarImage src={avatar} /> : <AvatarFallback>{getInitials(name)}</AvatarFallback>}
          </Avatar>
          <span>{name}</span>
        </div>
        <Button variant="ghost" onClick={onClose}><X /></Button>
      </div>

      <div ref={scrollRef} className="h-64 p-3 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, idx) => {
          const isOther = msg.senderId === user.id;
          return (
            <div key={idx} className={`flex items-end ${isOther ? "justify-start" : "justify-end"} gap-1`}>
              {isOther && (
                <Avatar className="h-9 w-9">
                  {avatar ? <AvatarImage src={avatar} /> : <AvatarFallback>{getInitials(name)}</AvatarFallback>}
                </Avatar>
              )}
              <div className={`px-3 py-2 rounded-lg max-w-[70%] wrap-break-word ${isOther ? "bg-gray-200 text-black" : "bg-blue-500 text-white"}`}>
                {msg.type === "image" ? (
                  <div className="relative">
                    <Image src={msg.text} className="max-w-[150px] rounded-lg" alt="msgImg" />
                    {msg.status === "uploading" && <span className="absolute top-1 right-1 text-xs bg-gray-200 px-1 rounded">⏳</span>}
                    {msg.status === "error" && <span className="absolute top-1 right-1 text-xs bg-red-200 px-1 rounded">❌</span>}
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t flex gap-2 items-center">
        <input type="file" onChange={handleImageUpload} className="hidden" id="uploadImage" />
        <Button onClick={() => document.getElementById('uploadImage')?.click()} variant="ghost" className="cursor-pointer px-2 py-1 border rounded"><Upload className="h-5 w-5" /></Button>

        <Input
          className="flex-1 px-3 py-1"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={sendMessage} className="cursor-pointer" id="sendBtn">Gửi</Button>
      </div>
    </Card>
  );
}
