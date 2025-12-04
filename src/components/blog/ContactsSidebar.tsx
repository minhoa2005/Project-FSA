"use client";
import { useState, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Group, GroupIcon, MoreHorizontal, Search } from "lucide-react";
import { getFollowingUsers } from "@/service/users/chat";
import { getInitials } from "@/lib/formatter";
import ChatBox from "../chat/ChatBox";
import { Input } from "../ui/input";
import GroupChat from "../chat/GroupChat";
import { useRouter } from "next/navigation";
import { getUserGroups } from "@/service/users/groupchat";
import GroupChatBox from "../chat/GroupChatBox";

export default function ContactsSidebar() {
  const [backup, setBackup] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState<{
    type: "user" | "group";
    data: any;
  } | null>(null);
  const [groups, setGroups] = useState([]);
  const router = useRouter();
  useEffect(() => {
    getFollowingUsers().then((users) => {
      const mapped = users.map(user => ({
        id: user.id,
        name: user.username,
        avatar: user.imgUrl, // null sẽ fallback AvatarFallback
      }));
      setContacts(mapped);
      setBackup(mapped);
    });
    getUserGroups().then(groups => setGroups(groups));
  }, []);

  const handleSearch = (query: string) => {
    const res = contacts.filter(items => items.name.includes(query))
    setBackup(res);
  }


  return (
    <div className="border-l bg-background/50 h-full ">
      <div className="p-4 border-b flex items-center justify-between mb-3 gap-2">

        <Input placeholder="Nhập tên người dùng" onChange={(e) => { handleSearch(e.target.value) }} />
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { router.push(`/chatgroup`) }}><GroupIcon className="h-4 w-4" /></Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2">
          {backup.map(contact => (
            <button
              key={contact.id}
              onClick={() =>
                setActiveChat({
                  type: "user",
                  data: contact
                })
              }

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
          <h2 className="text-center">Group</h2>
          {groups.map(g => (
            <button
              key={g.id}

              onClick={() =>
                setActiveChat({
                  type: "group",
                  data: g
                })
              }
              className="
                        w-full flex items-center gap-3 p-2 rounded-lg
                      hover:bg-gray-100 transition-colors duration-200
                        border border-transparent hover:border-gray-200
                        "
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-9 w-9 border shadow-sm">
                  {g.avatar ? (
                    <AvatarImage src={g.avatar} />
                  ) : (
                    <AvatarFallback>{getInitials(g.name)}</AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">{g.name}</p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
      {activeChat?.type === "user" && (
        <ChatBox
          user={activeChat.data}
          onClose={() => setActiveChat(null)}
          avatar={activeChat.data.avatar}
          name={activeChat.data.name}
        />
      )}

      {activeChat?.type === "group" && (
        <GroupChatBox
          group={activeChat.data}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
