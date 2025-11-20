"use server";
import { getCookie } from "@/config/cookie";
import { connectDB, sql } from "@/config/db";
import { verifyToken } from "@/config/jwt";
const pool = await connectDB();

export async function getFollowingUsers( offset, limit) {
  const token = await getCookie();
  const decoded  = verifyToken(token);
  const userId = decoded.id;
  const result = await pool
    .request()
    .input("userId", userId)
    .input("offset", offset)
    .input("limit", limit)
    .query(`
      SELECT a.id, a.username, a.email , u.imgUrl
      FROM Follow f
      JOIN Account a ON f.followingId = a.id
      JOIN UserProfile u ON u.accountId = a.id
      WHERE f.followerId = @userId
      ORDER BY a.id
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

  return result.recordset;
}