"use server";

import { connectDB, sql } from "@/config/db";
import { revalidatePath } from "next/cache";

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

    if (!originalBlogId || !userId) {
      return { success: false, message: "Missing required fields" };
    }

    // 1. Kiểm tra bài viết gốc có tồn tại không
    const checkOriginal = await pool.request()
      .input("id", sql.Int, originalBlogId)
      .query("SELECT id FROM Blogs WHERE id = @id AND isDeleted = 0");

    if (checkOriginal.recordset.length === 0) {
      return { success: false, message: "Original blog not found" };
    }

    // 2. Tạo bài viết mới (bài share)
    const createBlogResult = await pool.request()
      .input("text", sql.NVarChar(sql.MAX), text)
      .input("creatorId", sql.Int, userId)
      .query(`
        INSERT INTO Blogs(text, creatorId) 
        OUTPUT inserted.id 
        VALUES (@text, @creatorId)
      `);

    const newBlogId = createBlogResult.recordset[0].id as number;

    // 3. Tạo record trong BlogShares
    await pool.request()
      .input("blogId", sql.Int, newBlogId)
      .input("originalBlogId", sql.Int, originalBlogId)
      .input("userId", sql.Int, userId)
      .input("text", sql.NVarChar(sql.MAX), text)
      .query(`
        INSERT INTO BlogShares(blogId, originalBlogId, userId, text)
        VALUES (@blogId, @originalBlogId, @userId, @text)
      `);

    revalidatePath(FEED_PATH);
    revalidatePath("/");
    
    return { success: true, blogId: newBlogId };
  } catch (error) {
    console.error("[shareBlog] Error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to share blog" 
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