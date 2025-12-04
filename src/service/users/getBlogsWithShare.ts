"use server";

import { connectDB, sql } from "@/config/db";
import { getSharedBlogInfo } from "./shareActions";

// Helper function giữ nguyên
function buildCommentTree(comments: any[], userLikedCommentIds: Set<number>, commentLikeCounts: Map<number, number>) {
  try {
    const map = new Map();
    const roots: any[] = [];

    comments.forEach((c) => {
      map.set(c.id, {
        id: String(c.id),
        userId: c.userId,
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
        isHidden: c.isHidden || false
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
// GET BLOGS WITH SHARE SUPPORT
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