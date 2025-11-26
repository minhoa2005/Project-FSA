"use server";

import fs from "fs/promises";
import path from "path";
import { connectDB, sql } from "@/config/db";
import { revalidatePath } from "next/cache";
import { removeVietnameseSigns } from "@/lib/formatter";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const FEED_PATH = "/(private)/(user)";

export async function createBlog(formData: FormData) {
  try {
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
      if (!file || file.size > 100 * 1024 * 1024) {
        return {
          success: false, message: "File vượt quá kích thước cho phép 100MB"
        }
      }

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
    return {
      success: true
    }
  } catch (error) {
    console.error("Error in createBlog:", error);
    return {
      success: false, message: "Lỗi hệ thống, vui lòng thử lại sau"
    }
  }

}
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
      if (!file || file.size > 100 * 1024 * 1024) {
        return {
          success: false, message: "File vượt quá kích thước cho phép 100MB"
        }
      };

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
    return { success: true };
  } catch (error) {
    console.error("Error in updateBlog:", error);
    return {
      success: false, message: "Lỗi hệ thống, vui lòng thử lại sau"
    }
  }
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
