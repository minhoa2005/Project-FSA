"use server";

import fs from "fs/promises";
import path from "path";
import { connectDB, sql } from "@/config/db";
import { revalidatePath } from "next/cache";
import { removeVietnameseSigns } from "@/lib/formatter";
import { verifyUser } from "./personalInfo";
import { verifyToken } from "@/config/jwt";
import { getCookie } from "@/config/cookie";

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

    if (!creatorId) return { success: false, message: "creatorId is required" };

    const result = await pool.request()
      .input("text", sql.NVarChar(sql.MAX), text)
      .input("creatorId", sql.Int, creatorId)
      .query(`INSERT INTO Blogs(text, creatorId) OUTPUT inserted.id VALUES (@text, @creatorId)`);

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
        const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "other";

        await pool.request()
          .input("blogId", sql.Int, blogId)
          .input("url", sql.VarChar(255), publicUrl)
          .input("type", sql.VarChar(20), type)
          .query("INSERT INTO BlogMedia(blogId, mediaUrl, mediaType) VALUES (@blogId, @url, @type)");
      }
    }
    revalidatePath(FEED_PATH);
    return { success: true, message: "Blog created successfully" };
  } catch (error) {
    console.error("[createBlog] Error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed" };
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
    const removeIds = removeIdsRaw.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

    if (!blogId) return { success: false, message: "blogId is required" };

    await pool.request()
      .input("id", sql.Int, blogId)
      .input("text", sql.NVarChar(sql.MAX), text)
      .query("UPDATE Blogs SET text = @text, updatedAt = GETDATE() WHERE id = @id");

    if (removeIds.length > 0) {
      await pool.request().query(`DELETE FROM BlogMedia WHERE id IN (${removeIds.join(",")})`);
    }

    const newMedia = formData.getAll("newMedia") as File[];
    if (newMedia.length > 0) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      for (const file of newMedia) {
        if (!file || file.size === 0) continue;
        const bytes = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${removeVietnameseSigns(file.name).replace(/\s+/g, "-")}`;
        await fs.writeFile(path.join(UPLOAD_DIR, fileName), bytes);
        const publicUrl = `/uploads/${fileName}`;
        const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "other";
        await pool.request()
          .input("blogId", sql.Int, blogId)
          .input("url", sql.VarChar(255), publicUrl)
          .input("type", sql.VarChar(20), type)
          .query("INSERT INTO BlogMedia(blogId, mediaUrl, mediaType) VALUES (@blogId, @url, @type)");
      }
    }
    revalidatePath(FEED_PATH);
    return { success: true };
  } catch (error) {
    console.error("[updateBlog] Error:", error);
    return { success: false, message: "Failed" };
  }
}

// ==========================================
// 3. DELETE BLOG
// ==========================================
export async function deleteBlog(formData: FormData) {
  const pool = await connectDB();

  const blogId = Number(formData.get("blogId"));
  if (!blogId) throw new Error("blogId is required");

  await pool
    .request()
    .input("id", sql.Int, blogId)
    .query(`
      UPDATE Blogs 
      SET isDeleted = 1, updatedAt = GETDATE()
      WHERE id = @id
    `);

  // Nếu bạn đang dùng revalidatePath
  // revalidatePath("/(private)/(user)");

  return { success: true };
}


// ==========================================
// HELPER: BUILD TREE
// ==========================================
function buildCommentTree(comments: any[], userLikedCommentIds: Set<number>, commentLikeCounts: Map<number, number>) {
  try {
    const map = new Map();
    const roots: any[] = [];

    comments.forEach((c) => {
      map.set(c.id, {
        id: String(c.id),
        userId: c.userId, // Cần thiết để check quyền
        author: c.fullName || c.username || "User",
        avatar: c.imgUrl || "",
        content: c.text,
        timestamp: new Date(c.createdAt).toLocaleString("vi-VN"),
        createdAtRaw: c.createdAt,
        likes: commentLikeCounts.get(c.id) || 0,
        isLiked: userLikedCommentIds.has(c.id),
        replies: [],
        parentId: c.parentId,
        replyTo: undefined,
        isHidden: c.isHidden || false // Cần thiết để ẩn/hiện
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

// ==========================================
// 4. GET BLOGS
// ==========================================
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
      WHERE b.isDeleted = 0
      ORDER BY b.createdAt DESC, m.id ASC
    `);

    const likesCountResult = await pool.request().query(`SELECT blogId, COUNT(*) as count FROM [Like] GROUP BY blogId`);
    const likesMap = new Map<number, number>();
    likesCountResult.recordset.forEach((r: any) => likesMap.set(r.blogId, r.count));

    // UPDATE: Select thêm userId, isHidden
    const commentsResult = await pool.request().query(`
      SELECT c.id, c.blogId, c.text, c.createdAt, c.parentId, c.isHidden, c.userId,
             up.fullName, up.imgUrl, a.username
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

// ... (toggleLike, toggleCommentLike giữ nguyên) ...
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

// ==========================================
// 5. ADD COMMENT
// ==========================================
export async function addComment(blogId: number, userId: number, text: string, parentId?: number) {
  try {
    if (!userId) throw new Error("User ID required");
    if (!text || !text.trim()) return null;

    const validParentId = (parentId && !isNaN(parentId)) ? parentId : null;
    const pool = await connectDB();

    const insertResult = await pool.request()
      .input("userId", sql.Int, userId)
      .input("blogId", sql.Int, blogId)
      .input("text", sql.NVarChar(sql.MAX), text)
      .input("parentId", sql.Int, validParentId)
      .query(`INSERT INTO Comments (userId, blogId, text, parentId) OUTPUT inserted.id VALUES (@userId, @blogId, @text, @parentId)`);

    const newCommentId = insertResult.recordset[0].id;

    const fullCommentResult = await pool.request()
      .input("id", sql.Int, newCommentId)
      .query(`
        SELECT c.id, c.text, c.createdAt, c.parentId, c.isHidden, c.userId,
               up.fullName, up.imgUrl, a.username
        FROM Comments c
        LEFT JOIN UserProfile up ON up.accountId = c.userId
        LEFT JOIN Account a ON a.id = c.userId
        WHERE c.id = @id
      `);

    const raw = fullCommentResult.recordset[0];
    revalidatePath(FEED_PATH);
    revalidatePath("/");

    return {
      success: true,
      data: {
        id: String(raw.id),
        userId: raw.userId,
        author: raw.fullName || raw.username || "Bạn",
        avatar: raw.imgUrl || "",
        content: raw.text,
        timestamp: new Date(raw.createdAt).toLocaleString("vi-VN"),
        createdAtRaw: raw.createdAt,
        likes: 0,
        isLiked: false,
        replies: [],
        parentId: raw.parentId,
        replyTo: undefined,
        isHidden: raw.isHidden || false
      }
    };
  } catch (error) {
    console.error("[addComment] Error:", error);
    return { success: false, error };
  }
}

// ==========================================
// 6. EDIT COMMENT (FINAL)
// ==========================================
export async function editComment(commentId: number, userId: number, newText: string) {
  try {
    console.log(`[editComment] Check - CommentID: ${commentId}, RequestUserID: ${userId}`);

    if (!userId) throw new Error("User ID required");
    if (!newText || !newText.trim()) return { success: false, message: "Text empty" };

    const pool = await connectDB();

    // 1. Check Owner
    const checkOwner = await pool.request()
      .input("id", sql.Int, commentId)
      .query("SELECT userId FROM Comments WHERE id = @id");

    if (checkOwner.recordset.length === 0) return { success: false, message: "Comment not found" };

    const ownerId = checkOwner.recordset[0].userId;

    if (Number(ownerId) !== Number(userId)) {
      console.error(`[editComment] Unauthorized: Owner ${ownerId} vs Request ${userId}`);
      return { success: false, message: "Unauthorized" };
    }

    // 2. Update (Try-catch riêng cho SQL để bắt lỗi thiếu cột)
    try {
      await pool.request()
        .input("id", sql.Int, commentId)
        .input("text", sql.NVarChar(sql.MAX), newText)
        .query("UPDATE Comments SET text = @text, updatedAt = GETDATE() WHERE id = @id");
    } catch (sqlError: any) {
      console.error("[editComment] SQL Error:", sqlError);
      if (sqlError.message.includes("Invalid column name 'updatedAt'")) {
        return { success: false, message: "Lỗi Server: Thiếu cột updatedAt trong DB" };
      }
      throw sqlError;
    }

    revalidatePath(FEED_PATH);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[editComment] System Error:", error);
    return { success: false, message: "Failed to edit" };
  }
}

// ==========================================
// 7. TOGGLE HIDE COMMENT
// ==========================================
export async function toggleHideComment(commentId: number, userId: number) {
  try {
    if (!userId) throw new Error("User ID required");
    const pool = await connectDB();

    const checkOwner = await pool.request()
      .input("id", sql.Int, commentId)
      .query("SELECT userId, isHidden FROM Comments WHERE id = @id");

    if (checkOwner.recordset.length === 0) return { success: false, message: "Comment not found" };

    const commentData = checkOwner.recordset[0];

    if (Number(commentData.userId) !== Number(userId)) {
      return { success: false, message: "Unauthorized" };
    }

    const newStatus = !commentData.isHidden;

    try {
      await pool.request()
        .input("id", sql.Int, commentId)
        .input("isHidden", sql.Bit, newStatus)
        .query("UPDATE Comments SET isHidden = @isHidden WHERE id = @id");
    } catch (sqlError: any) {
      console.error("[toggleHide] SQL Error:", sqlError);
      return { success: false, message: "Lỗi Server: Thiếu cột isHidden trong DB" };
    }

    revalidatePath(FEED_PATH);
    revalidatePath("/");
    return { success: true, isHidden: newStatus };
  } catch (error) {
    console.error("[toggleHideComment] Error:", error);
    return { success: false, message: "Failed to toggle hide" };
  }
}

export const getPersonalBlogs = async (userId: number, page: number = 1) => {
  try {
    const pool = await connectDB();
    const offset = (page - 1) * 5
    const blogsResult = await pool.request().input("userId", userId).input("offset", offset).query(`
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
            m.mediaType,
            ISNULL(lc.likeCount, 0) AS likeCount,
            ISNULL(cc.commentCount, 0) AS commentCount
        FROM
            Blogs b
        LEFT JOIN
            UserProfile up ON up.accountId = b.creatorId
        LEFT JOIN
            Account a ON a.id = b.creatorId
        LEFT JOIN
            BlogMedia m ON m.blogId = b.id
        LEFT JOIN
            (
                SELECT
                    blogId,
                    COUNT(userId) AS likeCount
                FROM
                    [Like]
                GROUP BY
                    blogId
            ) lc ON lc.blogId = b.id
        LEFT JOIN
            (
              SELECT 
                blogId,
                COUNT(id) AS commentCount
              FROM 
                Comments
              GROUP BY 
                blogId
            ) cc ON cc.blogId = b.id
        WHERE
            b.creatorId = @userId
        ORDER BY
            b.createdAt DESC,
            m.id ASC
        OFFSET @offset ROWS FETCH NEXT 5 ROWS ONLY
      `);
    const blogMap = new Map<number, any>();
    console.log(blogsResult.recordset);
    blogsResult.recordset.forEach((row: any) => {
      const blogId = row.blogId;
      if (!blogMap.has(blogId)) {
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
          likeCount: row.likeCount,
          commentCount: row.commentCount,
          shares: 0,
        });
      }
      if (row.mediaId) {
        if (!blogMap.get(blogId).media) {
          blogMap.get(blogId).media = [];
        }
        blogMap.get(blogId).media.push({
          id: row.mediaId,
          url: row.mediaUrl,
          mediaType: row.mediaType
        });
      }
    })
    const likes = await pool.request().input("userId", userId).query(`
        Select blogId from [Like] where userId = @userId
      `);
    likes.recordset.forEach((like: any) => {
      const blog = blogMap.get(like.blogId);
      if (blog) {
        blog.isLikedByCurrentUser = true;
      }
    });
    return {
      success: true,
      data: blogMap.size > 0 ? Array.from(blogMap.values()) : []
    }
  }
  catch (error) {
    console.error("[getPersonalBlogs] Error:", error);
    return { success: false, message: "Xảy ra lỗi khi lấy bài viết" };
  }
}

export const getCommentsByBlogId = async (blogId: number) => {
  try {
    const pool = await connectDB();
    const user = verifyToken(await getCookie());
    const commentsResult = await pool.request().input("blogId", blogId).query(
      `
    SELECT
    c.id,
      c.blogId,
      c.text,
      c.createdAt,
      c.parentId,
      c.isHidden,
      c.userId,
      up.fullName,
      up.imgUrl,
      a.username,
      ISNULL(clc.likeCount, 0) AS likeCount
    FROM
            Comments c
        LEFT JOIN
            UserProfile up ON up.accountId = c.userId
        LEFT JOIN
            Account a ON a.id = c.userId
        LEFT JOIN
      (
        --Subquery to calculate the total likes for each comment
                SELECT
                    commentId,
        COUNT(userId) AS likeCount
    FROM
    CommentLikes
                GROUP BY
    commentId
            ) clc ON clc.commentId = c.id
        ORDER BY
c.createdAt ASC;
`
    );
    const commentLikesMap = new Map<number, number>();
    const userLikedCommentSet = new Set<number>();
    commentsResult.recordset.forEach((r: any) => commentLikesMap.set(r.id, r.likeCount));
    const userCommentLikes = await pool.request().input("uid", sql.Int, user.id)
      .query("SELECT commentId FROM CommentLikes WHERE userId = @uid");
    userCommentLikes.recordset.forEach((r: any) => userLikedCommentSet.add(r.commentId));
    const comments = buildCommentTree(commentsResult.recordset, userLikedCommentSet, commentLikesMap)
    return {
      comments
    }
  }
  catch (error) {
    console.error("[getCommentsByBlogId] Error:", error);
    return { success: false, message: "Xảy ra lỗi khi lấy bình luận" };
  }
}

// ==========================================
// GET BLOGS WITH SHARE SUPPORT (Thêm vào cuối file)
// ==========================================
export async function getBlogsWithShare(currentUserId?: number) {
  try {
    const pool = await connectDB();

    // Lấy tất cả blogs kèm thông tin share
    const blogsResult = await pool.request().query(`
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
        m.mediaType,
        bs.originalBlogId,
        bs.id AS shareId
      FROM Blogs b
      LEFT JOIN UserProfile up ON up.accountId = b.creatorId
      LEFT JOIN Account a ON a.id = b.creatorId
      LEFT JOIN BlogMedia m ON m.blogId = b.id
      LEFT JOIN BlogShares bs ON bs.blogId = b.id
      WHERE b.isDeleted = 0
      ORDER BY b.createdAt DESC, m.id ASC
    `);

    const likesCountResult = await pool.request().query(`
      SELECT blogId, COUNT(*) as count 
      FROM [Like] 
      GROUP BY blogId
    `);
    const likesMap = new Map<number, number>();
    likesCountResult.recordset.forEach((r: any) => likesMap.set(r.blogId, r.count));

    const commentsResult = await pool.request().query(`
      SELECT c.id, c.blogId, c.text, c.createdAt, c.parentId, c.isHidden, c.userId,
             up.fullName, up.imgUrl, a.username
      FROM Comments c
      LEFT JOIN UserProfile up ON up.accountId = c.userId
      LEFT JOIN Account a ON a.id = c.userId
      ORDER BY c.createdAt ASC
    `);

    const commentLikesCountResult = await pool.request().query(`
      SELECT commentId, COUNT(*) as count 
      FROM CommentLikes 
      GROUP BY commentId
    `);
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
          isShared: !!row.shareId,
          originalBlogId: row.originalBlogId || null,
        });
      }
      if (row.mediaId) {
        blogMap.get(blogId).media.push({ 
          id: row.mediaId, 
          url: row.mediaUrl, 
          type: row.mediaType 
        });
      }
    }

    // Lấy thông tin bài viết gốc cho các bài share
    const blogs = Array.from(blogMap.values());
    
    // Import getSharedBlogInfo từ shareActions
    const { getSharedBlogInfo } = await import("./shareActions");
    
    const blogsWithSharedData = await Promise.all(
      blogs.map(async (blog) => {
        if (blog.isShared && blog.originalBlogId) {
          const sharedData = await getSharedBlogInfo(blog.id);
          return {
            ...blog,
            sharedPostData: sharedData,
          };
        }
        return blog;
      })
    );

    return blogsWithSharedData;
  } catch (error) {
    console.error("[getBlogsWithShare] Error:", error);
    return [];
  }
}