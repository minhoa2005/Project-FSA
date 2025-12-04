"use server";

import { connectDB, sql } from "@/config/db";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notificationService";

const FEED_PATH = "/(private)/(user)";

// ==========================================
// SHARE BLOG
// ==========================================
export async function shareBlog(formData: FormData) {
  try {
    const pool = await connectDB();

    const originalBlogId = Number(formData.get("originalBlogId"));
    const userId = Number(formData.get("userId"));
    const textRaw = (formData.get("text") as string) || "";
    const text = textRaw.trim() || null;

    // Validate đầu vào
    if (!originalBlogId || isNaN(originalBlogId)) {
      return { success: false, message: "Bài viết gốc không hợp lệ" };
    }
    if (!userId || isNaN(userId)) {
      return { success: false, message: "Người dùng không hợp lệ" };
    }

    // 1. Kiểm tra bài viết gốc có tồn tại và chưa bị xóa
    const originalBlogResult = await pool.request()
      .input("id", sql.Int, originalBlogId)
      .query(`
        SELECT id, creatorId 
        FROM Blogs 
        WHERE id = @id AND isDeleted = 0
      `);

    if (originalBlogResult.recordset.length === 0) {
      return { success: false, message: "Bài viết gốc không tồn tại hoặc đã bị xóa" };
    }

    const originalCreatorId = originalBlogResult.recordset[0].creatorId;

    // 2. Tạo bài viết mới (bài share)
    const newBlogResult = await pool.request()
      .input("text", sql.NVarChar(sql.MAX), text)
      .input("creatorId", sql.Int, userId)
      .query(`
        INSERT INTO Blogs (text, creatorId, createdAt, updatedAt)
        OUTPUT INSERTED.id
        VALUES (@text, @creatorId, GETDATE(), GETDATE())
      `);

    const newBlogId = newBlogResult.recordset[0].id as number;

    // 3. Lưu vào bảng BlogShares
    await pool.request()
      .input("blogId", sql.Int, newBlogId)
      .input("originalBlogId", sql.Int, originalBlogId)
      .input("userId", sql.Int, userId)
      .input("text", sql.NVarChar(sql.MAX), text)
      .query(`
        INSERT INTO BlogShares (blogId, originalBlogId, userId, text)
        VALUES (@blogId, @originalBlogId, @userId, @text)
      `);

    // 4. GỬI THÔNG BÁO CHO CHỦ BÀI GỐC (nếu không phải chính mình)
    if (originalCreatorId !== userId) {
      await createNotification(
        originalCreatorId,   // Người nhận: chủ bài viết gốc
        userId,              // Người thực hiện: người share
        "share",             // Loại thông báo
        originalBlogId       // Gắn với bài viết gốc để click vào xem được
      );
    }

    // 5. Revalidate các trang cần cập nhật
    revalidatePath(FEED_PATH);
    revalidatePath(`/post/${originalBlogId}`);
    revalidatePath(`/post/${newBlogId}`);
    revalidatePath("/");

    return {
      success: true,
      blogId: newBlogId,
      message: "Chia sẻ bài viết thành công!"
    };

  } catch (error: any) {
    console.error("[shareBlog] Error:", error);
    return {
      success: false,
      message: error.message || "Không thể chia sẻ bài viết. Vui lòng thử lại!"
    };
  }
}
// ==========================================
// GET SHARED BLOG INFO
// ==========================================
export async function getSharedBlogInfo(blogId: number) {
  try {
    const pool = await connectDB();
    
    const result = await pool.request()
      .input("blogId", sql.Int, blogId)
      .query(`
        SELECT 
          bs.originalBlogId,
          b.text AS originalText,
          b.creatorId AS originalCreatorId,
          b.createdAt AS originalCreatedAt,
          up.fullName AS originalAuthorName,
          up.imgUrl AS originalAuthorAvatar,
          a.username AS originalAuthorUsername,
          m.id AS mediaId,
          m.mediaUrl,
          m.mediaType
        FROM BlogShares bs
        INNER JOIN Blogs b ON bs.originalBlogId = b.id
        LEFT JOIN UserProfile up ON b.creatorId = up.accountId
        LEFT JOIN Account a ON b.creatorId = a.id
        LEFT JOIN BlogMedia m ON m.blogId = b.id
        WHERE bs.blogId = @blogId AND b.isDeleted = 0
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    // Group media files
    const first = result.recordset[0];
    const media: any[] = [];
    
    result.recordset.forEach((row: any) => {
      if (row.mediaId && !media.some(m => m.id === row.mediaId)) {
        media.push({
          id: row.mediaId,
          url: row.mediaUrl,
          type: row.mediaType
        });
      }
    });

    return {
      originalBlogId: first.originalBlogId,
      originalText: first.originalText,
      originalCreatorId: first.originalCreatorId,
      originalCreatedAt: first.originalCreatedAt,
      originalAuthor: {
        name: first.originalAuthorName || first.originalAuthorUsername || "User",
        avatar: first.originalAuthorAvatar || "",
        username: first.originalAuthorUsername
      },
      media
    };
  } catch (error) {
    console.error("[getSharedBlogInfo] Error:", error);
    return null;
  }
}

// ==========================================
// GET SHARE COUNT
// ==========================================
export async function getShareCount(blogId: number) {
  try {
    const pool = await connectDB();
    
    const result = await pool.request()
      .input("blogId", sql.Int, blogId)
      .query(`
        SELECT COUNT(*) as count 
        FROM BlogShares 
        WHERE originalBlogId = @blogId
      `);

    return result.recordset[0].count || 0;
  } catch (error) {
    console.error("[getShareCount] Error:", error);
    return 0;
  }
}