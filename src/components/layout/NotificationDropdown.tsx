// src/app/components/layout/NotificationDropdown.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Heart, MessageCircle, Share2, UserPlus } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import { getNotifications, markNotificationsAsRead } from "@/service/users/getNotifications";

export default function NotificationDropdown({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (open && userId) {
      getNotifications(userId, 10).then(data => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      });
      // Đánh dấu đã đọc khi mở dropdown
      if (unreadCount > 0) {
        markNotificationsAsRead(userId);
        setUnreadCount(0);
      }
    }
  }, [open, userId, unreadCount]);

  const getIcon = (type: string) => {
    switch (type) {
      case "like": return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case "comment":
      case "reply": return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "share": return <Share2 className="w-4 h-4 text-purple-500" />;
      case "follow": return <UserPlus className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Nút chuông thông báo */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 hover:bg-accent rounded-full transition-all"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-card border rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b bg-muted/50">
            <h3 className="text-lg font-bold">Thông báo</h3>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.blogId ? `/post/${notif.blogId}` : `/personal/${notif.actorUsername}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 p-4 hover:bg-accent transition-all border-b last:border-0 ${
                    !notif.isRead ? "bg-blue-50/60 dark:bg-blue-950/30" : ""
                  }`}
                >
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={notif.actorAvatar || undefined} />
                    <AvatarFallback>{notif.actorUsername[0].toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">
                      <strong>{notif.actorFullName || notif.actorUsername}</strong>{" "}
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getIcon(notif.type)}
                    {!notif.isRead && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* NÚT "XEM TẤT CẢ THÔNG BÁO" */}
          <div className="border-t bg-muted/30">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block w-full text-center py-3.5 text-sm font-medium text-primary hover:bg-accent/70 transition-all rounded-b-xl"
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}