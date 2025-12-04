
"use server";  
import { connectDB } from '@/config/db'; 

export type UserResult = {
  id: number;
  username: string;
  fullName: string;
  avatar: string | null;
};

export type PostResult = {
  id: number;
  text: string;
  createdAt: string;
  creatorUsername: string;
  creatorAvatar: string | null;
  likeCount: number;
  commentCount: number;
};

export type SearchResult = {
  users: UserResult[];
  posts: PostResult[];
};

export async function searchEverything(query: string): Promise<SearchResult> {
  const q = query.trim();

  if (q.length < 2) {
    return { users: [], posts: [] };
  }

  const likeTerm = `%${q}%`;
  const likeExact = `${q}%`;

  try {
    const pool = await connectDB();
    if (!pool) throw new Error("DB not connected");

    const request = pool.request();

    const userSql = `
      SELECT TOP 8
        a.id,
        a.username,
        ISNULL(up.fullName, a.username) AS fullName,
        up.imgUrl AS avatar
      FROM Account a
      LEFT JOIN UserProfile up ON a.id = up.accountId
      WHERE a.isActive = 1
        AND (a.username LIKE '${likeTerm}' OR ISNULL(up.fullName, '') LIKE '${likeTerm}')
      ORDER BY 
        CASE WHEN a.username LIKE '${likeExact}' THEN 0 ELSE 1 END,
        a.username
    `;

    const postSql = `
      SELECT TOP 10
        b.id,
        b.text,
        b.createdAt,
        a.username AS creatorUsername,
        up.imgUrl AS creatorAvatar,
        ISNULL(l.cnt, 0) AS likeCount,
        ISNULL(c.cnt, 0) AS commentCount
      FROM Blogs b
      JOIN Account a ON b.creatorId = a.id
      LEFT JOIN UserProfile up ON a.id = up.accountId
      LEFT JOIN (SELECT blogId, COUNT(*) cnt FROM [Like] GROUP BY blogId) l ON l.blogId = b.id
      LEFT JOIN (SELECT blogId, COUNT(*) cnt FROM Comments GROUP BY blogId) c ON c.blogId = b.id
      WHERE b.text LIKE '${likeTerm}'
      ORDER BY b.createdAt DESC
    `;

    const userResult = await request.query(userSql);
    const postResult = await request.query(postSql);

    return {
      users: userResult.recordset.map(r => ({
        id: r.id,
        username: r.username,
        fullName: r.fullName,
        avatar: r.avatar || null,
      })),
      posts: postResult.recordset.map(r => ({
        id: r.id,
        text: r.text || '',
        createdAt: r.createdAt.toISOString(),
        creatorUsername: r.creatorUsername,
        creatorAvatar: r.creatorAvatar,
        likeCount: Number(r.likeCount),
        commentCount: Number(r.commentCount),
      })),
    };
  } catch (error: any) {
    console.error('Search error:', error);
    return { users: [], posts: [] };
  }
}