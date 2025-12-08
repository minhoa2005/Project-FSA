"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { useSocket } from "@/hooks/useSocket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatter";
import { Card } from "../ui/card";
import { Upload, X, MoreVertical } from "lucide-react";
import { Input } from "../ui/input";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteGroupMessage,
  getGroupMessages,
  insertGroupMessage,
  getGroupMembers,
} from "@/service/users/groupchat";

export default function GroupChatBox({ group, onClose }) {
  const socket = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const roomId = `group_${group?.id}`;

  // ✅ Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      setCurrentUserId(Number(userId));
    }

  }, []);

  // ✅ Load members + messages
  useEffect(() => {
    if (!group?.id) return;

    async function loadData() {
      const res = await getGroupMembers(group.id);
      if (res?.success) {
        setMembers(res.members);
      }

      const result = await getGroupMessages(group.id);
      setMessages(result || []);
    }

    loadData();
  }, [group]);

  // ✅ Socket
  useEffect(() => {
    if (!socket || !group?.id) return;

    socket.emit("join_room", roomId);

    socket.on("receive_group_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("group_message_deleted", (msgId) => {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    });

    return () => {
      socket.off("receive_group_message");
      socket.off("group_message_deleted");
    };
  }, [socket, group]);

  // ✅ Helpers
  const getSenderAvatar = (senderId) => {
    const user = members.find((m) => m.id === senderId);
    return user?.imgUrl || null;
  };

  const getSenderName = (senderId) => {
    const user = members.find((m) => m.id === senderId);
    return user?.fullName || "User";
  };

  // ✅ SEND TEXT (FIX THEO DB: message)
  const sendMessage = async () => {
    if (!text.trim()) return;

    const msg = await insertGroupMessage(group.id, text, "text");

    socket.emit("send_group_message", msg);

    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        message: text, // ✅ CHỐT LỖI TEXT KHÔNG HIỆN
        senderId: currentUserId,
      },
    ]);

    setText("");
  };

  const handleDeleteMessage = async (msgId) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));

    socket.emit("delete_group_message", {
      messageId: msgId,
      groupId: group.id,
    });

    await deleteGroupMessage(msgId);
  };

  // ✅ UPLOAD IMAGE (FIX THEO DB: message)
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const tempMsg = {
      id: "temp-" + Date.now(),
      message: URL.createObjectURL(file), // ✅ FIX text -> message
      type: "image",
      senderId: currentUserId,
      status: "uploading",
    };

    setMessages((prev) => [...prev, tempMsg]);

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

      const msg = await insertGroupMessage(group.id, imageUrl, "image");
      socket.emit("send_group_message", msg);

      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsg.id ? { ...msg, message: imageUrl } : m))
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMsg.id ? { ...m, status: "error" } : m
        )
      );
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-[380px] rounded-2xl shadow-2xl border bg-white overflow-hidden">
      {/* ✅ HEADER */}
      <div className="p-3 border-b flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(group?.name)}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{group?.name}</span>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* ✅ MESSAGE LIST */}
      <div
        ref={scrollRef}
        className="h-[380px] p-4 overflow-y-auto flex flex-col gap-4"
      >
        {messages.map((msg, idx) => {
          const isMe =
            currentUserId !== null &&
            Number(msg.senderId) === Number(currentUserId);
          const avatar = getSenderAvatar(msg.senderId);
          const name = getSenderName(msg.senderId);

          return (
            <div
              key={idx}
              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"
                } group`}
            >
              {!isMe && (
                <Avatar className="h-8 w-8">
                  {avatar ? (
                    <AvatarImage src={avatar} />
                  ) : (
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                  )}
                </Avatar>
              )}

              <div className="flex flex-col gap-1 max-w-[75%]">
                {!isMe && (
                  <span className="text-xs text-gray-500 ml-1">
                    {msg.senderName || name}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {isMe && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition h-7 w-7"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-red-500"
                        >
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* ✅ IMAGE */}
                  {msg.type === "image" && msg.message ? (
                    <Image
                      src={msg.message}
                      alt="img"
                      width={200}
                      height={160}
                      className="rounded-xl border object-cover"
                      unoptimized
                    />
                  ) : msg.type === "image" ? (
                    <div className="w-[200px] h-[160px] flex items-center justify-center border rounded-xl text-xs text-gray-400">
                      Đang tải ảnh...
                    </div>
                  ) : (
                    /* ✅ TEXT (FIX QUAN TRỌNG) */
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm shadow
                        ${isMe
                          ? "bg-blue-500 text-white"
                          : "bg-white border text-gray-800"
                        }`}
                    >
                      {msg.message || "[Tin nhắn rỗng]"}
                    </div>
                  )}
                </div>
              </div>


            </div>
          );
        })}
      </div>

      {/* ✅ INPUT */}
      <div className="p-3 border-t flex items-center gap-2 bg-white">
        <input
          type="file"
          onChange={handleImageUpload}
          className="hidden"
          id="uploadImage"
        />

        <Button
          onClick={() =>
            document.getElementById("uploadImage")?.click()
          }
          variant="ghost"
        >
          <Upload className="h-5 w-5" />
        </Button>

        <Input
          className="flex-1 rounded-full px-4"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={sendMessage} className="rounded-full">
          Gửi
        </Button>
      </div>
    </Card>
  );
}
