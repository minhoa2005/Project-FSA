"use server";

import fs from "fs/promises";
import path from "path";
import { connectDB, sql } from "@/config/db";
import { revalidatePath } from "next/cache";
import { removeVietnameseSigns } from "@/lib/formatter";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const FEED_PATH = "/(private)/(user)";

export async function createBlog(formData: FormData) {
  const pool = await connectDB();

  const textRaw = (formData.get("text") as string) || "";
  const text = textRaw.trim() || null;
  const creatorId = Number(formData.get("creatorId"));

  if (!creatorId) {
    throw new Error("creatorId is required");
  }

  // 1. tạo blog
  const result = await pool
    .request()
    .input("text", sql.NVarChar(sql.MAX), text) // dùng NVARCHAR để không bị ??? tiếng Việt
    .input("creatorId", sql.Int, creatorId)
    .query(`
      INSERT INTO Blogs(text, creatorId)
      OUTPUT inserted.id
      VALUES (@text, @creatorId)
    `);

  const blogId = result.recordset[0].id as number;

  // 2. xử lý nhiều file media
  const mediaFiles = formData.getAll("media") as File[];

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
        "INSERT INTO BlogMedia(blogId, mediaUrl, mediaType) VALUES (@blogId, @url, @type)",
      );
  }


  revalidatePath(FEED_PATH);


}
export async function updateBlog(formData: FormData) {
  const pool = await connectDB();

  const blogId = Number(formData.get("blogId"));
  const textRaw = (formData.get("text") as string) || "";
  const text = textRaw.trim() || null;

  const removeIdsRaw = (formData.get("removeMediaIds") as string) || "";
  const removeIds = removeIdsRaw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  if (!blogId) throw new Error("blogId is required");

  // update text
  await pool
    .request()
    .input("id", sql.Int, blogId)
    .input("text", sql.NVarChar(sql.MAX), text)
    .query(
      "UPDATE Blogs SET text = @text, updatedAt = GETDATE() WHERE id = @id",
    );

  // xóa media cũ
  if (removeIds.length > 0) {
    await pool
      .request()
      .query(
        `DELETE FROM BlogMedia WHERE id IN (${removeIds
          .map((n) => Number(n))
          .join(",")})`,
      );
  }

  // thêm media mới
  const newMedia = formData.getAll("newMedia") as File[];
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
        "INSERT INTO BlogMedia(blogId, mediaUrl, mediaType) VALUES (@blogId, @url, @type)",
      );
  }

  revalidatePath(FEED_PATH);
}
export async function getBlogs() {
  const pool = await connectDB();

  // lấy blogs + user + media
  const result = await pool.request().query(`
    SELECT 
      b.id AS blogId,
      b.text,
      b.creatorId,
      b.createdAt,
      b.updatedAt,
      up.fullName,
      up.imgUrl,
      a.username,
      m.id AS mediaId,
      m.mediaUrl,
      m.mediaType
    FROM Blogs b
    LEFT JOIN UserProfile up ON up.accountId = b.creatorId
    LEFT JOIN Account a ON a.id = b.creatorId
    LEFT JOIN BlogMedia m ON m.blogId = b.id
    ORDER BY b.createdAt DESC, m.id ASC
  `);

  const rows = result.recordset || [];

  const map = new Map<number, any>();

  for (const row of rows) {
    const blogId = row.blogId as number;

    if (!map.has(blogId)) {
      map.set(blogId, {
        id: blogId,
        text: row.text,
        creatorId: row.creatorId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        fullName: row.fullName,
        username: row.username,
        imgUrl: row.imgUrl,
        media: [] as any[],
      });
    }

    if (row.mediaId) {
      const post = map.get(blogId);
      post.media.push({
        id: row.mediaId,
        url: row.mediaUrl,
        type: row.mediaType, // 'image' | 'video'
      });
    }
  }

  return Array.from(map.values());
}
export async function deleteBlog(formData: FormData) {
  const pool = await connectDB();
  const id = Number(formData.get("blogId"));
  if (!id) throw new Error("blogId is required");

  // xóa media
  await pool.request()
    .input("blogId", sql.Int, id)
    .query(`DELETE FROM BlogMedia WHERE blogId = @blogId`);

  // xóa blog
  await pool.request()
    .input("id", sql.Int, id)
    .query(`DELETE FROM Blogs WHERE id = @id`);

  revalidatePath("/(private)/(user)");
}

export default async function buildCommentTree(comments: any[], userLikedCommentIds: Set<number>, commentLikeCounts: Map<number, number>) {
  const map = new Map();
  const roots: any[] = [];

  comments.forEach((c) => {
    map.set(c.id, {
      id: String(c.id),
      author: c.fullName || c.username || "User",
      avatar: c.imgUrl || "",
      content: c.text,
      timestamp: new Date(c.createdAt).toLocaleString("vi-VN"),
      likes: commentLikeCounts.get(c.id) || 0, // Lấy số like comment từ DB
      isLiked: userLikedCommentIds.has(c.id),  // Check user đã like comment chưa
      replies: [],
      parentId: c.parentId,
    });
  });

  map.forEach((node) => {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) {
        node.replyTo = parent.author;
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export async function toggleLike(blogId: number, userId: number) {
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
}

// 2. Like Comment
export async function toggleCommentLike(commentId: number, userId: number) {
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
}

export async function addComment(blogId: number, userId: number, text: string, parentId?: number) {
  if (!userId) throw new Error("User ID required");
  if (!text || !text.trim()) return;

  const pool = await connectDB();
  await pool.request()
    .input("userId", sql.Int, userId).input("blogId", sql.Int, blogId)
    .input("text", sql.NVarChar(sql.MAX), text).input("parentId", sql.Int, parentId || null)
    .query(`INSERT INTO Comments (userId, blogId, text, parentId) VALUES (@userId, @blogId, @text, @parentId)`);
  revalidatePath(FEED_PATH);
}
