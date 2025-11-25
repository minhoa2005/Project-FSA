// src/actions/commentActions.js
"use server";

import { connectDB } from "@/config/db";
import { revalidatePath } from "next/cache";
const pool = await connectDB()


export async function createComment(formData) {
  const userId = parseInt(session.user.id);
  const blogId = parseInt(formData.get("blogId"));
  const text = (formData.get("text") || "").trim();
  const parentId = formData.get("parentId")
    ? parseInt(formData.get("parentId"))
    : null;

  if (!text) {
    throw new Error("Nội dung bình luận không được để trống");
  }

  try {
    const result = await pool.request()
      .input('text', sql.NVarChar(sql.MAX), text)
      .input('userId', sql.Int, userId)
      .input('blogId', sql.Int, blogId)
      .input('parentId', parentId ? sql.Int : sql.Int, parentId)
      .query(`
        INSERT INTO Comments (text, userId, blogId, parentId, createdAt)
        OUTPUT 
          INSERTED.id,
          INSERTED.text,
          INSERTED.createdAt,
          A.username,
          ISNULL(UP.fullName, A.username) AS fullName,
          UP.imgUrl
        VALUES (@text, @userId, @blogId, @parentId, GETDATE());

        -- Lấy thông tin user kèm profile
        SELECT 
          c.id, c.text, c.createdAt,
          a.username,
          ISNULL(up.fullName, a.username) AS fullName,
          up.imgUrl
        FROM Comments c
        JOIN Account a ON c.userId = a.id
        LEFT JOIN UserProfile up ON a.id = up.accountId
        WHERE c.id = SCOPE_IDENTITY();
      `);

    const newComment = result.recordset[0];

    revalidatePath(`/blogs/${blogId}`);
    // hoặc revalidatePath(`/users/some-page`) nếu cần

    return {
      id: newComment.id,
      text: newComment.text,
      createdAt: newComment.createdAt,
      user: {
        username: newComment.username,
        UserProfile: {
          fullName: newComment.fullName,
          imgUrl: newComment.imgUrl || null
        }
      },
      children: []
    };

  } catch (error) {
    console.error("Lỗi tạo bình luận:", error);
    throw new Error("Không thể gửi bình luận. Vui lòng thử lại!");
  }
}