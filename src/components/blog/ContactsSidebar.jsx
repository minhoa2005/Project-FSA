

import { Search, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";



export function ContactsSidebar() {
  const contacts = [
    {
      id: 1,
      name: "Meta AI",
      avatar: "",
      isOnline: true,
    },
    {
      id: 2,
      name: "Nguyễn Xuân Dương",
      Avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      isOnline: true,
    },
    {
      id: 3,
      name: "Minh Nhật",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      isOnline: true,
    },
    {
      id: 4,
      name: "Hiếu Trung",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      isOnline: false,
      lastSeen: "8 phút",
    },
    {
      id: 5,
      name: "Bảo Búi",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      isOnline: false,
      lastSeen: "23 phút",
    },
    {
      id: 6,
      name: "Trung Vũ",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      isOnline: true,
    },
    {
      id: 7,
      name: "Vũ Linh",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      isOnline: true,
    },
    {
      id: 8,
      name: "Huy Tuyến",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      isOnline: false,
    },
  ];

  return (
    <div className="w-80 border-l bg-background/50">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3>Người liên hệ</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="relative">
                <Avatar className="h-9 w-9">
                  {contact.avatar ? (
                    <AvatarImage src={contact.avatar} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {contact.name[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                {contact.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm flex items-center gap-1">
                  {contact.name}
                  {contact.id === 1 && (
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  )}
                </p>
                {contact.lastSeen && (
                  <p className="text-xs text-muted-foreground">{contact.lastSeen}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
