"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, UserPlus, Bell } from "lucide-react";
import { formatTimeAgo } from "@/lib/formatTimeAgo"; // Hàm thuần JS bạn vừa tạo

type Notification = {
  id: number;
  actorUsername: string;
  actorFullName: string;
  actorAvatar: string | null;
  type: string;
  message: string;
  blogId: number | null;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationList({ notifications }: { notifications: Notification[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case "comment":
      case "reply":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "share":
        return <Share2 className="w-5 h-5 text-purple-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Chưa có thông báo nào</p>
          <p className="text-sm mt-2">Khi có hoạt động mới, bạn sẽ thấy ở đây</p>
        </div>
      ) : (
        notifications.map((notif) => (
          <Link
            key={notif.id}
            href={notif.blogId ? `/post/${notif.blogId}` : `/personal/${notif.actorUsername}`}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-accent/70 group ${
              !notif.isRead
                ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                : "bg-card border-border"
            }`}
          >
            {/* Avatar + Icon loại thông báo */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12 ring-2 ring-background">
                <AvatarImage src={notif.actorAvatar || undefined} />
                <AvatarFallback className="bg-muted">
                  {notif.actorUsername[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 border-2 border-background shadow-md">
                {getIcon(notif.type)}
              </div>
            </div>

            {/* Nội dung */}
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground">
                  {notif.actorFullName || notif.actorUsername}
                </span>{" "}
                <span className="text-foreground/90">{notif.message}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                {formatTimeAgo(notif.createdAt)}
              </p>
            </div>

            {/* Chấm chưa đọc */}
            {!notif.isRead && (
              <div className="w-3 h-3 bg-primary rounded-full mt-3 flex-shrink-0 animate-pulse" />
            )}
          </Link>
        ))
      )}
    </div>
  );
}