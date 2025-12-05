
import NotificationList from "@/components/user/NotificationList";
import { getCookie } from "@/config/cookie";
import { verifyToken } from "@/config/jwt";

import { authMe } from "@/service/public/auth/auth";
import { getNotifications, markNotificationsAsRead } from "@/service/users/getNotifications";
import { Bell } from "lucide-react";


export const metadata = {
  title: "Thông báo",
};

export default async function NotificationsPage() {
  const token = await getCookie();
  const user = verifyToken(token);
  if (!user) {
    return <div className="p-8 text-center">Vui lòng đăng nhập để xem thông báo</div>;
  }

  // Lấy 50 thông báo đầu tiên (hoặc bạn có thể làm phân trang sau)
  const { notifications, unreadCount } = await getNotifications(Number(user.id), 50);
  console.log("Notifications:", notifications);
  // Đánh dấu tất cả đã đọc khi vào trang
  if (unreadCount > 0) {
    await markNotificationsAsRead(Number(user.id));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Thông báo</h1>
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Chưa có thông báo nào</p>
          </div>
        ) : (
          <NotificationList userId={Number(user.id)} notifications={notifications} />
        )}
      </div>
    </div>
  );
}