"use server"
import { getCookie } from "@/config/cookie";
import { connectDB, sql } from "@/config/db";
import { verifyToken } from "@/config/jwt";
import { verifyUser } from "./personalInfo";
const pool = await connectDB();

export async function getFollowingUsers(offset, limit) {
  if (!await verifyUser()) {
    unauthorized();
  }
  const token = await getCookie();
  const decoded = verifyToken(token);
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

export async function insertMessage(receiverId, text, type) {
  try {
    const token = await getCookie();
    const decoded = verifyToken(token);
    const senderId = decoded.id;

    const id1 = Math.min(senderId, receiverId);
    const id2 = Math.max(senderId, receiverId);
    const roomId = `${id1}_${id2}`;

    const msgType = type && type !== "" ? type : "text"; // default type


    const result = await pool
      .request()
      .input("senderId", sql.Int, senderId)
      .input("receiverId", sql.Int, receiverId)
      .input("roomId", sql.VarChar, roomId)
      .input("text", sql.NVarChar, text)
      .input("type", sql.VarChar, msgType)
      .query(`
        INSERT INTO Messages (senderId, receiverId, roomId, text, type, createdAt)
        OUTPUT INSERTED.id, INSERTED.createdAt
        VALUES (@senderId, @receiverId, @roomId, @text, @type, GETDATE());
      `);

    return {
      id: result.recordset[0].id,
      senderId,
      receiverId,
      roomId,
      text,
      type: msgType,
      createdAt: result.recordset[0].createdAt,
    };
  } catch (err) {
    console.error("INSERT MESSAGE ERROR:", err);
    return { success: false };
  }
}

export async function getMessagesByFollowing(receiverId) {
  try {
    const token = await getCookie();
    const decoded = verifyToken(token);
    const senderId = decoded.id;

    // Tạo roomId tự động
    const id1 = Math.min(senderId, receiverId);
    const id2 = Math.max(senderId, receiverId);
    const roomId = `${id1}_${id2}`;

    // Lấy tất cả tin nhắn trong roomId
    const result = await pool
      .request()
      .input("roomId", sql.VarChar, roomId)
      .query(`
      SELECT 
      id,
      senderId,
      receiverId,
      roomId,
      text,
      type,        -- thêm dòng này
      createdAt
      FROM Messages
      WHERE roomId = @roomId
      ORDER BY createdAt ASC
  `);

    return {
      roomId,                 // trả luôn roomId cho frontend
      messages: result.recordset
    };
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    return {
      roomId: "",
      messages: []
    };
  }
}