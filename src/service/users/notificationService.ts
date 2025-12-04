// src/service/users/notificationService.ts
"use server";

import { connectDB, sql } from "@/config/db";

type NotificationType = "like" | "comment" | "reply" | "share" | "follow";

export async function createNotification(
  userId: number,      // Người nhận
  actorId: number,     // Người thực hiện
  type: NotificationType,
  blogId?: number,
  commentId?: number
) {
  if (userId === actorId) return; // Không tự thông báo chính mình

  try {
    const pool = await connectDB();
    if (!pool) return;

    let message = "";
    switch (type) {
      case "like":    message = "đã thích bài viết của bạn"; break;
      case "comment": message = "đã bình luận về bài viết của bạn"; break;
      case "reply":   message = "đã trả lời bình luận của bạn"; break;
      case "share":   message = "đã chia sẻ bài viết của bạn"; break;
      case "follow":  message = "đã theo dõi bạn"; break;
    }

    await pool.request()
      .input("userId", sql.Int, userId)
      .input("actorId", sql.Int, actorId)
      .input("type", sql.VarChar(50), type)
      .input("blogId", sql.Int, blogId ?? null)
      .input("commentId", sql.Int, commentId ?? null)
      .input("message", sql.NVarChar(255), message)
      .query(`
        INSERT INTO Notifications (userId, actorId, type, blogId, commentId, message)
        VALUES (@userId, @actorId, @type, @blogId, @commentId, @message)
      `);
  } catch (error) {
    console.error("createNotification error:", error);
  }
}