"use server";

import fs from "fs/promises";
import path from "path";
import { connectDB, sql } from "@/config/db";
import { revalidatePath } from "next/cache";
import { removeVietnameseSigns } from "@/lib/formatter";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const FEED_PATH = "/(private)/(user)";

// ==========================================
// 1. CREATE BLOG
// ==========================================
export async function createBlog(formData: FormData) {
  try {
    const pool = await connectDB();

    const textRaw = (formData.get("text") as string) || "";
    const text = textRaw.trim() || null;
    const creatorId = Number(formData.get("creatorId"));

    if (!creatorId) {
      return { success: false, message: "creatorId is required" };
    }

    const result = await pool
      .request()
      .input("text", sql.NVarChar(sql.MAX), text)
      .input("creatorId", sql.Int, creatorId)
      .query(`
        INSERT INTO Blogs(text, creatorId)
        OUTPUT inserted.id
        VALUES (@text, @creatorId)
      `);

    const blogId = result.recordset[0].id as number;

    const mediaFiles = formData.getAll("media") as File[];
    if (mediaFiles.length > 0) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      for (const file of mediaFiles) {
        if (!file || file.size === 0) continue;

        const bytes = Buffer.from(await file.arrayBuffer());
        const safeName = removeVietnameseSigns(file.name).replace(/\s+/g, "-");
        const fileName = `${Date.now()}-${safeName}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        await fs.writeFile(filePath, bytes);

        const publicUrl = `/uploads/${fileName}`;
        const type = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : "other";

        await pool
          .request()
          .input("blogId", sql.Int, blogId)
          .input("url", sql.VarChar(255), publicUrl)
          .input("type", sql.VarChar(20), type)
          .query(
            "INSERT INTO BlogMedia(blogId, mediaUrl, mediaType) VALUES (@blogId, @url, @type)"
          );
      }
    }

    revalidatePath(FEED_PATH);
    return { success: true, message: "Blog created successfully" };
  } catch (error) {
    console.error("[createBlog] Error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to create blog" };
  }
}

// ==========================================
// 2. UPDATE BLOG
// ==========================================
export async function updateBlog(formData: FormData) {
  try {
    const pool = await connectDB();

    const blogId = Number(formData.get("blogId"));
    const textRaw = (formData.get("text") as string) || "";
    const text = textRaw.trim() || null;

    const removeIdsRaw = (formData.get("removeMediaIds") as string) || "";
    const removeIds = removeIdsRaw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    if (!blogId) {
      return { success: false, message: "blogId is required" };
    }

    await pool
      .request()
      .input("id", sql.Int, blogId)
      .input("text", sql.NVarChar(sql.MAX), text)
      .query(
        "UPDATE Blogs SET text = @text, updatedAt = GETDATE() WHERE id = @id",
      );

    if (removeIds.length > 0) {
      await pool
        .request()
        .query(
          `DELETE FROM BlogMedia WHERE id IN (${removeIds
            .map((n) => Number(n))
            .join(",")})`,
        );
    }

    const newMedia = formData.getAll("newMedia") as File[];
    if (newMedia.length > 0) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      for (const file of newMedia) {
        if (!file || file.size === 0) continue;

        const bytes = Buffer.from(await file.arrayBuffer());
        const safeName = removeVietnameseSigns(file.name).replace(/\s+/g, "-");
        const fileName = `${Date.now()}-${safeName}`;
        const filePath = path.join(UPLOAD_DIR, fileName);

        await fs.writeFile(filePath, bytes);

        const publicUrl = `/uploads/${fileName}`;
        const type = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : "other";

        await pool
          .request()
          .input("blogId", sql.Int, blogId)
          .input("url", sql.VarChar(255), publicUrl)
          .input("type", sql.VarChar(20), type)
          .query(
            "INSERT INTO BlogMedia(blogId, mediaUrl, mediaType) VALUES (@blogId, @url, @type)"
          );
      }
    }

    revalidatePath(FEED_PATH);
    return { success: true, message: "Blog updated successfully" };
  } catch (error) {
    console.error("[updateBlog] Error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to update blog" };
  }
}

// ==========================================
// 3. DELETE BLOG
// ==========================================
export async function deleteBlog(formData: FormData) {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);
  try {
    const id = Number(formData.get("blogId"));
    if (!id) {
      return { success: false, message: "blogId is required" };
    }
    await transaction.begin();

    await pool.request().input("blogId", sql.Int, id).query(`
        DELETE CL FROM CommentLikes CL JOIN Comments C ON CL.commentId = C.id WHERE C.blogId = @blogId
      `);
    await pool.request().input("blogId", sql.Int, id).query(`
        DELETE FROM Comments WHERE blogId = @blogId
      `);
    await pool.request().input("blogId", sql.Int, id).query(`
        DELETE FROM [Like] WHERE blogId = @blogId
      `);
    await pool.request()
      .input("blogId", sql.Int, id)
      .query(`DELETE FROM BlogMedia WHERE blogId = @blogId`);

    await pool.request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM Blogs WHERE id = @id`);

    await transaction.commit();
    revalidatePath(FEED_PATH);
    return { success: true, message: "Blog deleted successfully" };
  } catch (error) {
    await transaction.rollback();
    console.error("[deleteBlog] Error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to delete blog" };
  }
}

// ==========================================
// 4. GET BLOGS & COMMENT TREE
// ==========================================

function buildCommentTree(comments: any[], userLikedCommentIds: Set<number>, commentLikeCounts: Map<number, number>) {
  try {
    const map = new Map();
    const roots: any[] = [];

    comments.forEach((c) => {
      map.set(c.id, {
        id: String(c.id),
        author: c.fullName || c.username || "User",
        avatar: c.imgUrl || "",
        content: c.text,
        timestamp: new Date(c.createdAt).toLocaleString("vi-VN"),
        createdAtRaw: c.createdAt,
        likes: commentLikeCounts.get(c.id) || 0,
        isLiked: userLikedCommentIds.has(c.id),
        replies: [],
        parentId: c.parentId,
        replyTo: undefined
      });
    });

    map.forEach((node) => {
      if (!node.parentId) {
        roots.push(node);
      } else {
        const directParent = map.get(node.parentId);
        if (directParent) {
          node.replyTo = directParent.author;

          let rootAncestor = directParent;
          let current = directParent;
          let depth = 0;
          while (current.parentId && depth < 20) {
            const p = map.get(current.parentId);
            if (!p) break;
            current = p;
            depth++;
          }
          rootAncestor = current;

          rootAncestor.replies.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    roots.forEach(root => {
      if (root.replies?.length > 0) {
        root.replies.sort((a: any, b: any) => new Date(a.createdAtRaw).getTime() - new Date(b.createdAtRaw).getTime());
      }
    });

    return roots;
  } catch (error) {
    console.error("[buildCommentTree] Error:", error);
    return [];
  }
}

export async function getBlogs(currentUserId?: number) {
  try {
    const pool = await connectDB();

    const blogsResult = await pool.request().query(`
      SELECT b.id AS blogId, b.text, b.creatorId, b.createdAt, b.updatedAt,
        up.fullName, up.imgUrl, a.username, m.id AS mediaId, m.mediaUrl, m.mediaType
      FROM Blogs b
      LEFT JOIN UserProfile up ON up.accountId = b.creatorId
      LEFT JOIN Account a ON a.id = b.creatorId
      LEFT JOIN BlogMedia m ON m.blogId = b.id
      ORDER BY b.createdAt DESC, m.id ASC
    `);

    const likesCountResult = await pool.request().query(`SELECT blogId, COUNT(*) as count FROM [Like] GROUP BY blogId`);
    const likesMap = new Map<number, number>();
    likesCountResult.recordset.forEach((r: any) => likesMap.set(r.blogId, r.count));

    const commentsResult = await pool.request().query(`
      SELECT c.id, c.blogId, c.text, c.createdAt, c.parentId, up.fullName, up.imgUrl, a.username
      FROM Comments c
      LEFT JOIN UserProfile up ON up.accountId = c.userId
      LEFT JOIN Account a ON a.id = c.userId
      ORDER BY c.createdAt ASC
    `);

    const commentLikesCountResult = await pool.request().query(`SELECT commentId, COUNT(*) as count FROM CommentLikes GROUP BY commentId`);
    const commentLikesMap = new Map<number, number>();
    commentLikesCountResult.recordset.forEach((r: any) => commentLikesMap.set(r.commentId, r.count));

    const userLikedPostSet = new Set<number>();
    const userLikedCommentSet = new Set<number>();

    if (currentUserId) {
      const userPostLikes = await pool.request().input("uid", sql.Int, currentUserId)
        .query("SELECT blogId FROM [Like] WHERE userId = @uid");
      userPostLikes.recordset.forEach((r: any) => userLikedPostSet.add(r.blogId));

      const userCommentLikes = await pool.request().input("uid", sql.Int, currentUserId)
        .query("SELECT commentId FROM CommentLikes WHERE userId = @uid");
      userCommentLikes.recordset.forEach((r: any) => userLikedCommentSet.add(r.commentId));
    }

    const commentsByBlog = new Map<number, any[]>();
    commentsResult.recordset.forEach((c: any) => {
      if (!commentsByBlog.has(c.blogId)) commentsByBlog.set(c.blogId, []);
      commentsByBlog.get(c.blogId).push(c);
    });

    const blogMap = new Map<number, any>();
    const rows = blogsResult.recordset || [];

    for (const row of rows) {
      const blogId = row.blogId;
      if (!blogMap.has(blogId)) {
        const rawComments = commentsByBlog.get(blogId) || [];
        blogMap.set(blogId, {
          id: blogId,
          text: row.text,
          creatorId: row.creatorId,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          fullName: row.fullName,
          username: row.username,
          imgUrl: row.imgUrl,
          media: [],
          likes: likesMap.get(blogId) || 0,
          isLikedByCurrentUser: userLikedPostSet.has(blogId),
          comments: buildCommentTree(rawComments, userLikedCommentSet, commentLikesMap),
          shares: 0,
        });
      }
      if (row.mediaId) {
        blogMap.get(blogId).media.push({ id: row.mediaId, url: row.mediaUrl, type: row.mediaType });
      }
    }

    return Array.from(blogMap.values());
  } catch (error) {
    console.error("[getBlogs] Error:", error);
    return [];
  }
}

// ==========================================
// 5. INTERACTION ACTIONS
// ==========================================

export async function toggleLike(blogId: number, userId: number) {
  try {
    if (!userId) throw new Error("User ID required");
    const pool = await connectDB();
    const check = await pool.request().input("userId", sql.Int, userId).input("blogId", sql.Int, blogId)
      .query("SELECT * FROM [Like] WHERE userId = @userId AND blogId = @blogId");
    if (check.recordset.length > 0) {
      await pool.request().input("userId", sql.Int, userId).input("blogId", sql.Int, blogId)
        .query("DELETE FROM [Like] WHERE userId = @userId AND blogId = @blogId");
    } else {
      await pool.request().input("userId", sql.Int, userId).input("blogId", sql.Int, blogId)
        .query("INSERT INTO [Like] (userId, blogId) VALUES (@userId, @blogId)");
    }
    revalidatePath(FEED_PATH);
  } catch (error) {
    console.error("[toggleLike] Error:", error);
    throw error;
  }
}

export async function toggleCommentLike(commentId: number, userId: number) {
  try {
    if (!userId) throw new Error("User ID required");
    const pool = await connectDB();
    const check = await pool.request().input("userId", sql.Int, userId).input("commentId", sql.Int, commentId)
      .query("SELECT * FROM CommentLikes WHERE userId = @userId AND commentId = @commentId");
    if (check.recordset.length > 0) {
      await pool.request().input("userId", sql.Int, userId).input("commentId", sql.Int, commentId)
        .query("DELETE FROM CommentLikes WHERE userId = @userId AND commentId = @commentId");
    } else {
      await pool.request().input("userId", sql.Int, userId).input("commentId", sql.Int, commentId)
        .query("INSERT INTO CommentLikes (userId, commentId) VALUES (@userId, @commentId)");
    }
    revalidatePath(FEED_PATH);
  } catch (error) {
    console.error("[toggleCommentLike] Error:", error);
    throw error;
  }
}

// FIX: Trả về object comment đầy đủ
export async function addComment(blogId: number, userId: number, text: string, parentId?: number) {
  try {
    if (!userId) throw new Error("User ID required");
    if (!text || !text.trim()) return null;

    const validParentId = (parentId && !isNaN(parentId)) ? parentId : null;
    const pool = await connectDB();

    // 1. Insert và lấy ID mới
    const insertResult = await pool.request()
      .input("userId", sql.Int, userId)
      .input("blogId", sql.Int, blogId)
      .input("text", sql.NVarChar(sql.MAX), text)
      .input("parentId", sql.Int, validParentId)
      .query(`
        INSERT INTO Comments (userId, blogId, text, parentId) 
        OUTPUT inserted.id 
        VALUES (@userId, @blogId, @text, @parentId)
      `);

    const newCommentId = insertResult.recordset[0].id;

    // 2. Query lại data đầy đủ để trả về Client
    const fullCommentResult = await pool.request()
      .input("id", sql.Int, newCommentId)
      .query(`
        SELECT c.id, c.text, c.createdAt, c.parentId, 
               up.fullName, up.imgUrl, a.username
        FROM Comments c
        LEFT JOIN UserProfile up ON up.accountId = c.userId
        LEFT JOIN Account a ON a.id = c.userId
        WHERE c.id = @id
      `);

    const raw = fullCommentResult.recordset[0];

    // Trigger update cache
    revalidatePath(FEED_PATH);

    // 3. Return format chuẩn
    return {
      success: true,
      data: {
        id: String(raw.id),
        author: raw.fullName || raw.username || "Bạn",
        avatar: raw.imgUrl || "",
        content: raw.text,
        timestamp: new Date(raw.createdAt).toLocaleString("vi-VN"),
        createdAtRaw: raw.createdAt,
        likes: 0,
        isLiked: false,
        replies: [],
        parentId: raw.parentId,
        replyTo: undefined
      }
    };
  } catch (error) {
    console.error("[addComment] Error:", error);
    return { success: false, error };
  }
}