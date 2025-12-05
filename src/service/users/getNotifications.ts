"use server";

import { connectDB, sql } from "@/config/db";

export async function getNotifications(userId: number, limit = 20) {
  try {
    const pool = await connectDB();
    if (!pool) return { notifications: [], unreadCount: 0 };

    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .input("limit", sql.Int, limit)
      .query(`
        SELECT TOP (@limit)
          n.*,
          a.username AS actorUsername,
          up.imgUrl AS actorAvatar,
          up.fullName AS actorFullName
        FROM Notifications n
        JOIN Account a ON n.actorId = a.id
        LEFT JOIN UserProfile up ON a.id = up.accountId
        WHERE n.userId = @userId
        ORDER BY n.createdAt DESC
      `);
    const unread = await pool.request()
      .input("userId", sql.Int, userId)
      .query("SELECT COUNT(*) AS count FROM Notifications WHERE userId = @userId AND isRead = 0");

    return {
      notifications: result.recordset,
      unreadCount: Number(unread.recordset[0].count)
    };
  } catch (error) {
    console.error("getNotifications error:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

// Đánh dấu đã đọc (gọi khi mở dropdown)
export async function markNotificationsAsRead(userId: number) {
  try {
    const pool = await connectDB();
    if (!pool) return;
    await pool.request()
      .input("userId", sql.Int, userId)
      .query("UPDATE Notifications SET isRead = 1 WHERE userId = @userId AND isRead = 0");
  } catch (error) {
    console.error("markAsRead error:", error);
  }
}