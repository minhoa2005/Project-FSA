"use client";
import { useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MoreHorizontal, Search } from "lucide-react";
import { getFollowingUsers } from "@/service/users/chat";
import { getInitials } from "@/lib/formatter";
import ChatBox from "../chat/ChatBox";

export default function ContactsSidebar() {
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  useEffect(() => {
    getFollowingUsers(0, 10).then((users) => {
      const mapped = users.map(user => ({
        id: user.id,
        name: user.username,
        avatar: user.imgUrl, // null sẽ fallback AvatarFallback
      }));
      setContacts(mapped);
    });
  }, []);

  return (
    <div className="w-80 border-l bg-background/50">
      <div className="p-4 border-b flex items-center justify-between mb-3">
        <h3>Người liên hệ</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Search className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2">
          {contacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => setActiveChat(contact)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="relative">
                <Avatar className="h-9 w-9">
                  {contact.avatar ? (
                    <AvatarImage src={contact.avatar} />
                  ) : (
                    <AvatarFallback >
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm">{contact.name}</p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
      {activeChat && (
        <ChatBox
          user={activeChat}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
